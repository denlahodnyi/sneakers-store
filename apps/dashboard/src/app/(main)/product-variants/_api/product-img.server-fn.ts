'use server';

import type {
  inferDtoErrors,
  ProductImageCreateDto,
  ProductImageUpdateDto,
} from '@sneakers-store/contracts';
import { cookies } from 'next/headers';

import { deleteClAssetByPublicId, getClient } from '~/shared/api';

const client = getClient();

export async function createImage(payload: ProductImageCreateDto) {
  const cookie = await cookies();
  const { body } = await client.productImages.createProductImg({
    extraHeaders: {
      Cookie: cookie.toString(),
    },
    body: payload,
  });

  if (body.status === 'success') {
    return { success: true, image: body.data.image };
  } else if (body.errors) {
    return {
      success: false,
      errors: body.errors as inferDtoErrors<ProductImageUpdateDto>,
      _ts: Date.now().valueOf(),
    };
  }

  throw new Error(body.message || 'Cannot create product image', {
    cause: body,
  });
}

export async function updateImage(payload: {
  imageId: string;
  publicId?: string;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
}) {
  const cookie = await cookies();
  const { body } = await client.productImages.updateProductImage({
    extraHeaders: {
      Cookie: cookie.toString(),
    },
    params: { productImageId: payload.imageId },
    body: {
      id: payload.imageId,
      publicId: payload.publicId,
      url: payload.url,
      alt: payload.alt,
      width: payload.width,
      height: payload.height,
    },
  });

  if (body.status === 'success') {
    return { success: true, image: body.data.image };
  } else if (body.errors) {
    return {
      success: false,
      errors: body.errors as inferDtoErrors<ProductImageUpdateDto>,
      _ts: Date.now().valueOf(),
    };
  }

  throw new Error(body.message || 'Cannot update product image', {
    cause: body,
  });
}

export async function deleteImage(imageId: string, publicId: string) {
  const cookie = await cookies();
  const { body } = await client.productImages.deleteProductImage({
    extraHeaders: {
      Cookie: cookie.toString(),
    },
    params: { productImageId: imageId },
  });
  if (body.status === 'success') {
    try {
      await deleteClAssetByPublicId(publicId);
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false };
      }
      return { success: false };
    }
  }
  return {
    success: false,
  };
}
