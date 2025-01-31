'use server';

import type {
  Contract,
  inferDtoErrors,
  ProductCreateDto,
  ProductUpdateDto,
} from '@sneakers-store/contracts';
import type { ClientInferRequest } from '@ts-rest/core';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { ProductSchema } from '~/entities/product';
import { getClient } from '~/shared/api';

const client = getClient();
const redirectTo = '/products';

type Data =
  | ({ _action: 'create' } & ProductSchema)
  | ({ _action: 'edit'; id: string } & ProductSchema);

export async function createProduct(prev: unknown, data: Data) {
  const cookie = await cookies();

  if (data._action === 'create') {
    const { body } = await client.products.createProduct({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      body: data,
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(redirectTo);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors as inferDtoErrors<ProductCreateDto>,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot create product', {
        cause: body,
      });
    }
  }
  if (data._action === 'edit') {
    const productId = data.id;
    const { body } = await client.products.updateProduct({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      params: { productId },
      body: data,
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(`${redirectTo}/${productId}`);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors as inferDtoErrors<ProductUpdateDto>,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot update product', {
        cause: body,
      });
    }
  }
}

export async function getProducts(
  query?: ClientInferRequest<Contract['products']['getProducts']>['query'],
) {
  const { body } = await client.products.getProducts({ query: query || null });
  if (body.status === 'success') return body.data;
  else throw new Error(body.message || 'Cannot get products', { cause: body });
}

export async function getProduct(productId: string) {
  const { body } = await client.products.getProductById({
    params: { productId },
  });
  if (body.status === 'success') return body.data;
  else throw new Error(body.message || 'Cannot get product', { cause: body });
}

export async function deleteProduct(productId: string) {
  const cookie = await cookies();
  const { body } = await client.products.deleteProduct({
    extraHeaders: { Cookie: cookie.toString() },
    params: { productId },
  });
  if (body.status === 'success') {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  } else {
    throw new Error(body.message || 'Cannot delete product', { cause: body });
  }
}

export async function bulkDeleteProduct(ids: string[]) {
  const cookie = await cookies();
  const { body } = await client.products.deleteProducts({
    extraHeaders: { Cookie: cookie.toString() },
    body: { ids },
  });
  if (body.status === 'success') {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  } else {
    throw new Error(body.message || 'Cannot delete products', {
      cause: body,
    });
  }
}
