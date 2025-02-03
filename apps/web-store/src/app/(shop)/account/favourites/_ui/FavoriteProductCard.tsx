'use client';
import type { FavProductDto } from '@sneakers-store/contracts';
import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { ProductLikeForm } from '~/features/like-products';
import { Button } from '~/shared/ui';

export default function FavoriteProductCard({
  product,
}: {
  product: FavProductDto;
}) {
  const router = useRouter();
  return (
    <div className="grid grid-cols-[auto,1fr,auto] grid-rows-1 rounded-md border border-border bg-background">
      <Link
        className="col-span-2 grid grid-cols-subgrid grid-rows-subgrid gap-x-3 p-2"
        href={`/store/product/${product.productVariant.slug}`}
      >
        <div className="relative size-[100px] rounded-md">
          <Image
            fill
            alt={product.image?.alt || ''}
            className="rounded-[inherit] object-cover"
            sizes="33vw"
            src={product.image?.url || '/placeholder_2_1080x1080.webp'}
          />
        </div>
        <div className="space-y-1">
          <div className="flex">
            {product.brand.iconUrl && (
              <Image
                alt=""
                className="mr-2 size-[20px] rounded-full border border-border p-1"
                height={20}
                src={product.brand.iconUrl}
                width={20}
              />
            )}
            <p className="text-sm text-zinc-500">{product.brand.name}</p>
          </div>
          <h2 className="text-lg sm:text-xl">
            {product.productVariant.name || product.product.name}
          </h2>
          <p className="text-sm italic text-zinc-500">{`${product.category.name} (${product.product.gender})`}</p>
          <p className="font-[800]">
            {product.isInStock
              ? product.formattedPriceRangeWithDiscount ||
                product.formattedPriceRange ||
                product.formattedPriceWithDiscount ||
                product.formattedPrice
              : 'Out of stock'}
            <wbr />
            {product.discount?.formattedDiscount && (
              <span className="ml-1 w-max text-nowrap rounded-sm bg-destructive px-1 text-sm text-destructive-foreground">
                {`-${product.discount.formattedDiscount}`}
              </span>
            )}
          </p>
        </div>
      </Link>
      <ProductLikeForm
        className="contents"
        defaultState={true}
        productVarId={product.productVariant.id}
        onSuccess={() => router.refresh()}
      >
        {(isLiked, likePending) => (
          <Button
            className="h-auto rounded-s-none"
            disabled={likePending}
            type="submit"
            variant="ghost"
          >
            <HeartIcon className="fill-foreground" />
          </Button>
        )}
      </ProductLikeForm>
    </div>
  );
}
