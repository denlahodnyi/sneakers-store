import { initContract } from '@ts-rest/core';
import type {
  UserCreateDto,
  UserResponseDto,
  UserSignInDto,
  UserUpdateDto,
} from './dto/user.dto.js';
import type {
  SessionCreateDto,
  SessionResponseDto,
  SessionUpdateDto,
} from './dto/session.dto.js';
import type {
  AccountCreateDto,
  AccountResponseDto,
} from './dto/account.dto.js';

const c = initContract();

export type SuccessResponseData<TData> = {
  status: 'success';
  data: TData;
};

export type ErrorResponseData = {
  status: 'error';
  statusCode: number;
  message: string | null;
  details: string | null;
  errors: FormattedErrors | null;
};

export interface FormattedErrors {
  [k: string]: string[] | FormattedErrors;
}

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
    getUser: {
      method: 'GET',
      path: '/users/:userId',
      summary: 'Get user by id',
      pathParams: c.type<{ userId: string }>(),
      responses: {
        200: c.type<
          SuccessResponseData<{
            user: UserResponseDto | null;
          }>
        >(),
        400: c.type<ErrorResponseData>(),
        401: c.type<ErrorResponseData>(),
        403: c.type<ErrorResponseData>(),
      },
    },
    getUserByAccountOrEmail: {
      method: 'GET',
      path: '/users',
      summary: 'Get user by query (email, providerAccountId + provider)',
      query: c.type<
        { email: string } | { providerAccountId: string; provider: string }
      >(),
      responses: {
        200: c.type<SuccessResponseData<{ user: UserResponseDto | null }>>(),
      },
    },
    createUser: {
      method: 'POST',
      path: '/users',
      summary: 'Create user',
      body: c.type<UserCreateDto>(),
      responses: {
        201: c.type<SuccessResponseData<{ user: UserResponseDto }>>(),
        400: c.type<ErrorResponseData>(),
      },
    },
    signIn: {
      method: 'POST',
      path: '/users/signin',
      summary: 'Sign in with credentials',
      body: c.type<UserSignInDto>(),
      responses: {
        200: c.type<SuccessResponseData<{ user: UserResponseDto }>>(),
        400: c.type<ErrorResponseData>(),
        403: c.type<ErrorResponseData>(),
        404: c.type<ErrorResponseData>(),
      },
    },
    updateUser: {
      method: 'PATCH',
      path: '/users/:userId',
      summary: 'Update user by id',
      pathParams: c.type<{ userId: string }>(),
      body: c.type<UserUpdateDto>(),
      responses: {
        200: c.type<SuccessResponseData<{ user: UserResponseDto | null }>>(),
        400: c.type<ErrorResponseData>(),
        401: c.type<ErrorResponseData>(),
        403: c.type<ErrorResponseData>(),
        404: c.type<ErrorResponseData>(),
      },
    },
    deleteUser: {
      method: 'DELETE',
      path: '/users/:userId',
      summary: 'Delete user by id',
      pathParams: c.type<{ userId: string }>(),
      responses: {
        200: c.type<SuccessResponseData<{ user: UserResponseDto | null }>>(),
        400: c.type<ErrorResponseData>(),
        401: c.type<ErrorResponseData>(),
        403: c.type<ErrorResponseData>(),
      },
    },
    createSession: {
      method: 'POST',
      path: '/sessions',
      summary: 'Create session',
      body: c.type<SessionCreateDto>(),
      responses: {
        201: c.type<SuccessResponseData<{ session: SessionResponseDto }>>(),
        400: c.type<ErrorResponseData>(),
      },
    },
    getSession: {
      method: 'GET',
      path: '/sessions/:sessionId',
      summary: 'Get session and user by sessionId',
      pathParams: c.type<{ sessionId: string }>(),
      responses: {
        200: c.type<
          SuccessResponseData<
            | { session: SessionResponseDto; user: UserResponseDto }
            | { session: null; user: null }
          >
        >(),
      },
    },
    updateSession: {
      method: 'PATCH',
      path: '/sessions/:sessionId',
      summary: 'Update session by id',
      pathParams: c.type<{ sessionId: string }>(),
      body: c.type<SessionUpdateDto>(),
      responses: {
        200: c.type<
          SuccessResponseData<{ session: SessionResponseDto | null }>
        >(),
        400: c.type<ErrorResponseData>(),
      },
    },
    deleteSession: {
      method: 'DELETE',
      path: '/sessions/:sessionId',
      summary: 'Delete session',
      pathParams: c.type<{ sessionId: string }>(),
      responses: {
        200: c.type<
          SuccessResponseData<{ session: SessionResponseDto | null }>
        >(),
      },
    },
    createAccount: {
      method: 'POST',
      path: '/accounts',
      summary: 'Create account',
      body: c.type<AccountCreateDto>(),
      responses: {
        201: c.type<SuccessResponseData<{ account: AccountResponseDto }>>(),
        400: c.type<ErrorResponseData>(),
      },
    },
    deleteAccount: {
      method: 'DELETE',
      path: '/accounts/:provider/:providerAccountId',
      summary: 'Delete account',
      pathParams: c.type<{ provider: string; providerAccountId: string }>(),
      responses: {
        200: c.type<
          SuccessResponseData<{ account: AccountResponseDto | null }>
        >(),
      },
    },
  },
  { strictStatusCodes: true }
);

type Contract = typeof contract;
export type { Contract };
export type * as TsRestCore from '@ts-rest/core';
export * from './dto/user.dto.js';
export * from './dto/account.dto.js';
export * from './dto/session.dto.js';
