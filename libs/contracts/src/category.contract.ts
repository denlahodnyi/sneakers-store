import { initContract } from '@ts-rest/core';
import type {
  CategoryCreateDto,
  CategoryResponseDto,
  CategoryUpdateDto,
} from './dto/category.dto.js';
import type { ErrorResponseData, SuccessResponseData } from './dto/misc.js';

const c = initContract();
const pathname = '/categories';
const idSlug = ':categoryId';

const categoryContract = c.router({
  createCategory: {
    method: 'POST',
    path: pathname,
    summary: 'Create products category',
    body: c.type<CategoryCreateDto>(),
    responses: {
      201: c.type<SuccessResponseData<{ category: CategoryResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
    },
  },
  getCategoryById: {
    method: 'GET',
    path: `${pathname}/${idSlug}`,
    summary: 'Get products category by id',
    pathParams: c.type<{ categoryId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ category: CategoryResponseDto }>>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  getCategories: {
    method: 'GET',
    path: pathname,
    summary: 'Get all categories',
    responses: {
      200: c.type<SuccessResponseData<{ categories: CategoryResponseDto[] }>>(),
    },
  },
  updateCategory: {
    method: 'PATCH',
    path: `${pathname}/${idSlug}`,
    summary: 'Update products category by id',
    body: c.type<CategoryUpdateDto>(),
    pathParams: c.type<{ categoryId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ category: CategoryResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteCategory: {
    method: 'DELETE',
    path: `${pathname}/${idSlug}`,
    summary: 'Delete products category by id',
    pathParams: c.type<{ categoryId: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ category: CategoryResponseDto }>>(),
      400: c.type<ErrorResponseData>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  deleteCategories: {
    method: 'POST',
    path: `${pathname}/command/bulkDelete`,
    summary: 'Delete multiple categories',
    body: c.type<{ ids: string[] }>(),
    responses: {
      200: c.type<SuccessResponseData<{ categories: CategoryResponseDto[] }>>(),
      401: c.type<ErrorResponseData>(),
      403: c.type<ErrorResponseData>(),
      404: c.type<ErrorResponseData>(),
    },
  },
});

export { categoryContract };
