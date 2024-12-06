'use client';

import { LogOutIcon } from 'lucide-react';
import { startTransition, useActionState, useContext, useEffect } from 'react';

import { logoutServerFn, AuthContext } from '~/features/authentication';
import { Button, showErrorMessage, type ButtonProps } from '~/shared/ui';

function SidebarLogoutButton({ ...rest }: ButtonProps) {
  const authCtx = useContext(AuthContext);
  const [state, action, isPending] = useActionState(logoutServerFn, undefined);

  useEffect(() => {
    if (state?.clientMessage) showErrorMessage(state.clientMessage);
  }, [state]);

  return authCtx?.user?.id ? (
    <Button
      {...rest}
      className="w-full justify-between"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          action();
        });
      }}
    >
      <LogOutIcon />
      Logout
    </Button>
  ) : null;
}

export default SidebarLogoutButton;
