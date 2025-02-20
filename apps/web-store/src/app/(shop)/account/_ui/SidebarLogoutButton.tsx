'use client';

import { LogOutIcon } from 'lucide-react';
import { startTransition, useActionState, useEffect } from 'react';

import { logout, useAuth } from '~/features/authentication';
import { useCart } from '~/features/cart';
import { Button, showErrorMessage, type ButtonProps } from '~/shared/ui';

function SidebarLogoutButton({ ...rest }: ButtonProps) {
  const authCtx = useAuth();
  const { dispatch } = useCart();
  const [state, action, isPending] = useActionState(logout, undefined);

  useEffect(() => {
    if (state?.clientMessage) showErrorMessage(state.clientMessage);
  }, [state]);

  return authCtx?.user?.id ? (
    <Button
      {...rest}
      className="w-full justify-between text-base"
      disabled={isPending}
      onClick={() => {
        startTransition(() => {
          action();
          dispatch({ type: 'reset_cart' });
        });
      }}
    >
      <LogOutIcon />
      Logout
    </Button>
  ) : null;
}

export default SidebarLogoutButton;
