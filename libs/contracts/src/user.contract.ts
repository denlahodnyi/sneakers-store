import { initContract } from '@ts-rest/core';
import type {
  ErrorResponseData,
  PaginationDto,
  SuccessResponseData,
} from './dto/misc.js';
import type {
  UserCreateDto,
  UserQueryDto,
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
  getUsers: {
    method: 'GET',
    path: '/users',
    summary:
      'Get user by query (email, providerAccountId + provider, pagination)',
    query: c.type<UserQueryDto | null>(),
    responses: {
      200: c.type<
        SuccessResponseData<{
          users: UserResponseDto[];
          pagination: PaginationDto;
        }>
      >(),
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
  deleteUsers: {
    method: 'POST',
    path: `/users/command/bulkDelete`,
    summary: 'Delete multiple users',
    body: c.type<{ ids: string[] }>(),
    responses: {
      200: c.type<SuccessResponseData<{ sizes: UserResponseDto[] }>>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
});

export { userContract };
