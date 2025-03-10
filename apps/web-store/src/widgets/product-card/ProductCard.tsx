'use client';
import type { CatalogResponseDto } from '@sneakers-store/contracts';
import { HeartIcon } from 'lucide-react';
// import { ShoppingBagIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { cn } from '~/shared/lib';
// import { Button } from '~/shared/ui';
import { Button, getConicGradientFromHexes } from '~/shared/ui';
import { LoginModal, useAuth } from '../../features/authentication';
import { ProductLikeForm } from '../../features/like-products';

export default function ProductCard({
  product,
}: {
  product: CatalogResponseDto;
}) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const session = useAuth();

  return (
    <article
      className={cn(
        'relative flex flex-col rounded-sm bg-card p-2 px-3 pb-5',
        !product.isInStock && 'opacity-50',
      )}
    >
      {session?.user?.id ? (
        <ProductLikeForm
          key={selectedVariant.variantId}
          defaultState={selectedVariant.isFavourite}
          productVarId={selectedVariant.variantId}
        >
          {(isLiked, likePending) => (
            <Button
              className="absolute right-[16px] top-[36px] z-[1] rounded-full text-foreground"
              disabled={likePending}
              size="icon"
              type="submit"
              variant="ghost"
            >
              <HeartIcon className={cn(isLiked && 'fill-tertiary')} />
            </Button>
          )}
        </ProductLikeForm>
      ) : (
        <LoginModal>
          <Button
            className="absolute right-[16px] top-[36px] z-[1] rounded-full text-foreground"
            size="icon"
            variant="ghost"
          >
            <HeartIcon />
          </Button>
        </LoginModal>
      )}
      <div className="mb-2 flex">
        {product.variants.map((variant, i) =>
          variant.hex ? (
            <Link
              key={variant.variantId}
              href={`/store/product/${variant.slug}`}
              className={cn(
                'block size-5 rounded-full hover:ring-2 hover:ring-tertiary md:size-4',
                i !== 0 && 'ml-2 md:ml-1',
              )}
              style={{
                backgroundImage: getConicGradientFromHexes(variant.hex),
              }}
              onMouseEnter={() => setSelectedVariant(variant)}
            >
              <span className="sr-only">
                {variant.variantName || `${product.name} ${variant.color}`}
              </span>
            </Link>
          ) : null,
        )}
      </div>
      <Link
        className="flex-1"
        href={`/store/product/${product.variants[0].slug}`}
      >
        <div className="relative mb-1 aspect-square w-full">
          <Image
            fill
            alt=""
            className="object-cover"
            quality={75}
            sizes="(min-width: 768px) 33vw, (min-width: 1024px) 25vw, 50vw"
            src={
              selectedVariant.images?.[0]?.url ||
              '/placeholder_2_1080x1080.webp'
            }
          />
        </div>
        <p className="mb-1 text-center font-normal text-zinc-500">
          {product.brand.name}
        </p>
        <h2 className="text-center">{product.name}</h2>
        <p className="text-center font-[800]">
          {product.isInStock
            ? selectedVariant.formattedPriceRangeWithDiscount ||
              selectedVariant.formattedPriceRange ||
              selectedVariant.formattedPriceWithDiscount ||
              selectedVariant.formattedPrice
            : 'Out of stock'}
          <wbr />
          {selectedVariant.formattedDiscount && (
            <span className="ml-1 w-max text-nowrap rounded-sm bg-destructive px-1 text-sm text-destructive-foreground">
              {`-${selectedVariant.formattedDiscount}`}
            </span>
          )}
        </p>
      </Link>
      {/* <div className="text-center">
        <Button
          className="mt-3 w-full border-primary bg-transparent"
          variant="outline"
        >
          <ShoppingBagIcon className="h-4 w-4" />
          Add to cart
        </Button>
      </div> */}
    </article>
  );
}
