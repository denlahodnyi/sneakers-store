import type { PropsWithChildren } from 'react';
import Link from 'next/link';

import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '~/shared/ui';
import { cn } from '~/shared/lib';
import useCart from './useCart';
import CartItem from './CartItem';
import ClearCartAction from './ClearCartAction';

export default function CartDrawer({ children }: PropsWithChildren) {
  const { cart, showCart, setShowCart } = useCart();

  return (
    <Drawer direction="right" open={showCart} onOpenChange={setShowCart}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        aria-describedby=""
        className="bottom-0 left-auto right-0 top-0 mt-0 w-full rounded-none sm:w-[500px]"
        overlayProps={{ className: 'bg-black/20' }}
      >
        <DrawerHeader>
          <DrawerTitle className="text-center">Your cart</DrawerTitle>
        </DrawerHeader>
        <div
          className={cn(
            'grid flex-1 auto-rows-min grid-cols-1 content-center divide-y overflow-y-auto px-4',
            cart.totalQty > 0 && 'content-start',
          )}
        >
          {cart.totalQty === 0 && (
            <p className="text-center text-zinc-500">
              You have no products in your cart yet
            </p>
          )}
          {cart.items.length > 0 && (
            <div className="grid grid-cols-[1fr,auto] grid-rows-[auto,auto] pb-2 text-zinc-500">
              <p className="grow">
                Total items in cart:{' '}
                <span className="text-foreground">{cart.totalQty}</span>
              </p>
              {cart.totalQty > 0 && (
                <ClearCartAction>
                  {(action, pending) => (
                    <Button
                      className="h-auto"
                      disabled={pending}
                      size="sm"
                      variant="link"
                      onClick={() => action()}
                    >
                      Remove all
                    </Button>
                  )}
                </ClearCartAction>
              )}
              <p>
                Total price:{' '}
                <span className="text-foreground">
                  {cart.formattedTotalPrice}
                </span>
              </p>
            </div>
          )}
          {cart.items.map((it) => (
            <CartItem key={it.id || it.productSkuId} item={it} />
          ))}
        </div>
        <DrawerFooter>
          {cart.items.length > 0 && (
            <Button
              asChild
              onClick={() => {
                setShowCart(false);
              }}
            >
              <Link href="/checkout">Checkout</Link>
            </Button>
          )}
          <DrawerClose asChild>
            <Button variant="secondary">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
