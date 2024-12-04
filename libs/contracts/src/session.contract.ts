import { initContract } from '@ts-rest/core';
import type { ErrorResponseData, SuccessResponseData } from './dto/misc.js';
import type {
  SessionCreateDto,
  SessionResponseDto,
  SessionUpdateDto,
} from './dto/session.dto.js';
import type { UserResponseDto } from './dto/user.dto.js';

const c = initContract();
const pathname = '/sessions';
const idSlug = ':sessionId';

const sessionContract = c.router({
  createSession: {
    method: 'POST',
    path: pathname,
    summary: 'Create session',
    body: c.type<SessionCreateDto>(),
    responses: {
      201: c.type<SuccessResponseData<{ session: SessionResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
    },
  },
  getSession: {
    method: 'GET',
    path: `${pathname}/${idSlug}`,
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
    path: `${pathname}/${idSlug}`,
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
    path: `${pathname}/${idSlug}`,
    summary: 'Delete session',
    pathParams: c.type<{ sessionId: string }>(),
    responses: {
      200: c.type<
        SuccessResponseData<{ session: SessionResponseDto | null }>
      >(),
    },
  },
});

export { sessionContract };
