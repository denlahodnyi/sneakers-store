import { initContract } from '@ts-rest/core';
import type { ErrorResponseData, SuccessResponseData } from './dto/misc.js';
import type {
  CartGenBodyDto,
  CartItemCreateDto,
  CartItemUpdateDto,
  CartResponseDto,
  CartSyncBodyDto,
} from './dto/cart.dto.js';

const c = initContract();
const cartPathname = '/carts';
const cartIdSlug = ':cartId';
const cartItemPathname = '/items';
const cartItemIdSlug = ':cartItemId';

const cartContract = c.router({
  createCart: {
    method: 'POST',
    path: cartPathname,
    summary: 'Create cart',
    body: c.type<null>(),
    responses: {
      201: c.type<SuccessResponseData<{ cart: { id: string } }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
    },
  },
  deleteCart: {
    method: 'DELETE',
    path: `${cartPathname}/${cartIdSlug}`,
    summary: 'Delete cart by id',
    pathParams: c.type<{ cartId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ cart: { id: string } }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
    },
  },
  getUserCart: {
    method: 'GET',
    path: cartPathname,
    summary: 'Get user cart',
    responses: {
      200: c.type<SuccessResponseData<{ cart: CartResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
    },
  },
  syncCart: {
    method: 'POST',
    path: `${cartPathname}/${cartIdSlug}/command/sync`,
    summary: 'Sync user carts (locally persisted and stored in DB)',
    body: c.type<CartSyncBodyDto>(),
    pathParams: c.type<{ cartId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ cart: CartResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
    },
  },
  generateCart: {
    method: 'POST',
    path: `${cartPathname}/command/generate`,
    summary: 'Generate cart using selected product sku ids',
    body: c.type<CartGenBodyDto>(),
    responses: {
      200: c.type<SuccessResponseData<{ cart: CartResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
    },
  },
  createCartItem: {
    method: 'POST',
    path: `${cartPathname}/${cartIdSlug}${cartItemPathname}`,
    summary: 'Create cart item',
    body: c.type<CartItemCreateDto>(),
    pathParams: c.type<{ cartId: string }>(),
    responses: {
      201: c.type<SuccessResponseData<{ cart: CartResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
    },
  },
  updateCartItem: {
    method: 'PATCH',
    path: `${cartPathname}/${cartIdSlug}${cartItemPathname}/${cartItemIdSlug}`,
    summary: 'Update cart item',
    pathParams: c.type<{ cartId: string; cartItemId: string }>(),
    body: c.type<CartItemUpdateDto>(),
    responses: {
      200: c.type<SuccessResponseData<{ cart: CartResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
    },
  },
  deleteCartItem: {
    method: 'DELETE',
    path: `${cartPathname}/${cartIdSlug}${cartItemPathname}/${cartItemIdSlug}`,
    summary: 'Delete cart item',
    pathParams: c.type<{ cartId: string; cartItemId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ cart: CartResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
    },
  },
  deleteAllCartItems: {
    method: 'DELETE',
    path: `${cartPathname}/${cartIdSlug}${cartItemPathname}/command/deleteAll`,
    summary: 'Delete all cart item',
    pathParams: c.type<{ cartId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ cart: { id: string } }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
    },
  },
});

export { cartContract };
