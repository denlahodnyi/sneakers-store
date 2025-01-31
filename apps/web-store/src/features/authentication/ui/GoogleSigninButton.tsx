'use client';

import {
  startTransition,
  useActionState,
  useEffect,
  type ComponentProps,
} from 'react';
import { FaGoogle } from 'react-icons/fa';

import { Button, showErrorMessage } from '~/shared/ui';
import { signInWithGoogleServerFn } from '../api';

function GoogleSigninButton(props: ComponentProps<'button'>) {
  const [state, action, isPending] = useActionState(
    signInWithGoogleServerFn,
    undefined,
  );

  useEffect(() => {
    if (state?.clientMessage) showErrorMessage(state.clientMessage);
  }, [state]);

  return (
    <Button
      {...props}
      disabled={isPending}
      variant="tertiary"
      onClick={async () => {
        startTransition(() => {
          action();
        });
      }}
    >
      <FaGoogle />
      Sign in with Google
    </Button>
  );
}

export default GoogleSigninButton;
