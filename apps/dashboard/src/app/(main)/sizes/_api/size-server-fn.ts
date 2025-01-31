'use server';

import type {
  Contract,
  inferDtoErrors,
  SizeCreateDto,
  SizeUpdateDto,
} from '@sneakers-store/contracts';
import type { ClientInferRequest } from '@ts-rest/core';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { SizeSchema } from '~/entities/size';
import { getClient } from '~/shared/api';

const client = getClient();
const redirectTo = '/sizes';

type Data =
  | ({ _action: 'create' } & SizeSchema)
  | ({ _action: 'edit'; id: number } & SizeSchema);

export async function createSize(prev: unknown, data: Data) {
  const cookie = await cookies();

  if (data._action === 'create') {
    const { body } = await client.sizes.createSize({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      body: {
        ...data,
        size: data.size.toString(),
        system: data.system as SizeSchema['system'],
      },
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(redirectTo);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors as inferDtoErrors<SizeCreateDto>,
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
        size: data.size.toString(),
        system: data.system as SizeSchema['system'],
      },
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(`${redirectTo}/${sizeId}`);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors as inferDtoErrors<SizeUpdateDto>,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot update size', {
        cause: body,
      });
    }
  }
}

export async function getSizes(
  query?: ClientInferRequest<Contract['sizes']['getSizes']>['query'],
) {
  const { body } = await client.sizes.getSizes({ query: query || null });
  return body.data;
}

export async function getSize(sizeId: number) {
  const { body } = await client.sizes.getSizeById({
    params: { sizeId },
  });
  if (body.status === 'success') return body.data;
  else throw new Error(body.message || 'Cannot get size', { cause: body });
}

export async function deleteSize(sizeId: number) {
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

export async function bulkDeleteSize(ids: number[]) {
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
