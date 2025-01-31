import { initContract } from '@ts-rest/core';
import type {
  ErrorResponseData,
  PaginationDto,
  SuccessResponseData,
} from './dto/misc.js';
import type {
  CatalogFiltersResponseDto,
  CatalogProductDetailsDto,
  CatalogQueryDto,
  CatalogResponseDto,
  CatalogSearchDto,
} from './dto/catalog.dto.js';

const c = initContract();
const pathname = '/catalog';

const catalogContract = c.router({
  getProducts: {
    method: 'GET',
    path: pathname,
    summary: 'Get all products for customer',
    query: c.type<null | CatalogQueryDto>(),
    responses: {
      200: c.type<
        SuccessResponseData<{
          products: CatalogResponseDto[];
          pagination: PaginationDto;
        }>
      >(),
    },
  },
  getFilters: {
    method: 'GET',
    path: pathname + '/filters',
    summary: 'Get filters for catalog',
    query: c.type<null | CatalogQueryDto>(),
    responses: {
      200: c.type<SuccessResponseData<CatalogFiltersResponseDto>>(),
    },
  },
  getProductDetails: {
    method: 'GET',
    path: pathname + '/products/:id',
    summary: 'Get single products details (by variant id or slug)',
    pathParams: c.type<{ id: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ details: CatalogProductDetailsDto }>>(),
      404: c.type<ErrorResponseData>(),
    },
  },
  searchByCatalog: {
    method: 'GET',
    path: pathname + '/search',
    summary: 'Search by products',
    query: c.type<null | { q: string }>(),
    responses: {
      200: c.type<SuccessResponseData<{ products: CatalogSearchDto[] }>>(),
    },
  },
});

export { catalogContract };
