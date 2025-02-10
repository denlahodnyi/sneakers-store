import Image from 'next/image';
import { LoaderCircleIcon, TrashIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '~/shared/ui';
import { cn } from '~/shared/lib';
import type { Cart } from './CartProvider';
import RemoveFromCartAction from './RemoveFromCartAction';
import useCart from './useCart';

export default function CartItem({
  item,
  className,
}: {
  item: Cart['items'][number];
  className?: string;
}) {
  const { setShowCart } = useCart();
  return (
    <div className={cn('grid grid-cols-[auto,1fr,auto] gap-2 py-1', className)}>
      <Link
        className="relative col-span-2 grid grid-cols-subgrid"
        href={`/store/product/${item.slug}`}
        onClick={() => setShowCart(false)}
      >
        {!item.isInStock && (
          <div className="absolute inset-0 z-[1] flex items-center justify-center bg-background/90 text-xl">
            <p>Out of stock</p>
          </div>
        )}
        <div className="relative size-[86px] rounded-sm">
          <Image
            fill
            alt={item.image?.alt || ''}
            className="rounded-[inherit] object-cover"
            quality={50}
            sizes="33vw"
            src={item.image?.url || '/placeholder_2_1080x1080.webp'}
          />
        </div>
        <div>
          <h3>{item.name}</h3>
          <p className="text-sm text-zinc-500">{`Size: ${item.size.size}`}</p>
          <p className="text-sm text-zinc-500">{`Color: ${item.color.name}`}</p>
          <p className="text-sm text-zinc-500">{`Quantity: ${item.qty}`}</p>
          <p>
            {item.formattedDiscount && (
              <>
                <span className="font-light line-through">
                  {item.formattedPrice}
                </span>{' '}
              </>
            )}
            <span className={cn(item.formattedDiscount && 'text-destructive')}>
              {item.formattedFinalPrice}
            </span>
          </p>
        </div>
      </Link>
      <div>
        <RemoveFromCartAction productSkuId={item.productSkuId}>
          {(action, pending) => (
            <Button
              className="text-destructive"
              disabled={pending}
              size="icon"
              variant="ghost"
              onClick={() => action()}
            >
              {pending ? <LoaderCircleIcon /> : <TrashIcon />}
            </Button>
          )}
        </RemoveFromCartAction>
      </div>
    </div>
  );
}
