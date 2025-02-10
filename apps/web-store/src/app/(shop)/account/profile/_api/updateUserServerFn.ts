'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { getServerClient } from '~/shared/api';

const client = getServerClient();

export async function updateUserServerFn(
  prevState: unknown,
  formData: FormData,
) {
  const id = formData.get('id') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  // const email = formData.get('email') as string;
  const name = lastName ? `${firstName} ${lastName}` : firstName;
  const cookiesStr = (await cookies()).toString();

  const { body } = await client.users.updateUser({
    body: { name, id },
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
    errors: body.errors,
    clientMessage: body.message,
    _ts: Date.now().valueOf(),
  };
}
