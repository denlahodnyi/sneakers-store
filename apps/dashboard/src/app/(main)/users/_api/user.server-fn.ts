'use server';

import type {
  Contract,
  inferDtoErrors,
  UserCreateDto,
  UserUpdateDto,
} from '@sneakers-store/contracts';
import type { ClientInferRequest } from '@ts-rest/core';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { UserSchema } from '~/entities/user';
import { getClient } from '~/shared/api';

const client = getClient();
const redirectTo = '/users';

type Data =
  | ({ _action: 'create' } & UserSchema)
  | ({ _action: 'edit'; id: string } & UserSchema);

export async function createUser(prev: unknown, data: Data) {
  const cookie = await cookies();

  if (data._action === 'create') {
    const { body } = await client.users.createUser({
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
        errors: body.errors as inferDtoErrors<UserCreateDto>,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot create user', {
        cause: body,
      });
    }
  }
  if (data._action === 'edit') {
    const userId = data.id;
    const { body } = await client.users.updateUser({
      extraHeaders: {
        Cookie: cookie.toString(),
      },
      params: { userId },
      body: {
        ...data,
        id: userId,
      },
    });

    if (body.status === 'success') {
      revalidatePath(redirectTo);
      redirect(`${redirectTo}/${userId}`);
    } else if (body.errors) {
      return {
        success: false,
        errors: body.errors as inferDtoErrors<UserUpdateDto>,
        _ts: Date.now().valueOf(),
      };
    } else {
      throw new Error(body.message || 'Cannot update user', {
        cause: body,
      });
    }
  }
}

export async function getUsers(
  query?: ClientInferRequest<Contract['users']['getUsers']>['query'],
) {
  const { body } = await client.users.getUsers({ query: query || null });
  return body.data;
}

export async function getUser(userId: string) {
  const cookie = await cookies();
  const { body } = await client.users.getUser({
    extraHeaders: { Cookie: cookie.toString() },
    params: { userId },
  });
  if (body.status === 'success') return body.data;
  else throw new Error(body.message || 'Cannot get user', { cause: body });
}

export async function deleteUser(userId: string) {
  const cookie = await cookies();
  const { body } = await client.users.deleteUser({
    extraHeaders: { Cookie: cookie.toString() },
    params: { userId },
  });
  if (body.status === 'success') {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  } else {
    throw new Error(body.message || 'Cannot delete user', { cause: body });
  }
}

export async function bulkDeleteUser(ids: string[]) {
  const cookie = await cookies();
  const { body } = await client.users.deleteUsers({
    extraHeaders: { Cookie: cookie.toString() },
    body: { ids },
  });
  if (body.status === 'success') {
    revalidatePath(redirectTo);
    redirect(redirectTo);
  } else {
    throw new Error(body.message || 'Cannot delete users', {
      cause: body,
    });
  }
}
