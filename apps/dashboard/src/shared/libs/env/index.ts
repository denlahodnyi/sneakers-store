import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const clientPrefix = 'NEXT_PUBLIC_';

export const env = createEnv({
  shared: {},
  server: {
    API_URL: z.string().url(),
  },
  client: {
    [`${clientPrefix}API_URL`]: z.string().url(),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    API_URL: process.env.API_URL,
    [`${clientPrefix}API_URL`]: process.env.API_URL,
  },
});
