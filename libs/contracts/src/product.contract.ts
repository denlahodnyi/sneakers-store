import { initContract } from '@ts-rest/core';
import type {
  FullProductResponseDto,
  ProductCreateDto,
  PreviewProductResponseDto,
  ProductUpdateDto,
  ProductResponseDto,
  ProductQueryDto,
} from './dto/product.dto.js';
import type {
  ErrorResponseData,
  PaginationDto,
  SuccessResponseData,
} from './dto/misc.js';

const c = initContract();
const pathname = '/products';
const idSlug = ':productId';

const productContract = c.router({
  createProduct: {
    method: 'POST',
    path: pathname,
    summary: 'Create product',
    body: c.type<ProductCreateDto>(),
    responses: {
      201: c.type<
        SuccessResponseData<{ product: PreviewProductResponseDto }>
      >(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
    },
  },
  getProductById: {
    method: 'GET',
    path: `${pathname}/${idSlug}`,
    summary: 'Get product by id',
    pathParams: c.type<{ productId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ product: FullProductResponseDto }>>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  getProducts: {
    method: 'GET',
    path: pathname,
    summary: 'Get all products',
    query: c.type<null | ProductQueryDto>(),
    responses: {
      200: c.type<
        SuccessResponseData<{
          products: PreviewProductResponseDto[];
          pagination: PaginationDto;
        }>
      >(),
      400: c.type<ErrorResponseData>(),
    },
  },
  updateProduct: {
    method: 'PATCH',
    path: `${pathname}/${idSlug}`,
    summary: 'Update product by id',
    body: c.type<ProductUpdateDto>(),
    pathParams: c.type<{ productId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ product: FullProductResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteProduct: {
    method: 'DELETE',
    path: `${pathname}/${idSlug}`,
    summary: 'Delete products product by id',
    pathParams: c.type<{ productId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ product: ProductResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteProducts: {
    method: 'POST',
    path: `${pathname}/command/bulkDelete`,
    summary: 'Delete multiple products',
    body: c.type<{ ids: string[] }>(),
    responses: {
      200: c.type<SuccessResponseData<{ products: ProductResponseDto[] }>>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
});

export { productContract };
