'use server';
import { cookies } from 'next/headers';

import { getServerClient } from '~/shared/api';

const client = getServerClient();

export async function clearCart(cartId: string) {
  const cookieStore = await cookies();
  const { body } = await client.cart.deleteAllCartItems({
    extraHeaders: { Cookie: cookieStore.toString() },
    params: { cartId },
  });
  if (body.status === 'success') {
    return { success: true };
  }
  console.error('Cannot clear cart');
  return { success: false };
}
