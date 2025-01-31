'use server';

import type {
  CategoryCreateDto,
  CategoryUpdateDto,
  Contract,
  inferDtoErrors,
} from '@sneakers-store/contracts';
import type { ClientInferRequest } from '@ts-rest/core';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { CategorySchema } from '~/entities/category';
import { getClient } from '~/shared/api';

const client = getClient();
const redirectTo = '/categories';

type Data =
  | ({ _action: 'create' } & CategorySchema)
  | ({ _action: 'edit'; id: number } & CategorySchema);

export async function createCategory(prev: unknown, data: Data) {
  const cookie = await cookies();

  if (data._action === 'create') {
    const { body } = await client.categories.createCategory({
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
        errors: body.errors as inferDtoErrors<CategoryCreateDto>,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot create category', {
        cause: body,
      });
    }
  }
  if (data._action === 'edit') {
    const categoryId = data.id;
    const { body } = await client.categories.updateCategory({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      params: { categoryId },
      body: data,
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(`${redirectTo}/${categoryId}`);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors as inferDtoErrors<CategoryUpdateDto>,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot update category', {
        cause: body,
      });
    }
  }
}

export async function getCategories(
  query?: ClientInferRequest<Contract['categories']['getCategories']>['query'],
) {
  const { body } = await client.categories.getCategories({
    query: query || null,
  });
  return body.data;
}

export async function getCategory(categoryId: number) {
  const { body } = await client.categories.getCategoryById({
    params: { categoryId },
  });
  if (body.status === 'success') return body.data;
  else throw new Error(body.message || 'Cannot get category', { cause: body });
}

export async function deleteCategory(categoryId: number) {
  const cookie = await cookies();
  const { body } = await client.categories.deleteCategory({
    extraHeaders: { Cookie: cookie.toString() },
    params: { categoryId },
  });
  if (body.status === 'success') {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  } else {
    throw new Error(body.message || 'Cannot delete category', { cause: body });
  }
}

export async function bulkDeleteCategory(ids: number[]) {
  const cookie = await cookies();
  const { body } = await client.categories.deleteCategories({
    extraHeaders: { Cookie: cookie.toString() },
    body: { ids },
  });
  if (body.status === 'success') {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  } else {
    throw new Error(body.message || 'Cannot delete categories', {
      cause: body,
    });
  }
}
