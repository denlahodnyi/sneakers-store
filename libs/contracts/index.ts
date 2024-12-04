import { initContract } from '@ts-rest/core';
import { categoryContract } from './src/category.contract.js';
import { brandContract } from './src/brand.contract.js';
import { colorContract } from './src/color.contract.js';
import { userContract } from './src/user.contract.js';
import { sessionContract } from './src/session.contract.js';
import { accountContract } from './src/account.contract.js';

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
    users: userContract,
    accounts: accountContract,
    sessions: sessionContract,
    categories: categoryContract,
    brands: brandContract,
    colors: colorContract,
  },
  { strictStatusCodes: true }
);

type Contract = typeof contract;
export type { Contract };
export type * as TsRestCore from '@ts-rest/core';
export * from './src/dto/misc.js';
export * from './src/dto/user.dto.js';
export * from './src/dto/account.dto.js';
export * from './src/dto/session.dto.js';
export * from './src/dto/category.dto.js';
export * from './src/dto/brand.dto.js';
export * from './src/dto/color.dto.js';
