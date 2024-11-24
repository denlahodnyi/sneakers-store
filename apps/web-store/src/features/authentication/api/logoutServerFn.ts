'use server';

import { isRedirectError } from 'next/dist/client/components/redirect';

import { signOut } from '~/shared/api';

export const logoutServerFn = async () => {
  try {
    await signOut({ redirectTo: '/' });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      clientMessage: 'Some error happened during logout',
      _ts: Date.now().valueOf(),
    };
  }
};
