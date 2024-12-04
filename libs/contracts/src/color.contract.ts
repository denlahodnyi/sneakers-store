import { initContract } from '@ts-rest/core';
import type {
  ColorCreateDto,
  ColorUpdateDto,
  ColorResponseDto,
} from './dto/color.dto.js';
import type { ErrorResponseData, SuccessResponseData } from './dto/misc.js';

const c = initContract();
const pathname = '/colors';
const idSlug = ':colorId';

const colorContract = c.router({
  createColor: {
    method: 'POST',
    path: pathname,
    summary: 'Create color',
    body: c.type<ColorCreateDto>(),
    responses: {
      201: c.type<SuccessResponseData<{ color: ColorResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
    },
  },
  getColorById: {
    method: 'GET',
    path: `${pathname}/${idSlug}`,
    summary: 'Get color by id',
    pathParams: c.type<{ colorId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ color: ColorResponseDto }>>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  getColors: {
    method: 'GET',
    path: pathname,
    summary: 'Get all colors',
    responses: {
      200: c.type<SuccessResponseData<{ colors: ColorResponseDto[] }>>(),
    },
  },
  updateColor: {
    method: 'PATCH',
    path: `${pathname}/${idSlug}`,
    summary: 'Update color by id',
    body: c.type<ColorUpdateDto>(),
    pathParams: c.type<{ colorId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ color: ColorResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteColor: {
    method: 'DELETE',
    path: `${pathname}/${idSlug}`,
    summary: 'Delete color by id',
    pathParams: c.type<{ colorId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ color: ColorResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteColors: {
    method: 'POST',
    path: `${pathname}/command/bulkDelete`,
    summary: 'Delete multiple colors',
    body: c.type<{ ids: string[] }>(),
    responses: {
      200: c.type<SuccessResponseData<{ colors: ColorResponseDto[] }>>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
});

export { colorContract };
