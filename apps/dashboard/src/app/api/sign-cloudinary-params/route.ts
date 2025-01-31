import { v2 as cloudinary } from 'cloudinary';

import { env } from '~/shared/config';

cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const body = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { paramsToSign } = body as Record<string, any>;

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    env.CLOUDINARY_API_SECRET,
  );

  return Response.json({ signature });
}
