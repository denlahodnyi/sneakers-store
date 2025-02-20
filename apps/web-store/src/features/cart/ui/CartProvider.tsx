'use client';

import type { CartResponseDto } from '@sneakers-store/contracts';
import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';
import { z } from 'zod';

import { type Session } from '~/shared/api';
import { getClient } from '~/shared/api/client-only';
import { showErrorMessage } from '~/shared/ui';
import { syncCarts } from '~/features/cart/api/sync-carts';
import { addToCart as addToCartServerFn } from '../api/add-to-cart';
import { removeFromCart as removeFromCartServerFn } from '../api/remove-from-cart';
import { clearCart as clearCartServerFn } from '../api/clear-cart';

const client = getClient();

export type Cart = Omit<CartResponseDto, 'id'> & { id: string | null };

type ReducerAction =
  | {
      type: 'rewrite_cart';
      cart: Cart;
    }
  | {
      type: 'reset_cart';
    }
  | { type: 'reset_user_cart' };

const STORAGE_KEY = 'user-cart';

const localCartItemsScheme = z.array(
  z.object({
    productSkuId: z.string().uuid(),
    qty: z.number().gt(0),
  }),
);

const initCartState: Cart = {
  id: null,
  items: [],
  price: 0,
  priceInCents: 0,
  formattedPrice: '$0',
  totalDiscount: 0,
  totalPriceInCents: 0,
  totalPrice: 0,
  totalDiscountInCents: null,
  formattedTotalDiscount: null,
  formattedTotalPrice: '$0',
  totalQty: 0,
};

const cartReducer = (state: Cart, action: ReducerAction) => {
  if (action.type === 'rewrite_cart') {
    return action.cart;
  }
  if (action.type === 'reset_user_cart') {
    return { ...initCartState, id: state.id };
  }
  if (action.type === 'reset_cart') {
    return initCartState;
  }
  return initCartState;
};

export const CartContext = createContext<{
  cart: Cart;
  showCart: boolean;
  setShowCart: Dispatch<SetStateAction<boolean>>;
  dispatch: Dispatch<ReducerAction>;
  addToCart: (productSkuId: string) => Promise<void>;
  removeFromCart: (productSkuId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setupCart: (
    userCart?: CartResponseDto | null,
    isAuthed?: boolean,
  ) => Promise<void>;
}>({
  cart: initCartState,
  showCart: false,
  setShowCart: () => undefined,
  dispatch: () => undefined,
  addToCart: () => Promise.resolve(),
  removeFromCart: () => Promise.resolve(),
  clearCart: () => Promise.resolve(),
  setupCart: () => Promise.resolve(),
});

export function CartProvider({
  children,
  user,
  userCart,
}: PropsWithChildren & {
  user: Session['user'] | null;
  userCart?: CartResponseDto;
}) {
  const [state, dispatch] = useReducer(
    cartReducer,
    userCart ? userCart : initCartState,
  );
  const [showCart, setShowCart] = useState(false);

  const getParsedLocalCartItems = () => {
    let localCartItems: z.infer<typeof localCartItemsScheme> | null = null;
    const localCartItemsStr = localStorage.getItem(STORAGE_KEY);
    if (localCartItemsStr) {
      const { success, data, error } = localCartItemsScheme.safeParse(
        JSON.parse(localCartItemsStr),
      );
      if (success) localCartItems = data;
      else console.error(error.issues);
    }
    return localCartItems;
  };

  const generateCartFromItems = async (
    items: {
      productSkuId: string;
      qty: number;
    }[],
  ) => {
    const { body } = await client.cart.generateCart({
      body: { items },
    });
    if (body.status === 'success') {
      dispatch({ type: 'rewrite_cart', cart: body.data.cart });
    } else {
      console.error(
        `Cannot setup cart using local instance: ${body.message || ''}`,
      );
    }
  };

  const setupCart = useCallback(
    async (userCart?: CartResponseDto | null, isAuthed?: boolean) => {
      const localCartItems = getParsedLocalCartItems();
      if (isAuthed) {
        if (localCartItems) {
          const { success, cart } = await syncCarts(
            localCartItems,
            userCart?.id,
          );
          if (success && cart) {
            localStorage.removeItem(STORAGE_KEY);
            dispatch({ type: 'rewrite_cart', cart });
          } else {
            console.error(`Cannot merge carts`);
          }
        } else if (userCart) {
          dispatch({ type: 'rewrite_cart', cart: userCart });
        }
      } else if (localCartItems) {
        generateCartFromItems(localCartItems);
      }
    },
    [],
  );

  useEffect(() => {
    setupCart(userCart, Boolean(user?.id));
  }, [setupCart, user?.id, userCart]);

  const addToCart = useCallback(
    async (productSkuId: string) => {
      const localCartItems = getParsedLocalCartItems();
      if (user?.id) {
        const sameItem = state.items.find(
          (o) => o.productSkuId === productSkuId,
        );
        const { success, cart } = await addToCartServerFn(
          { productSkuId, qty: (sameItem?.qty || 0) + 1 },
          state.id,
          sameItem?.id,
        );
        if (success && cart) {
          dispatch({ type: 'rewrite_cart', cart });
        } else {
          showErrorMessage('Some problem occurred');
        }
      } else if (localCartItems) {
        const sameItemIdx = localCartItems.findIndex(
          (o) => o.productSkuId === productSkuId,
        );
        if (sameItemIdx !== -1) {
          localCartItems[sameItemIdx].qty += 1;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(localCartItems));
          generateCartFromItems(localCartItems);
        } else {
          const items = localCartItems.concat({ productSkuId, qty: 1 });
          localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
          generateCartFromItems(items);
        }
      } else {
        const items = [{ productSkuId, qty: 1 }];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        generateCartFromItems(items);
      }
    },
    [state.id, state.items, user?.id],
  );

  const removeFromCart = useCallback(
    async (productSkuId: string) => {
      const localCartItems = getParsedLocalCartItems();
      if (user?.id && state.id) {
        const sameItem = state.items.find(
          (o) => o.productSkuId === productSkuId,
        );
        if (sameItem?.id) {
          const { success, cart } = await removeFromCartServerFn(
            state.id,
            sameItem.id,
          );
          if (success && cart) {
            dispatch({ type: 'rewrite_cart', cart });
          } else {
            showErrorMessage('Some problem occurred');
          }
        }
      } else if (localCartItems) {
        const sameItemIdx = localCartItems.findIndex(
          (o) => o.productSkuId === productSkuId,
        );
        if (sameItemIdx !== -1) {
          localCartItems[sameItemIdx].qty += 1;
          const updatedItems = localCartItems.filter(
            (o) => o.productSkuId !== productSkuId,
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
          generateCartFromItems(updatedItems);
        }
      }
    },
    [state.id, state.items, user?.id],
  );

  const clearCart = useCallback(async () => {
    const localCartItems = getParsedLocalCartItems();
    if (user?.id && state.id) {
      const { success } = await clearCartServerFn(state.id);
      if (success) {
        dispatch({ type: 'reset_user_cart' });
      } else {
        showErrorMessage('Some problem occurred');
      }
    } else if (localCartItems) {
      localStorage.removeItem(STORAGE_KEY);
      dispatch({ type: 'reset_cart' });
    }
  }, [state.id, user?.id]);

  return (
    <CartContext.Provider
      value={{
        addToCart,
        cart: state,
        clearCart,
        dispatch,
        removeFromCart,
        setShowCart,
        showCart,
        setupCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
