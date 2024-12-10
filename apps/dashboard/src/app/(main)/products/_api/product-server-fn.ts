'use server';

import type {
  ProductCreateDto,
  ProductUpdateDto,
} from '@sneakers-store/contracts';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getClient } from '~/shared/api';

const client = getClient();
const redirectTo = '/products';

type ParsedFormData =
  | ({ _action: 'create' } & ProductCreateDto)
  | ({ _action: 'edit' } & ProductUpdateDto);

export async function createProduct(prev: unknown, formData: FormData) {
  const data = Object.fromEntries(formData) as unknown as ParsedFormData;
  const cookie = await cookies();

  if (data._action === 'create') {
    const { body } = await client.products.createProduct({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      body: {
        ...data,
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
      body: {
        ...data,
        id: productId,
        isActive: formData.get('isActive') === 'true',
      },
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(`${redirectTo}/${productId}`);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot update product', {
        cause: body,
      });
    }
  }
}

export async function getProducts() {
  const { body } = await client.products.getProducts();
  return body.data;
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
