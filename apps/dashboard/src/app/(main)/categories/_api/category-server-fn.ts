'use server';

import type {
  CategoryCreateDto,
  CategoryUpdateDto,
} from '@sneakers-store/contracts';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getClient } from '~/shared/api';

const client = getClient();
const redirectTo = '/categories';

type ParsedFormData =
  | ({ _action: 'create' } & CategoryCreateDto)
  | ({ _action: 'edit' } & CategoryUpdateDto);

export async function createCategory(prev: unknown, formData: FormData) {
  const data = Object.fromEntries(formData) as unknown as ParsedFormData;
  const cookie = await cookies();

  if (data._action === 'create') {
    const { body } = await client.categories.createCategory({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      body: {
        ...data,
        parentId: data.parentId || null,
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
      body: {
        ...data,
        parentId: data.parentId || null,
        isActive: formData.get('isActive') === 'true',
        id: categoryId,
      },
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(`${redirectTo}/${categoryId}`);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot update category', {
        cause: body,
      });
    }
  }
}

export async function getCategories() {
  const { body } = await client.categories.getCategories();
  return body.data;
}

export async function getCategory(categoryId: string) {
  const { body } = await client.categories.getCategoryById({
    params: { categoryId },
  });
  if (body.status === 'success') return body.data;
  else throw new Error(body.message || 'Cannot get category', { cause: body });
}

export async function deleteCategory(categoryId: string) {
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

export async function bulkDeleteCategory(ids: string[]) {
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
