'use client';

import { useEffect } from 'react';

import { useCart } from '~/features/cart';

// This will clear the cart when the user successfully completes the checkout
// process (if it wasn't already cleared in the webhook)
export default function ClearCartOnSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
