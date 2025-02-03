'use server';

import { isRedirectError } from 'next/dist/client/components/redirect';

import { signIn } from '~/shared/api';

export const signInWithGoogle = async () => {
  try {
    await signIn('google');
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      clientMessage: 'Cannot signin with Google',
      _ts: Date.now().valueOf(),
    };
  }
};
