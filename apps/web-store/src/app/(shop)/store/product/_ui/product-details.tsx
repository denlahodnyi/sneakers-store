'use client';

import type { Contract } from '@sneakers-store/contracts';
import type { ClientInferResponseBody } from '@ts-rest/core';
import { HeartIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import {
  createContext,
  useContext,
  useState,
  type ComponentProps,
  type Dispatch,
  type PropsWithChildren,
  type ReactNode,
  type SetStateAction,
} from 'react';

import { ProductLikeForm } from '~/features/like-products';
import { cn } from '~/shared/lib';
import { Button, type ButtonProps } from '~/shared/ui';

type ProductDetails = ClientInferResponseBody<
  Contract['catalog']['getProductDetails'],
  200
>['data']['details'];

interface ProductSelectionDetailsContext {
  selectedSizeId: number | null;
  setSelectedSizeId: Dispatch<SetStateAction<number | null>>;
  sizeVariants: ProductDetails['sizes'];
}

const SIZE_PARAM = 'sizeId';

export const ProductSelectionDetailsContext =
  createContext<ProductSelectionDetailsContext>({
    selectedSizeId: null,
    setSelectedSizeId: () => null,
    sizeVariants: [],
  });

export function ProductSelectionDetailsProvider({
  children,
  sizeVariants,
}: PropsWithChildren & {
  sizeVariants: ProductDetails['sizes'];
}) {
  const sp = useSearchParams();
  const [selectedSizeId, setSelectedSizeId] = useState<
    ProductSelectionDetailsContext['selectedSizeId']
  >(
    sp.has(SIZE_PARAM) && Number.isInteger(Number(sp.get(SIZE_PARAM)))
      ? Number(sp.get(SIZE_PARAM))
      : null,
  );
  return (
    <ProductSelectionDetailsContext.Provider
      value={{ selectedSizeId, sizeVariants, setSelectedSizeId }}
    >
      {children}
    </ProductSelectionDetailsContext.Provider>
  );
}

export function ProductPrice({
  defaultPrice,
  defaultPriceWithDiscount,
  hasDiscount,
}: {
  defaultPrice: string;
  defaultPriceWithDiscount?: string;
  hasDiscount?: boolean;
}) {
  const { selectedSizeId, sizeVariants } = useContext(
    ProductSelectionDetailsContext,
  );

  if (selectedSizeId) {
    const { formattedPrice, formattedPriceWithDiscount } =
      sizeVariants.find((o) => o.id === selectedSizeId) || {};
    const showDiscount = hasDiscount && formattedPriceWithDiscount;
    return (
      <>
        <span
          className={cn(
            showDiscount && 'font-normal text-zinc-500 line-through',
          )}
        >
          {formattedPrice}
        </span>
        {showDiscount && <span>&nbsp;{formattedPriceWithDiscount}</span>}
      </>
    );
  }

  return (
    <>
      <span
        className={cn(
          !!defaultPriceWithDiscount &&
            'font-normal text-zinc-500 line-through',
        )}
      >
        {defaultPrice}
      </span>
      {hasDiscount && defaultPriceWithDiscount && (
        <span>&nbsp;{defaultPriceWithDiscount}</span>
      )}
    </>
  );
}

export function SelectedSize({ defaultSize }: { defaultSize: string }) {
  const { selectedSizeId, sizeVariants } = useContext(
    ProductSelectionDetailsContext,
  );

  return selectedSizeId
    ? sizeVariants.find((o) => o.id === selectedSizeId)?.size
    : defaultSize;
}

export function SizeButton({
  children,
  sizeId,
  ...rest
}: {
  children: ReactNode;
  sizeId: number;
} & ButtonProps) {
  const { selectedSizeId, setSelectedSizeId } = useContext(
    ProductSelectionDetailsContext,
  );

  return (
    <Button
      {...rest}
      variant={selectedSizeId === sizeId ? 'default' : 'outline'}
      onClick={() => setSelectedSizeId(sizeId)}
    >
      {children}
    </Button>
  );
}

export function LastItemsAlert(props: ComponentProps<'p'>) {
  const { selectedSizeId, sizeVariants } = useContext(
    ProductSelectionDetailsContext,
  );
  const qty = selectedSizeId
    ? sizeVariants.find((o) => o.id === selectedSizeId)?.stockQty
    : 0;

  return qty && qty <= 5 ? (
    <p role="alert" {...props}>{`Only ${qty} left`}</p>
  ) : null;
}

export function ProductDetailsLikeButton({
  isFavourite,
  productVarId,
}: {
  productVarId: string;
  isFavourite: boolean;
}) {
  return (
    <ProductLikeForm defaultState={isFavourite} productVarId={productVarId}>
      {(isLiked, likePending) => (
        <Button
          aria-label={isLiked ? 'Remove from favourites' : 'Mark as favourite'}
          className={cn('px-3 text-foreground', likePending && 'opacity-50')}
          disabled={likePending}
          size="lg"
          type="submit"
          variant="secondary"
        >
          <HeartIcon className={cn('size-5', isLiked && 'fill-foreground')} />
        </Button>
      )}
    </ProductLikeForm>
  );
}
