'use client';

import { useTransition } from 'react';

import useCart from './useCart';

export default function RemoveFromCartAction({
  children,
  productSkuId,
}: {
  productSkuId: string | null;
  children: (removeFromCart: () => void, pending: boolean) => React.ReactNode;
}) {
  const { removeFromCart: removeFromCartAction } = useCart();
  const [pending, startTransition] = useTransition();

  const removeFromCart = () => {
    startTransition(async () => {
      if (productSkuId) removeFromCartAction(productSkuId);
    });
  };

  return children(removeFromCart, pending);
}
