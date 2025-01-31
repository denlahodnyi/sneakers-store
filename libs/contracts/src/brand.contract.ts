import { initContract } from '@ts-rest/core';
import type {
  BrandCreateDto,
  BrandUpdateDto,
  BrandResponseDto,
  BrandQueryDto,
} from './dto/brand.dto.js';
import type { ErrorResponseData, SuccessResponseData } from './dto/misc.js';

const c = initContract();
const pathname = '/brands';
const idSlug = ':brandId';

const brandContract = c.router({
  createBrand: {
    method: 'POST',
    path: pathname,
    summary: 'Create brand',
    body: c.type<BrandCreateDto>(),
    responses: {
      201: c.type<SuccessResponseData<{ brand: BrandResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
    },
  },
  getBrandById: {
    method: 'GET',
    path: `${pathname}/${idSlug}`,
    summary: 'Get brand by id',
    pathParams: c.type<{ brandId: number }>(),
    responses: {
      200: c.type<SuccessResponseData<{ brand: BrandResponseDto }>>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  getBrands: {
    method: 'GET',
    path: pathname,
    summary: 'Get all brands',
    query: c.type<null | BrandQueryDto>(),
    responses: {
      200: c.type<SuccessResponseData<{ brands: BrandResponseDto[] }>>(),
    },
  },
  updateBrand: {
    method: 'PATCH',
    path: `${pathname}/${idSlug}`,
    summary: 'Update brand by id',
    body: c.type<BrandUpdateDto>(),
    pathParams: c.type<{ brandId: number }>(),
    responses: {
      200: c.type<SuccessResponseData<{ brand: BrandResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteBrand: {
    method: 'DELETE',
    path: `${pathname}/${idSlug}`,
    summary: 'Delete products brand by id',
    pathParams: c.type<{ brandId: number }>(),
    responses: {
      200: c.type<SuccessResponseData<{ brand: BrandResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteBrands: {
    method: 'POST',
    path: `${pathname}/command/bulkDelete`,
    summary: 'Delete multiple brands',
    body: c.type<{ ids: number[] }>(),
    responses: {
      200: c.type<SuccessResponseData<{ brands: BrandResponseDto[] }>>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
});

export { brandContract };
