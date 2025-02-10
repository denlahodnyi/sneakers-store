'use server';
import { cookies } from 'next/headers';

import { getServerClient } from '~/shared/api';

const client = getServerClient();

export async function addToCart(
  item: { qty: number; productSkuId: string },
  cartId?: string | null,
  cartItemId?: string | null,
) {
  const cookieStore = await cookies();

  if (cartId && cartItemId) {
    const { body } = await client.cart.updateCartItem({
      extraHeaders: { Cookie: cookieStore.toString() },
      params: { cartId, cartItemId },
      body: { qty: item.qty },
    });
    if (body.status === 'success') {
      return { success: true, cart: body.data.cart };
    }
    console.error('Cannot add to cart');
    return { success: false };
  }

  if (cartId) {
    const { body } = await client.cart.createCartItem({
      extraHeaders: { Cookie: cookieStore.toString() },
      params: { cartId },
      body: { qty: item.qty, productSkuId: item.productSkuId },
    });
    if (body.status === 'success') {
      return { success: true, cart: body.data.cart };
    }
    console.error('Cannot create cart item');
    return { success: false };
  }

  const cartCreationRes = await client.cart.createCart({
    extraHeaders: { Cookie: cookieStore.toString() },
    body: null,
  });
  if (cartCreationRes.body.status === 'success') {
    const { body } = await client.cart.createCartItem({
      extraHeaders: { Cookie: cookieStore.toString() },
      params: { cartId: cartCreationRes.body.data.cart.id },
      body: { qty: item.qty, productSkuId: item.productSkuId },
    });
    if (body.status === 'success') {
      return { success: true, cart: body.data.cart };
    }
    console.error('Cannot create cart item');
    return { success: false };
  }
  console.error('Cannot create cart');
  return { success: false };
}
