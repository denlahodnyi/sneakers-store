import { initContract } from '@ts-rest/core';
import type { ErrorResponseData, SuccessResponseData } from './dto/misc.js';
import type {
  UserCreateDto,
  UserResponseDto,
  UserSignInDto,
  UserUpdateDto,
} from './dto/user.dto.js';

const c = initContract();

const userContract = c.router({
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
});

export { userContract };
