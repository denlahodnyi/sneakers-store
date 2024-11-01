import { initContract } from '@ts-rest/core';

const c = initContract();

export const contract = c.router(
  {
    getRoot: {
      method: 'GET',
      path: '/',
      summary: 'API root',
      responses: {
        200: c.type<{ status: 'success' }>(),
      },
    },
  },
  { strictStatusCodes: true }
);

type Contract = typeof contract;
export type { Contract };
export type * as TsRestCore from '@ts-rest/core';
