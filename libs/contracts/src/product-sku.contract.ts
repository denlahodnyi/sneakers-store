import { initContract } from '@ts-rest/core';
import type {
  FullProductSkuResponseDto,
  ProductSkuCreateDto,
  ProductSkuQueryDto,
  ProductSkuResponseDto,
  ProductSkuUpdateDto,
} from './dto/product.dto.js';
import type {
  ErrorResponseData,
  PaginationDto,
  SuccessResponseData,
} from './dto/misc.js';

const c = initContract();
const pathname = '/product-skus';
const idSlug = ':productSkuId';

const productSkuContract = c.router({
  createProductSku: {
    method: 'POST',
    path: pathname,
    summary: 'Create product sku',
    body: c.type<ProductSkuCreateDto>(),
    responses: {
      201: c.type<SuccessResponseData<{ productSku: ProductSkuResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
    },
  },
  getProductSkuById: {
    method: 'GET',
    path: `${pathname}/${idSlug}`,
    summary: 'Get product sku by id',
    pathParams: c.type<{ productSkuId: string }>(),
    responses: {
      200: c.type<
        SuccessResponseData<{ productSku: FullProductSkuResponseDto }>
      >(),
      404: c.type<ErrorResponseData>(),
    },
  },
  getProductSkus: {
    method: 'GET',
    path: pathname,
    summary: 'Get all product skus',
    query: c.type<null | ProductSkuQueryDto>(),
    responses: {
      200: c.type<
        SuccessResponseData<{
          productSkus: ProductSkuResponseDto[];
          pagination: PaginationDto;
        }>
      >(),
      400: c.type<ErrorResponseData>(),
    },
  },
  updateProductSku: {
    method: 'PATCH',
    path: `${pathname}/${idSlug}`,
    summary: 'Update product sku by id',
    body: c.type<ProductSkuUpdateDto>(),
    pathParams: c.type<{ productSkuId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ productSku: ProductSkuResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteProductSku: {
    method: 'DELETE',
    path: `${pathname}/${idSlug}`,
    summary: 'Delete product sku by id',
    pathParams: c.type<{ productSkuId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ productSku: ProductSkuResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteProductSkus: {
    method: 'POST',
    path: `${pathname}/command/bulkDelete`,
    summary: 'Delete multiple product skus',
    body: c.type<{ ids: string[] }>(),
    responses: {
      200: c.type<
        SuccessResponseData<{ productSkus: ProductSkuResponseDto[] }>
      >(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
});

export { productSkuContract };
