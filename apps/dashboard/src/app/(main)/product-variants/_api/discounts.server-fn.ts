'use server';
import {
  PRICE_MINOR_UNITS,
  type Contract,
  type DiscountCreateDto,
  type inferDtoErrors,
} from '@sneakers-store/contracts';
import type { ClientInferRequest } from '@ts-rest/core';
import { cookies } from 'next/headers';

import { type DiscountSchema } from '~/entities/discount';
import { getClient } from '~/shared/api';

const client = getClient();

type Data =
  | ({ _action: 'create' } & DiscountSchema)
  | ({ _action: 'edit'; id: string } & DiscountSchema);

export async function createOrUpdateDiscount(prev: unknown, data: Data) {
  const cookie = await cookies();

  if (data._action === 'create') {
    const { body } = await client.discount.createDiscount({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      body: {
        ...data,
        discountValue:
          data.discountType === 'FIXED'
            ? data.discountValue * PRICE_MINOR_UNITS
            : data.discountValue,
      },
    });

    if (body.status === 'success') {
      return { success: true };
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors as inferDtoErrors<DiscountCreateDto>,
        _ts: Date.now().valueOf(),
      };
    }

    throw new Error(body.message || 'Cannot create discount', {
      cause: body,
    });
  }

  if (data._action === 'edit') {
    const { body } = await client.discount.updateDiscount({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      params: { discountId: data.id },
      body: {
        ...data,
        discountValue:
          data.discountType === 'FIXED'
            ? data.discountValue * PRICE_MINOR_UNITS
            : data.discountValue,
      },
    });

    if (body.status === 'success') {
      return { success: true };
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors as inferDtoErrors<DiscountCreateDto>,
        _ts: Date.now().valueOf(),
      };
    }

    throw new Error(body.message || 'Cannot create discount', {
      cause: body,
    });
  }
}

export async function getDiscounts(
  query?: ClientInferRequest<Contract['discount']['getDiscounts']>['query'],
) {
  const { body } = await client.discount.getDiscounts({ query: query || null });
  if (body.status === 'success') return body.data;
  throw new Error(body.message || 'Cannot get discounts', {
    cause: body,
  });
}

export async function getDiscount(discountId: string) {
  const { body } = await client.discount.getDiscountById({
    params: { discountId },
  });
  if (body.status === 'success') return body.data;
  else
    throw new Error(body.message || 'Cannot get discount', {
      cause: body,
    });
}

export async function deleteDiscount(discountId: string) {
  const cookie = await cookies();
  const { body } = await client.discount.deleteDiscount({
    extraHeaders: { Cookie: cookie.toString() },
    params: { discountId },
  });
  if (body.status === 'success') {
    return { success: true };
  } else {
    throw new Error(body.message || 'Cannot delete discount', {
      cause: body,
    });
  }
}
