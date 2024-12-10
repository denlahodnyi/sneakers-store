'use server';

import type {
  Contract,
  ProductVariantCreateDto,
  ProductVariantUpdateDto,
} from '@sneakers-store/contracts';
import type { ClientInferRequest } from '@ts-rest/core';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getClient } from '~/shared/api';

const client = getClient();

type ParsedFormData =
  | ({ _action: 'create' } & ProductVariantCreateDto)
  | ({ _action: 'edit' } & ProductVariantUpdateDto);

export async function createProductVariant(prev: unknown, formData: FormData) {
  const data = Object.fromEntries(formData) as unknown as ParsedFormData;
  const cookie = await cookies();

  if (data._action === 'create') {
    const { body } = await client.productVariants.createProductVariant({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      body: {
        ...data,
        previewImg: data.previewImg || null,
        thumbnailImg: data.thumbnailImg || null,
        smallImg: data.smallImg || null,
        largeImg: data.largeImg || null,
      },
    });

    if (body.status === 'success') {
      revalidatePath('/product-variants');
      revalidatePath(`/products/${data.productId}`);
      redirect(`/products/${data.productId}`);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot create product variant', {
        cause: body,
      });
    }
  }
  if (data._action === 'edit') {
    const productVarId = data.id;
    const { body } = await client.productVariants.updateProductVariant({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      params: { productVarId },
      body: {
        ...data,
        id: productVarId,
        previewImg: data.previewImg || null,
        thumbnailImg: data.thumbnailImg || null,
        smallImg: data.smallImg || null,
        largeImg: data.largeImg || null,
      },
    });

    if (body.status === 'success') {
      revalidatePath('/product-variants');
      revalidatePath(`/products/${data.productId}`);
      redirect(`/products/${data.productId}`);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot update product variant', {
        cause: body,
      });
    }
  }
}

export async function getProductVariants(
  query?: ClientInferRequest<
    Contract['productVariants']['getProductVariants']
  >['query'],
) {
  const { body } = await client.productVariants.getProductVariants({
    query: query || null,
  });
  return body.data;
}

export async function getProductVariant(productVarId: string) {
  const { body } = await client.productVariants.getProductVariantById({
    params: { productVarId },
  });
  if (body.status === 'success') return body.data;
  else
    throw new Error(body.message || 'Cannot get product variant', {
      cause: body,
    });
}

export async function deleteProductVariant(productVarId: string) {
  const cookie = await cookies();
  const { body } = await client.productVariants.deleteProductVariant({
    extraHeaders: { Cookie: cookie.toString() },
    params: { productVarId },
  });
  if (body.status === 'success') {
    revalidatePath('/product-variants');
    redirect('/product-variants');
  } else {
    throw new Error(body.message || 'Cannot delete product variant', {
      cause: body,
    });
  }
}

export async function bulkDeleteProductVariant(ids: string[]) {
  const cookie = await cookies();
  const { body } = await client.productVariants.deleteProductVariants({
    extraHeaders: { Cookie: cookie.toString() },
    body: { ids },
  });
  if (body.status === 'success') {
    revalidatePath('/product-variants');
    redirect('/product-variants');
  } else {
    throw new Error(body.message || 'Cannot delete product variants', {
      cause: body,
    });
  }
}
