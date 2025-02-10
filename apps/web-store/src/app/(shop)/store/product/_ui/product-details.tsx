'use client';

import type { Contract } from '@sneakers-store/contracts';
import type { ClientInferResponseBody } from '@ts-rest/core';
import {
  HeartIcon,
  ShoppingBagIcon,
  LoaderCircleIcon,
  CircleAlertIcon,
} from 'lucide-react';
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

import { AddToCartAction, useCart } from '~/features/cart';
import { ProductLikeForm } from '~/features/like-products';
import { cn } from '~/shared/lib';
import { Button, type ButtonProps } from '~/shared/ui';

type ProductDetails = ClientInferResponseBody<
  Contract['catalog']['getProductDetails'],
  200
>['data']['details'];

type SizeVariant = ProductDetails['sizes'][number];

interface ProductSelectionDetailsContext {
  selectedSku: {
    sizeId: SizeVariant['id'];
    productSkuId: SizeVariant['productSkuId'];
  } | null;
  setSelectedSku: Dispatch<
    SetStateAction<{
      sizeId: SizeVariant['id'];
      productSkuId: SizeVariant['productSkuId'];
    } | null>
  >;
  sizeVariants: ProductDetails['sizes'];
  showUnselectedSizeAlert: boolean;
  setShowUnselectedSizeAlert: Dispatch<SetStateAction<boolean>>;
}

const SIZE_PARAM = 'sizeId';

export const ProductSelectionDetailsContext =
  createContext<ProductSelectionDetailsContext>({
    selectedSku: null,
    setSelectedSku: () => null,
    sizeVariants: [],
    showUnselectedSizeAlert: false,
    setShowUnselectedSizeAlert: () => undefined,
  });

function useProductDetails() {
  const ctx = useContext(ProductSelectionDetailsContext);
  return ctx;
}

export function ProductSelectionDetailsProvider({
  children,
  sizeVariants,
}: PropsWithChildren & {
  sizeVariants: ProductDetails['sizes'];
}) {
  const sp = useSearchParams();
  const [selectedSku, setSelectedSku] = useState<
    ProductSelectionDetailsContext['selectedSku']
  >(() => {
    const kindaSizeIdParam = Number(sp.get(SIZE_PARAM));
    const predefinedSizeId =
      Number.isInteger(kindaSizeIdParam) && kindaSizeIdParam > 0
        ? kindaSizeIdParam
        : null;
    const sizeVariantByParam = sizeVariants.find(
      (o) => o.id === predefinedSizeId,
    );
    return sizeVariantByParam
      ? {
          sizeId: sizeVariantByParam.id,
          productSkuId: sizeVariantByParam.productSkuId,
        }
      : null;
  });
  const [showUnselectedSizeAlert, setShowUnselectedSizeAlert] = useState(false);

  return (
    <ProductSelectionDetailsContext.Provider
      value={{
        selectedSku,
        sizeVariants,
        setSelectedSku,
        showUnselectedSizeAlert,
        setShowUnselectedSizeAlert,
      }}
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
  const { selectedSku, sizeVariants } = useProductDetails();

  if (selectedSku?.sizeId) {
    const { formattedPrice, formattedPriceWithDiscount } =
      sizeVariants.find((o) => o.id === selectedSku.sizeId) || {};
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
  const { selectedSku, sizeVariants } = useProductDetails();

  return selectedSku
    ? sizeVariants.find((o) => o.id === selectedSku.sizeId)?.size
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
  const { selectedSku, setSelectedSku, sizeVariants } = useProductDetails();

  return (
    <Button
      {...rest}
      variant={selectedSku?.sizeId === sizeId ? 'default' : 'outline'}
      onClick={() => {
        const sizeVar = sizeVariants.find((o) => o.id === sizeId);
        if (sizeVar)
          setSelectedSku({
            sizeId: sizeVar.id,
            productSkuId: sizeVar.productSkuId,
          });
      }}
    >
      {children}
    </Button>
  );
}

export function LastItemsAlert(props: ComponentProps<'p'>) {
  const { selectedSku, sizeVariants } = useProductDetails();
  const qty = selectedSku
    ? sizeVariants.find((o) => o.id === selectedSku.sizeId)?.stockQty
    : 0;

  return qty && qty <= 5 ? (
    <p role="alert" {...props}>{`Only ${qty} left`}</p>
  ) : null;
}

export function UnselectedSizeAlert() {
  const { showUnselectedSizeAlert } = useProductDetails();
  return (
    showUnselectedSizeAlert && (
      <p className="text-destructive">
        <CircleAlertIcon aria-hidden className="mr-1 inline size-4" />
        <span className="align-middle">Please, choose a size</span>
      </p>
    )
  );
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

export function ProductDetailsAddToCartButton() {
  const { selectedSku, sizeVariants, setShowUnselectedSizeAlert } =
    useProductDetails();
  const { cart } = useCart();
  const sizeVar = sizeVariants.find((o) => o.id === selectedSku?.sizeId);
  const cartItem = cart.items.find(
    (o) => o.productSkuId === selectedSku?.productSkuId,
  );
  const isLimit =
    sizeVar?.stockQty !== undefined &&
    cartItem?.qty !== undefined &&
    sizeVar?.stockQty <= cartItem?.qty;

  return (
    <AddToCartAction productSkuId={selectedSku?.productSkuId || null}>
      {(action, pending) => (
        <Button
          className="w-full"
          disabled={pending || isLimit}
          size="lg"
          onClick={() => {
            if (!selectedSku) {
              setShowUnselectedSizeAlert(true);
              return;
            }
            setShowUnselectedSizeAlert(false);
            action();
          }}
        >
          {pending ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <ShoppingBagIcon className="size-5" />
          )}
          Add to cart
        </Button>
      )}
    </AddToCartAction>
  );
}
