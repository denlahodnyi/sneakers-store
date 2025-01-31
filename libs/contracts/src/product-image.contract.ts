import { initContract } from '@ts-rest/core';
import type {
  ProductImage,
  ProductImageCreateDto,
  ProductImageUpdateDto,
} from './dto/product.dto.js';
import type { ErrorResponseData, SuccessResponseData } from './dto/misc.js';

const c = initContract();
const pathname = '/product-images';
const idSlug = ':productImageId';

const productImgContract = c.router({
  createProductImg: {
    method: 'POST',
    path: pathname,
    summary: 'Create product image',
    body: c.type<ProductImageCreateDto>(),
    responses: {
      201: c.type<SuccessResponseData<{ image: ProductImage }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
    },
  },
  getProductImgById: {
    method: 'GET',
    path: `${pathname}/${idSlug}`,
    summary: 'Get product image by id',
    pathParams: c.type<{ productImageId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ image: ProductImage }>>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  getProductImages: {
    method: 'GET',
    path: pathname,
    summary: 'Get all product images',
    responses: {
      200: c.type<SuccessResponseData<{ images: ProductImage[] }>>(),
    },
  },
  updateProductImage: {
    method: 'PATCH',
    path: `${pathname}/${idSlug}`,
    summary: 'Update product image by id',
    body: c.type<ProductImageUpdateDto>(),
    pathParams: c.type<{ productImageId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ image: ProductImage }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteProductImage: {
    method: 'DELETE',
    path: `${pathname}/${idSlug}`,
    summary: 'Delete product image by id',
    pathParams: c.type<{ productImageId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ image: ProductImage }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  // deleteProductSkus: {
  //   method: 'POST',
  //   path: `${pathname}/command/bulkDelete`,
  //   summary: 'Delete multiple product images',
  //   body: c.type<{ ids: string[] }>(),
  //   responses: {
  //     200: c.type<SuccessResponseData<{ image: ProductImage[] }>>(),
  //     401: c.type<ErrorResponseData>(),
  //     403: c.type<ErrorResponseData>(),
  //     404: c.type<ErrorResponseData>(),
  //   },
  // },
});

export { productImgContract };
