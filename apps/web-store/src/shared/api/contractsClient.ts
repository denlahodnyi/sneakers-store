import 'server-only';

import { contract } from '@sneakers-store/contracts';
import { initClient, type InitClientArgs } from '@ts-rest/core';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@sneakers-store/next-auth';

import { env } from '../config/env';

export function getClient(initClientArgs?: InitClientArgs) {
  const baseUrl = env.API_URL;
  return initClient(contract, {
    baseUrl,
    baseHeaders: {
      'Content-Type': 'application/json',
    },
    throwOnUnknownStatus: true,
    ...(initClientArgs || {}),
    api: async (args) => {
      const response = await fetch(args.path, {
        method: args.method,
        headers: args.headers,
        body: args.body,
      });
      if (!response.ok && response.status === 401) {
        const cookieStore = await cookies();
        cookieStore.delete(SESSION_COOKIE_NAME);
        redirect('/login');
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
