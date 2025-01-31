import { initContract } from '@ts-rest/core';
import type {
  FullProductVariantResponseDto,
  ProductVariantCreateDto,
  ProductVariantQueryDto,
  ProductVariantResponseDto,
  ProductVariantUpdateDto,
} from './dto/product.dto.js';
import type {
  ErrorResponseData,
  PaginationDto,
  SuccessResponseData,
} from './dto/misc.js';

const c = initContract();
const pathname = '/product-vars';
const idSlug = ':productVarId';

const productVariantContract = c.router({
  createProductVariant: {
    method: 'POST',
    path: pathname,
    summary: 'Create product var',
    body: c.type<ProductVariantCreateDto>(),
    responses: {
      201: c.type<
        SuccessResponseData<{ productVariant: ProductVariantResponseDto }>
      >(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
    },
  },
  getProductVariantById: {
    method: 'GET',
    path: `${pathname}/${idSlug}`,
    summary: 'Get product var by id',
    pathParams: c.type<{ productVarId: string }>(),
    responses: {
      200: c.type<
        SuccessResponseData<{ productVariant: FullProductVariantResponseDto }>
      >(),
      404: c.type<ErrorResponseData>(),
    },
  },
  getProductVariants: {
    method: 'GET',
    path: pathname,
    summary: 'Get all product vars',
    query: c.type<null | ProductVariantQueryDto>(),
    responses: {
      200: c.type<
        SuccessResponseData<{
          productVariants: ProductVariantResponseDto[];
          pagination: PaginationDto;
        }>
      >(),
      400: c.type<ErrorResponseData>(),
    },
  },
  updateProductVariant: {
    method: 'PATCH',
    path: `${pathname}/${idSlug}`,
    summary: 'Update product var by id',
    body: c.type<ProductVariantUpdateDto>(),
    pathParams: c.type<{ productVarId: string }>(),
    responses: {
      200: c.type<
        SuccessResponseData<{ productVariant: ProductVariantResponseDto }>
      >(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteProductVariant: {
    method: 'DELETE',
    path: `${pathname}/${idSlug}`,
    summary: 'Delete product var by id',
    pathParams: c.type<{ productVarId: string }>(),
    responses: {
      200: c.type<
        SuccessResponseData<{ productVariant: ProductVariantResponseDto }>
      >(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteProductVariants: {
    method: 'POST',
    path: `${pathname}/command/bulkDelete`,
    summary: 'Delete multiple product vars',
    body: c.type<{ ids: string[] }>(),
    responses: {
      200: c.type<
        SuccessResponseData<{ productVariants: ProductVariantResponseDto[] }>
      >(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
});

export { productVariantContract };
