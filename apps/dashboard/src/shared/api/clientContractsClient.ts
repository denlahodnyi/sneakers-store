import { contract } from '@sneakers-store/contracts';
import { initClient, type InitClientArgs } from '@ts-rest/core';

import { env } from '../config/env';

export function getClientSideClient(initClientArgs?: InitClientArgs) {
  const baseUrl = env.NEXT_PUBLIC_API_URL;
  return initClient(contract, {
    baseUrl,
    baseHeaders: {
      'Content-Type': 'application/json',
    },
    throwOnUnknownStatus: true,
    ...(initClientArgs || {}),
  });
}
