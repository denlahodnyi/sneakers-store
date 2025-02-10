'use client';

import { useTransition } from 'react';

import useCart from './useCart';

export default function AddToCartAction({
  children,
  productSkuId,
}: {
  productSkuId: string | null;
  children: (addToCartCb: () => void, pending: boolean) => React.ReactNode;
}) {
  const { addToCart: addToCartAction } = useCart();
  const [pending, startTransition] = useTransition();

  const addToCart = () => {
    startTransition(async () => {
      if (productSkuId) addToCartAction(productSkuId);
    });
  };

  return children(addToCart, pending);
}
