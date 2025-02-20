'use client';
import type { CartResponseDto } from '@sneakers-store/contracts';
import { useEffect } from 'react';

import { useCart } from '~/features/cart';

export default function CheckoutCartDataRefresh({
  userCart,
  isAuthed,
}: {
  userCart?: CartResponseDto | null;
  isAuthed?: boolean;
}) {
  const { setupCart } = useCart();

  useEffect(() => {
    setupCart(userCart, isAuthed);
  }, [isAuthed, setupCart, userCart]);

  return null;
}
