'use server';

import {
  type ProductSkuUpdateDto,
  type Contract,
  type inferDtoErrors,
  type ProductSkuCreateDto,
  PRICE_MINOR_UNITS,
} from '@sneakers-store/contracts';
import type { ClientInferRequest } from '@ts-rest/core';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { SkuSchema } from '~/entities/sku';
import { getClient } from '~/shared/api';

const client = getClient();
const redirectTo = '/skus';

type Data =
  | ({ _action: 'create' } & SkuSchema)
  | ({ _action: 'edit'; id: string } & SkuSchema);

export async function createProductSku(prev: unknown, data: Data) {
  const cookie = await cookies();

  if (data._action === 'create') {
    const { body } = await client.productSkus.createProductSku({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      body: {
        ...data,
        sizeId: data.sizeId || null,
        stockQty: data.stockQty || 0,
        basePrice: (data.basePrice || 0) * PRICE_MINOR_UNITS,
      },
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(redirectTo);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors as inferDtoErrors<ProductSkuCreateDto>,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot create sku', {
        cause: body,
      });
    }
  }
  if (data._action === 'edit') {
    const productSkuId = data.id;
    const { body } = await client.productSkus.updateProductSku({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      params: { productSkuId },
      body: {
        ...data,
        id: productSkuId,
        sizeId: data.sizeId || null,
        stockQty: data.stockQty || 0,
        basePrice: (data.basePrice || 0) * PRICE_MINOR_UNITS,
      },
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(`${redirectTo}/${productSkuId}`);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors as inferDtoErrors<ProductSkuUpdateDto>,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot update sku', {
        cause: body,
      });
    }
  }
}

export async function getProductSkus(
  query?: ClientInferRequest<
    Contract['productSkus']['getProductSkus']
  >['query'],
) {
  const { body } = await client.productSkus.getProductSkus({
    query: query || null,
  });
  if (body.status === 'success') return body.data;
  throw new Error(body.message || 'Cannot get product skus', {
    cause: body,
  });
}

export async function getProductSku(productSkuId: string) {
  const { body } = await client.productSkus.getProductSkuById({
    params: { productSkuId },
  });
  if (body.status === 'success') return body.data;
  else throw new Error(body.message || 'Cannot get sku', { cause: body });
}

export async function deleteProductSku(productSkuId: string) {
  const cookie = await cookies();
  const { body } = await client.productSkus.deleteProductSku({
    extraHeaders: { Cookie: cookie.toString() },
    params: { productSkuId },
  });
  if (body.status === 'success') {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  } else {
    throw new Error(body.message || 'Cannot delete sku', { cause: body });
  }
}

export async function bulkDeleteProductSku(ids: string[]) {
  const cookie = await cookies();
  const { body } = await client.productSkus.deleteProductSkus({
    extraHeaders: { Cookie: cookie.toString() },
    body: { ids },
  });
  if (body.status === 'success') {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  } else {
    throw new Error(body.message || 'Cannot delete product skus', {
      cause: body,
    });
  }
}
