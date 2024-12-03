'use server';

import type { BrandCreateDto, BrandUpdateDto } from '@sneakers-store/contracts';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getClient } from '~/shared/api';

const client = getClient();
const redirectTo = '/brands';

type ParsedFormData =
  | ({ _action: 'create' } & BrandCreateDto)
  | ({ _action: 'edit' } & BrandUpdateDto);

export async function createBrand(prev: unknown, formData: FormData) {
  const data = Object.fromEntries(formData) as unknown as ParsedFormData;
  const cookie = await cookies();

  if (data._action === 'create') {
    const { body } = await client.brands.createBrand({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      body: {
        ...data,
        iconUrl: data.iconUrl || null,
        isActive: formData.get('isActive') === 'true',
      },
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(redirectTo);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors,
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
        iconUrl: data.iconUrl || null,
        isActive: formData.get('isActive') === 'true',
        id: brandId,
      },
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(`${redirectTo}/${brandId}`);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot update brand', {
        cause: body,
      });
    }
  }
}

export async function getBrands() {
  const { body } = await client.brands.getBrands();
  return body.data;
}

export async function getBrand(brandId: string) {
  const { body } = await client.brands.getBrandById({
    params: { brandId },
  });
  if (body.status === 'success') return body.data;
  else throw new Error(body.message || 'Cannot get brand', { cause: body });
}

export async function deleteBrand(brandId: string) {
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

export async function bulkDeleteBrand(ids: string[]) {
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
