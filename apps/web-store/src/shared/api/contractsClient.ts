import 'server-only';

import { contract } from '@sneakers-store/contracts';
import { initClient, type InitClientArgs } from '@ts-rest/core';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@sneakers-store/next-auth';

import { env } from '../config/env';

export function getClient(
  initClientArgs?: Partial<InitClientArgs> & {
    isRSC?: boolean;
    redirectOnLogoutTo?: string;
  },
) {
  const {
    isRSC = false,
    redirectOnLogoutTo,
    ...clientArgs
  } = initClientArgs || {};
  const baseUrl = env.API_URL;
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
        if (isRSC) {
          // Setting cookies cannot be done directly in a Server Component, even
          // when using a Route Handler or Server Action.
          // https://nextjs.org/docs/app/api-reference/functions/cookies#understanding-cookie-behavior-in-server-components
          return {
            status: 401,
            headers: response.headers,
            body: { status: 'error' },
          };
        } else {
          const cookieStore = await cookies();
          cookieStore.delete(SESSION_COOKIE_NAME);
          if (redirectOnLogoutTo) redirect(redirectOnLogoutTo);
          else {
            return {
              status: 401,
              headers: response.headers,
              body: { status: 'error' },
            };
          }
        }
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
