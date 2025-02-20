'use server';

import { cookies } from 'next/headers';

import { getServerClient } from '~/shared/api';

const client = getServerClient();

export async function syncCarts(
  items: { productSkuId: string; qty: number }[],
  cartId?: string | null,
) {
  const cookieStore = await cookies();
  let userCartId = cartId;

  if (!userCartId) {
    const { body } = await client.cart.createCart({
      extraHeaders: { Cookie: cookieStore.toString() },
      body: null,
    });
    userCartId = body.status === 'success' ? body.data.cart.id : undefined;
  }

  if (userCartId) {
    const { body } = await client.cart.syncCart({
      extraHeaders: { Cookie: cookieStore.toString() },
      params: { cartId: userCartId },
      body: { items },
    });
    if (body.status === 'success') {
      return { success: true, cart: body.data.cart };
    }
    console.error('Cannot synchronize carts');
    return { success: false };
  }

  console.error('Cart id is required');
  return { success: false };
}
