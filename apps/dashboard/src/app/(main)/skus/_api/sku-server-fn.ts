'use server';

import type {
  ProductSkuCreateDto,
  ProductSkuUpdateDto,
  Contract,
} from '@sneakers-store/contracts';
import type { ClientInferRequest } from '@ts-rest/core';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getClient } from '~/shared/api';

const client = getClient();
const redirectTo = '/skus';

type ParsedFormData =
  | ({ _action: 'create' } & ProductSkuCreateDto)
  | ({ _action: 'edit' } & ProductSkuUpdateDto);

export async function createProductSku(prev: unknown, formData: FormData) {
  const data = Object.fromEntries(formData) as unknown as ParsedFormData;
  console.log(`🚀 -> createProductSku -> data:`, data);
  const cookie = await cookies();

  if (data._action === 'create') {
    const { body } = await client.productSkus.createProductSku({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      body: {
        ...data,
        sizeId: data.sizeId || null,
        name: data.name || null,
        slug: data.slug || null,
        stockQty: data.stockQty || 0,
        basePrice: data.basePrice || 0,
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
        name: data.name || null,
        slug: data.slug || null,
        stockQty: data.stockQty || 0,
        basePrice: data.basePrice || 0,
        isActive: formData.get('isActive') === 'true',
      },
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(`${redirectTo}/${productSkuId}`);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors,
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
  return body.data;
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
