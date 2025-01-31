import { initContract } from '@ts-rest/core';
import type {
  SizeCreateDto,
  SizeQueryDto,
  SizeResponseDto,
  SizeUpdateDto,
} from './dto/size.dto.js';
import type { ErrorResponseData, SuccessResponseData } from './dto/misc.js';

const c = initContract();
const pathname = '/sizes';
const idSlug = ':sizeId';

const sizeContract = c.router({
  createSize: {
    method: 'POST',
    path: pathname,
    summary: 'Create size',
    body: c.type<SizeCreateDto>(),
    responses: {
      201: c.type<SuccessResponseData<{ size: SizeResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
    },
  },
  getSizeById: {
    method: 'GET',
    path: `${pathname}/${idSlug}`,
    summary: 'Get size by id',
    pathParams: c.type<{ sizeId: number }>(),
    responses: {
      200: c.type<SuccessResponseData<{ size: SizeResponseDto }>>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  getSizes: {
    method: 'GET',
    path: pathname,
    summary: 'Get all sizes',
    query: c.type<null | SizeQueryDto>(),
    responses: {
      200: c.type<SuccessResponseData<{ sizes: SizeResponseDto[] }>>(),
    },
  },
  updateSize: {
    method: 'PATCH',
    path: `${pathname}/${idSlug}`,
    summary: 'Update size by id',
    body: c.type<SizeUpdateDto>(),
    pathParams: c.type<{ sizeId: number }>(),
    responses: {
      200: c.type<SuccessResponseData<{ size: SizeResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteSize: {
    method: 'DELETE',
    path: `${pathname}/${idSlug}`,
    summary: 'Delete products size by id',
    pathParams: c.type<{ sizeId: number }>(),
    responses: {
      200: c.type<SuccessResponseData<{ size: SizeResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteSizes: {
    method: 'POST',
    path: `${pathname}/command/bulkDelete`,
    summary: 'Delete multiple sizes',
    body: c.type<{ ids: number[] }>(),
    responses: {
      200: c.type<SuccessResponseData<{ sizes: SizeResponseDto[] }>>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
});

export { sizeContract };
