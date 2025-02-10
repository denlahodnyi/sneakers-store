'use client';

import { useTransition } from 'react';

import useCart from './useCart';

export default function ClearCartAction({
  children,
}: {
  children: (clearCart: () => void, pending: boolean) => React.ReactNode;
}) {
  const { clearCart: clearCartAction } = useCart();
  const [pending, startTransition] = useTransition();

  const clearCart = () => {
    startTransition(async () => {
      clearCartAction();
    });
  };

  return children(clearCart, pending);
}
