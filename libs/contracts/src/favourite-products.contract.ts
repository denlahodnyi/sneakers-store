import { initContract } from '@ts-rest/core';
import type { ErrorResponseData, SuccessResponseData } from './dto/misc.js';
import type {
  FavProductCreateDto,
  FavProductDto,
  FavProductRemoveDto,
} from './dto/product.dto.js';

const c = initContract();
const pathname = '/favourite-products';
const idSlug = ':id';

const favProductsContract = c.router({
  addFavProduct: {
    method: 'POST',
    path: pathname,
    summary: '',
    body: c.type<FavProductCreateDto>(),
    responses: {
      201: c.type<SuccessResponseData<{ product: { id: string } }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
    },
  },
  getTotalFavProducts: {
    method: 'GET',
    path: `${pathname}/total`,
    summary: 'Get favourite products total count',
    responses: {
      200: c.type<SuccessResponseData<{ total: number }>>(),
      401: c.type<ErrorResponseData>(),
    },
  },
  getFullFavProducts: {
    method: 'GET',
    path: `${pathname}/full`,
    summary: 'Get full favourite products',
    responses: {
      200: c.type<SuccessResponseData<{ products: FavProductDto[] }>>(),
      401: c.type<ErrorResponseData>(),
    },
  },
  removeFavProduct: {
    method: 'POST',
    path: `${pathname}/command/delete`,
    summary: 'Delete favourite product by id',
    body: c.type<FavProductRemoveDto>(),
    responses: {
      200: c.type<SuccessResponseData<{ product: { id: string } }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
    },
  },
});

export { favProductsContract };
