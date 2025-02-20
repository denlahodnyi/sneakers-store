'use client';
import { useCart } from '~/features/cart';

export default function CheckoutItemsCount() {
  const { cart } = useCart();

  return <>{cart.totalQty}</>;
}
