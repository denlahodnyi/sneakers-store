'use server';

import type { SizeCreateDto, SizeUpdateDto } from '@sneakers-store/contracts';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getClient } from '~/shared/api';

const client = getClient();
const redirectTo = '/sizes';

type ParsedFormData =
  | ({ _action: 'create' } & SizeCreateDto)
  | ({ _action: 'edit' } & SizeUpdateDto);

export async function createSize(prev: unknown, formData: FormData) {
  const data = Object.fromEntries(formData) as unknown as ParsedFormData;
  const cookie = await cookies();

  if (data._action === 'create') {
    const { body } = await client.sizes.createSize({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      body: {
        ...data,
        system: data.system || null,
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
      throw new Error(body.message || 'Cannot create size', {
        cause: body,
      });
    }
  }
  if (data._action === 'edit') {
    const sizeId = data.id;
    const { body } = await client.sizes.updateSize({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      params: { sizeId },
      body: {
        ...data,
        id: sizeId,
        system: data.system || null,
        isActive: formData.get('isActive') === 'true',
      },
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(`${redirectTo}/${sizeId}`);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot update size', {
        cause: body,
      });
    }
  }
}

export async function getSizes() {
  const { body } = await client.sizes.getSizes();
  return body.data;
}

export async function getSize(sizeId: string) {
  const { body } = await client.sizes.getSizeById({
    params: { sizeId },
  });
  if (body.status === 'success') return body.data;
  else throw new Error(body.message || 'Cannot get size', { cause: body });
}

export async function deleteSize(sizeId: string) {
  const cookie = await cookies();
  const { body } = await client.sizes.deleteSize({
    extraHeaders: { Cookie: cookie.toString() },
    params: { sizeId },
  });
  if (body.status === 'success') {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  } else {
    throw new Error(body.message || 'Cannot delete size', { cause: body });
  }
}

export async function bulkDeleteSize(ids: string[]) {
  const cookie = await cookies();
  const { body } = await client.sizes.deleteSizes({
    extraHeaders: { Cookie: cookie.toString() },
    body: { ids },
  });
  if (body.status === 'success') {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  } else {
    throw new Error(body.message || 'Cannot delete sizes', {
      cause: body,
    });
  }
}
