'use server';

import { cookies } from 'next/headers';

import { getServerClient } from '~/shared/api';

const client = getServerClient();

export async function syncCarts(
  cartId: string,
  items: { productSkuId: string; qty: number }[],
) {
  const cookieStore = await cookies();
  const { body } = await client.cart.syncCart({
    extraHeaders: { Cookie: cookieStore.toString() },
    params: { cartId },
    body: { items },
  });
  if (body.status === 'success') {
    return { success: true, cart: body.data.cart };
  }
  console.error('Cannot synchronize carts');
  return { success: false };
}
