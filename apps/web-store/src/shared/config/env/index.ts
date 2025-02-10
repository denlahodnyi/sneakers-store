import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  shared: {},
  server: {
    API_URL: z.string().url(),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  emptyStringAsUndefined: true,
  isServer: typeof window === 'undefined',
  onValidationError(error) {
    throw new Error(JSON.stringify(error.format()));
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
