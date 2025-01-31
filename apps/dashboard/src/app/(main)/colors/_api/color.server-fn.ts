'use server';

import type {
  ColorCreateDto,
  ColorUpdateDto,
  Contract,
  inferDtoErrors,
} from '@sneakers-store/contracts';
import type { ClientInferRequest } from '@ts-rest/core';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { ColorSchema } from '~/entities/color';
import { getClient } from '~/shared/api';

const client = getClient();
const redirectTo = '/colors';

type Data =
  | ({ _action: 'create' } & ColorSchema)
  | ({ _action: 'edit'; id: number } & ColorSchema);

export async function createColor(prev: unknown, data: Data) {
  const cookie = await cookies();

  if (data._action === 'create') {
    const { body } = await client.colors.createColor({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      body: {
        ...data,
        hex: data.hexes.map(({ hex }) => hex),
      },
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(redirectTo);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors as inferDtoErrors<ColorCreateDto>,
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
        id: colorId,
        hex: data.hexes.map(({ hex }) => hex),
      },
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(`${redirectTo}/${colorId}`);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors as inferDtoErrors<ColorUpdateDto>,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot update color', {
        cause: body,
      });
    }
  }
}

export async function getColors(
  query?: ClientInferRequest<Contract['colors']['getColors']>['query'],
) {
  const { body } = await client.colors.getColors({ query: query || null });
  return body.data;
}

export async function getColor(colorId: number) {
  const { body } = await client.colors.getColorById({
    params: { colorId },
  });
  if (body.status === 'success') return body.data;
  else throw new Error(body.message || 'Cannot get color', { cause: body });
}

export async function deleteColor(colorId: number) {
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

export async function bulkDeleteColor(ids: number[]) {
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
