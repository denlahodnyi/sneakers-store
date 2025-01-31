import { initContract } from '@ts-rest/core';
import type {
  DiscountCreateDto,
  DiscountQueryDto,
  DiscountResponseDto,
  DiscountUpdateDto,
} from './dto/discount.dto.js';
import type { ErrorResponseData, SuccessResponseData } from './dto/misc.js';

const c = initContract();
const pathname = '/discounts';
const idSlug = ':discountId';

const discountContract = c.router({
  createDiscount: {
    method: 'POST',
    path: pathname,
    summary: 'Create discount',
    body: c.type<DiscountCreateDto>(),
    responses: {
      201: c.type<SuccessResponseData<{ discount: DiscountResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
    },
  },
  getDiscountById: {
    method: 'GET',
    path: `${pathname}/${idSlug}`,
    summary: 'Get discount by id',
    pathParams: c.type<{ discountId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ discount: DiscountResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  getDiscounts: {
    method: 'GET',
    path: pathname,
    summary: 'Get all discounts',
    query: c.type<null | DiscountQueryDto>(),
    responses: {
      200: c.type<SuccessResponseData<{ discounts: DiscountResponseDto[] }>>(),
      400: c.type<ErrorResponseData>(),
    },
  },
  updateDiscount: {
    method: 'PATCH',
    path: `${pathname}/${idSlug}`,
    summary: 'Update discount by id',
    body: c.type<DiscountUpdateDto>(),
    pathParams: c.type<{ discountId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ discount: DiscountResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteDiscount: {
    method: 'DELETE',
    path: `${pathname}/${idSlug}`,
    summary: 'Delete products discount by id',
    pathParams: c.type<{ discountId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ discount: DiscountResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  // deleteDiscounts: {
  //   method: 'POST',
  //   path: `${pathname}/command/bulkDelete`,
  //   summary: 'Delete multiple discounts',
  //   body: c.type<{ ids: number[] }>(),
  //   responses: {
  //     200: c.type<SuccessResponseData<{ discounts: DiscountResponseDto[] }>>(),
  //     401: c.type<ErrorResponseData>(),
  //     403: c.type<ErrorResponseData>(),
  //     404: c.type<ErrorResponseData>(),
  //   },
  // },
});

export { discountContract };
