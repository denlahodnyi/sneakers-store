'use client';

import { ShoppingBagIcon } from 'lucide-react';

import { CartDrawer, useCart } from '~/features/cart';
import { Button } from '~/shared/ui';

export default function CartTrigger() {
  const { cart } = useCart();
  return (
    <CartDrawer>
      <Button
        className="flex h-auto flex-col items-center p-1 leading-none"
        variant="ghost"
      >
        <span className="relative">
          {cart.totalQty > 0 && (
            <span className="absolute -right-[16px] -top-[11px] z-[1] min-w-[22px] rounded-full bg-tertiary p-1 text-center text-tertiary-foreground">
              {cart.totalQty}
            </span>
          )}
          <ShoppingBagIcon className="h-6 w-6" />
        </span>
        Cart
      </Button>
    </CartDrawer>
  );
}
