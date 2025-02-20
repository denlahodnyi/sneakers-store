'use client';
import { useCart } from '~/features/cart';

export default function CheckoutPriceSummary() {
  const { cart } = useCart();

  return (
    <div className="max-w-[300px] self-start rounded-sm bg-secondary/50 p-6">
      <p className="pb-3">
        <span className="text-zinc-500">Subtotal:</span>{' '}
        <span className="text-xl">{cart.formattedPrice}</span>
      </p>
      <p className="pb-3">
        <span className="text-zinc-500">Discount:</span>{' '}
        <span className="text-xl">
          {cart.formattedTotalDiscount
            ? `-${cart.formattedTotalDiscount}`
            : '–'}
        </span>
      </p>
      <p className="mb-8 border-t-[1px] border-border pt-3 text-2xl font-extrabold">
        Total: {cart.formattedTotalPrice}
      </p>
      <div id="pay-button-section"></div>
    </div>
  );
}
