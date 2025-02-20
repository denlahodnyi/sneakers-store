'use server';

import type {
  inferDtoErrors,
  UserResponseDto,
} from '@sneakers-store/contracts';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { getServerClient } from '~/shared/api';

const client = getServerClient();

export async function updateUserServerFn(
  prevState: unknown,
  formData: FormData,
) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const cookiesStr = (await cookies()).toString();

  const { body } = await client.users.updateUser({
    body: { name, id, phone: phone || null },
    params: { userId: id },
    extraHeaders: {
      Cookie: cookiesStr,
    },
  });

  if (body.status === 'success') {
    revalidatePath('/', 'layout'); // refetch session with user data
    return {
      success: true,
      data: body.data,
      errors: null,
      clientMessage: null,
      _ts: Date.now().valueOf(),
    };
  }
  return {
    success: false,
    data: null,
    errors: body.errors as inferDtoErrors<UserResponseDto>,
    clientMessage: body.message,
    _ts: Date.now().valueOf(),
  };
}
