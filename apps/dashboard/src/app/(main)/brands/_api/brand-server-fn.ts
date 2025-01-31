'use server';

import type {
  BrandCreateDto,
  BrandUpdateDto,
  Contract,
  inferDtoErrors,
} from '@sneakers-store/contracts';
import type { ClientInferRequest } from '@ts-rest/core';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { BrandSchema } from '~/entities/brand';
import { getClient } from '~/shared/api';

const client = getClient();
const redirectTo = '/brands';

type Data =
  | ({ _action: 'create' } & BrandSchema)
  | ({ _action: 'edit'; id: number } & BrandSchema);

export async function createBrand(prev: unknown, data: Data) {
  const cookie = await cookies();

  if (data._action === 'create') {
    const { body } = await client.brands.createBrand({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      body: {
        ...data,
      },
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(redirectTo);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors as inferDtoErrors<BrandCreateDto>,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot create brand', {
        cause: body,
      });
    }
  }
  if (data._action === 'edit') {
    const brandId = data.id;
    const { body } = await client.brands.updateBrand({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      params: { brandId },
      body: {
        ...data,
        id: brandId,
      },
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(`${redirectTo}/${brandId}`);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors as inferDtoErrors<BrandUpdateDto>,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot update brand', {
        cause: body,
      });
    }
  }
}

export async function getBrands(
  query?: ClientInferRequest<Contract['brands']['getBrands']>['query'],
) {
  const { body } = await client.brands.getBrands({ query: query || null });
  return body.data;
}

export async function getBrand(brandId: number) {
  const { body } = await client.brands.getBrandById({
    params: { brandId },
  });
  if (body.status === 'success') return body.data;
  else throw new Error(body.message || 'Cannot get brand', { cause: body });
}

export async function deleteBrand(brandId: number) {
  const cookie = await cookies();
  const { body } = await client.brands.deleteBrand({
    extraHeaders: { Cookie: cookie.toString() },
    params: { brandId },
  });
  if (body.status === 'success') {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  } else {
    throw new Error(body.message || 'Cannot delete brand', { cause: body });
  }
}

export async function bulkDeleteBrand(ids: number[]) {
  const cookie = await cookies();
  const { body } = await client.brands.deleteBrands({
    extraHeaders: { Cookie: cookie.toString() },
    body: { ids },
  });
  if (body.status === 'success') {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  } else {
    throw new Error(body.message || 'Cannot delete brands', {
      cause: body,
    });
  }
}
