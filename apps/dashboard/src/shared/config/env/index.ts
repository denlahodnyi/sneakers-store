import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const prefix = 'NEXT_PUBLIC_';

export const env = createEnv({
  shared: {},
  server: {
    API_URL: z.string().url(),
    CLOUDINARY_API_SECRET: z.string(),
  },
  client: {
    [`${prefix}API_URL`]: z.string().url(),
    [`${prefix}CLOUDINARY_CLOUD_NAME`]: z.string(),
    [`${prefix}CLOUDINARY_API_KEY`]: z.string(),
    [`${prefix}CLOUDINARY_UPLOAD_PRESET`]: z.string(),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    API_URL: process.env.API_URL,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,
    [`${prefix}API_URL`]: process.env[`${prefix}API_URL`],
    [`${prefix}CLOUDINARY_CLOUD_NAME`]:
      process.env[`${prefix}CLOUDINARY_CLOUD_NAME`],
    [`${prefix}CLOUDINARY_API_KEY`]: process.env[`${prefix}CLOUDINARY_API_KEY`],
    [`${prefix}CLOUDINARY_UPLOAD_PRESET`]:
      process.env[`${prefix}CLOUDINARY_UPLOAD_PRESET`],
  },
});
