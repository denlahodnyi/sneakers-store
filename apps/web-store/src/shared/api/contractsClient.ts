import { contract } from '@sneakers-store/contracts';
import { initClient, type InitClientArgs } from '@ts-rest/core';

import { env } from '../config/env';

export function getClient(
  initClientArgs?: Partial<InitClientArgs> & {
    isRSC?: boolean;
    redirectOnLogoutTo?: string;
  },
) {
  const { ...clientArgs } = initClientArgs || {};
  const baseUrl = env.NEXT_PUBLIC_API_URL;
  return initClient(contract, {
    baseUrl,
    baseHeaders: {
      'Content-Type': 'application/json',
    },
    throwOnUnknownStatus: true,
    ...(clientArgs || {}),
    api: async (args) => {
      const response = await fetch(args.path, {
        method: args.method,
        headers: args.headers,
        body: args.body,
      });
      if (!response.ok && response.status === 401) {
        return {
          status: 401,
          headers: response.headers,
          body: { status: 'error' },
        };
      } else {
        const result = await response.json();
        return {
          body: result,
          status: response.status,
          headers: response.headers,
        };
      }
    },
  });
}
