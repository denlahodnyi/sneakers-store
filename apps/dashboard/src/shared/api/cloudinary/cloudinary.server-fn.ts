'use server';

import { v2 as cloudinary } from 'cloudinary';

import { env } from '~/shared/config';

cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function deleteClAssetByPublicId(publicId: string) {
  try {
    (await cloudinary.uploader.destroy(publicId)) as {
      result: 'ok';
    };
    return { success: true };
  } catch (err) {
    if (err instanceof Error) return { success: false, error: err };
    return { success: false, error: new Error('deleteAssetByPublicId error') };
  }
}
