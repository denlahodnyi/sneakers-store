import { initContract } from '@ts-rest/core';
import type { ErrorResponseData, SuccessResponseData } from './dto/misc.js';
import type {
  AccountCreateDto,
  AccountResponseDto,
} from './dto/account.dto.js';

const c = initContract();
const pathname = '/accounts';

const accountContract = c.router({
  createAccount: {
    method: 'POST',
    path: pathname,
    summary: 'Create account',
    body: c.type<AccountCreateDto>(),
    responses: {
      201: c.type<SuccessResponseData<{ account: AccountResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
    },
  },
  deleteAccount: {
    method: 'DELETE',
    path: `${pathname}/:provider/:providerAccountId`,
    summary: 'Delete account',
    pathParams: c.type<{ provider: string; providerAccountId: string }>(),
    responses: {
      200: c.type<
        SuccessResponseData<{ account: AccountResponseDto | null }>
      >(),
    },
  },
});

export { accountContract };
