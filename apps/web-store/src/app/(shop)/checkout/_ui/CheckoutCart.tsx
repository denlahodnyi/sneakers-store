'use client';
import { CartItem, useCart } from '~/features/cart';

export default function CheckoutCart() {
  const { cart } = useCart();
  return (
    <div className="divide-y">
      {cart.items.map((it) => (
        <CartItem key={it.productSkuId} className="py-3" item={it} />
      ))}
    </div>
  );
}
