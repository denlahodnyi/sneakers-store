'use server';

import type { ColorCreateDto, ColorUpdateDto } from '@sneakers-store/contracts';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getClient } from '~/shared/api';

const client = getClient();
const redirectTo = '/colors';

type ParsedFormData =
  | ({ _action: 'create' } & ColorCreateDto)
  | ({ _action: 'edit' } & ColorUpdateDto);

export async function createColor(prev: unknown, formData: FormData) {
  const data = Object.fromEntries(formData) as unknown as ParsedFormData;
  const cookie = await cookies();

  if (data._action === 'create') {
    const { body } = await client.colors.createColor({
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
      throw new Error(body.message || 'Cannot create color', {
        cause: body,
      });
    }
  }
  if (data._action === 'edit') {
    const colorId = data.id;
    const { body } = await client.colors.updateColor({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      params: { colorId },
      body: {
        ...data,
        isActive: formData.get('isActive') === 'true',
        id: colorId,
      },
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(`${redirectTo}/${colorId}`);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot update color', {
        cause: body,
      });
    }
  }
}

export async function getColors() {
  const { body } = await client.colors.getColors();
  return body.data;
}

export async function getColor(colorId: string) {
  const { body } = await client.colors.getColorById({
    params: { colorId },
  });
  if (body.status === 'success') return body.data;
  else throw new Error(body.message || 'Cannot get color', { cause: body });
}

export async function deleteColor(colorId: string) {
  const cookie = await cookies();
  const { body } = await client.colors.deleteColor({
    extraHeaders: { Cookie: cookie.toString() },
    params: { colorId },
  });
  if (body.status === 'success') {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  } else {
    throw new Error(body.message || 'Cannot delete color', { cause: body });
  }
}

export async function bulkDeleteColor(ids: string[]) {
  const cookie = await cookies();
  const { body } = await client.colors.deleteColors({
    extraHeaders: { Cookie: cookie.toString() },
    body: { ids },
  });
  if (body.status === 'success') {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  } else {
    throw new Error(body.message || 'Cannot delete colors', {
      cause: body,
    });
  }
}
