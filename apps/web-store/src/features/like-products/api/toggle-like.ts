'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

import { getClient, TOTAL_LIKES_TAG } from '~/shared/api';

const client = getClient();

export const toggleLike = async (productVarId: string, isLiked: boolean) => {
  const cookieStore = await cookies();
  let success = false;
  if (isLiked) {
    const { body } = await client.favoriteProducts.addFavProduct({
      extraHeaders: { Cookie: cookieStore.toString() },
      body: { productVarId },
    });
    if (body.status === 'success') {
      success = true;
    }
  } else {
    const { body } = await client.favoriteProducts.removeFavProduct({
      extraHeaders: { Cookie: cookieStore.toString() },
      body: { productVarId },
    });
    if (body.status === 'success') {
      success = true;
    }
  }

  if (success) revalidateTag(TOTAL_LIKES_TAG);

  return { success };
};
