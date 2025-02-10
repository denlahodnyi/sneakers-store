'use server';
import { cookies } from 'next/headers';

import { getServerClient } from '~/shared/api';

const client = getServerClient();

export async function removeFromCart(cartId: string, cartItemId: string) {
  const cookieStore = await cookies();
  const { body } = await client.cart.deleteCartItem({
    extraHeaders: { Cookie: cookieStore.toString() },
    params: { cartId, cartItemId },
  });
  if (body.status === 'success') {
    return { success: true, cart: body.data.cart };
  }
  console.error('Cannot remove item from cart');
  return { success: false };
}
