import { initContract } from '@ts-rest/core';
import type {
  ErrorResponseData,
  PaginationDto,
  SuccessResponseData,
} from './dto/misc.js';
import type {
  FullOrderResponseDto,
  OrderCreateDto,
  OrderQueryDto,
  OrderResponseDto,
  UserFullOrderResponseDto,
  UserOrderResponseDto,
} from './dto/order.dto.js';

const c = initContract();
const pathname = '/orders';
const idSlug = ':orderId';

const orderContract = c.router({
  getOrders: {
    method: 'GET',
    path: pathname,
    summary: 'Get all orders (admin)',
    query: c.type<OrderQueryDto | null>(),
    responses: {
      200: c.type<
        SuccessResponseData<{
          orders: OrderResponseDto[];
          pagination: PaginationDto;
        }>
      >(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
    },
  },
  getOrder: {
    method: 'GET',
    path: `${pathname}/${idSlug}`,
    summary: 'Get single order (admin)',
    pathParams: c.type<{ orderId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ order: FullOrderResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  getUserOrders: {
    method: 'GET',
    path: '/me/orders',
    summary: 'Get all user orders',
    query: c.type<OrderQueryDto | null>(),
    responses: {
      200: c.type<
        SuccessResponseData<{
          orders: UserOrderResponseDto[];
          pagination: PaginationDto;
        }>
      >(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
    },
  },
  getUserOrder: {
    method: 'GET',
    path: `/me/orders/:orderId`,
    summary: 'Get user order',
    pathParams: c.type<{ orderId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ order: UserFullOrderResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  createOrder: {
    method: 'POST',
    path: pathname,
    summary: 'Create order',
    body: c.type<OrderCreateDto>(),
    responses: {
      201: c.type<SuccessResponseData<{ order: OrderResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      500: c.type<ErrorResponseData>(),
    },
  },
  deleteOrder: {
    method: 'DELETE',
    path: `${pathname}/${idSlug}`,
    summary: 'Delete order by id (admin)',
    pathParams: c.type<{ orderId: string }>(),
    responses: {
      200: c.type<
        SuccessResponseData<{ order: { id: OrderResponseDto['id'] } }>
      >(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteOrders: {
    method: 'POST',
    path: `${pathname}/command/bulkDelete`,
    summary: 'Delete multiple orders (admin)',
    body: c.type<{ ids: string[] }>(),
    responses: {
      200: c.type<
        SuccessResponseData<{ orders: { id: OrderResponseDto['id'] }[] }>
      >(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
});

export { orderContract };
