import { contract } from '@sneakers-store/contracts';
import { initClient, type InitClientArgs } from '@ts-rest/core';

import { env } from '../libs/env';

export function getClient(initClientArgs?: InitClientArgs) {
  const baseUrl = env.API_URL;
  return initClient(contract, {
    baseUrl,
    throwOnUnknownStatus: true,
    ...(initClientArgs || {}),
  });
}
