import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import {
  contract as c,
  Gender,
  PRICE_MINOR_UNITS,
  type CatalogFiltersResponseDto,
  type CatalogProductDetailsDto,
  type CatalogResponseDto,
  CatalogQueryDto,
} from '@sneakers-store/contracts';
import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  inArray,
  isNotNull,
  lte,
  max,
  min,
  or,
  sql,
  sum,
  type SQL,
} from 'drizzle-orm';
import { capitalize, omit } from 'lodash-es';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import {
  favouriteProductsTable,
  productImagesTable,
  productSkusTable,
  productsTable,
  productVariantsTable,
} from '../db/schemas/product.schema.js';
import { colorsTable } from '../db/schemas/color.schema.js';
import { brandsTable } from '../db/schemas/brand.schema.js';
import { categoriesTable } from '../db/schemas/category.schema.js';
import { sizesTable } from '../db/schemas/size.schema.js';
import { productDescrToHtml } from '../products/products.lib.js';
import createPaginationDto from '../shared/libs/pagination/createPaginationDto.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';
import { INVALID_QUERY } from '../shared/constants.js';
import { discountsTable } from '../db/schemas/discounts.schema.js';
import { basePriceWithDiscount } from '../shared/sql/templates.js';
import type { InferRecordDataTypes } from '../drizzle/drizzle.lib.js';
import type { UserEntity } from '../db/schemas/user.schema.js';
import { User } from '../auth/user.decorator.js';

const LIMIT = 10;
const MINOR_UNITS = PRICE_MINOR_UNITS;

@Controller('catalog')
export class CatalogController {
  constructor(private drizzleService: DrizzleService) {}
  @Get()
  @TsRestHandler(c.catalog.getProducts)
  async getCatalogProducts(
    @Query(new ConfiguredValidationPipe({ errorMessage: INVALID_QUERY }))
    query: CatalogQueryDto,
    @User()
    user: UserEntity,
  ) {
    const productFilters: (SQL | undefined)[] = [];
    const fullProductFilters: (SQL | undefined)[] = [];
    const variantsFilters: (SQL | undefined)[] = [];
    const skuFilters: (SQL | undefined)[] = [];

    const page = query.page || 1;
    const perPage = query.perPage || LIMIT;
    const sortBy = query.sort;
    const isOnSale = query.sale === 'true';
    const byFeatured = query.featured === 'true' || query.featured === 'false';
    const isInStock =
      query.inStock === 'true'
        ? true
        : query.inStock === 'false'
          ? false
          : undefined;
    const selectedBrands =
      query?.brandIds?.split(',').map(Number).filter(Number.isInteger) || [];
    const selectedGenders =
      (query?.genders
        ?.split(',')
        .filter((g) => Object.values(Gender).includes(g)) as Gender[]) || [];
    const selectedSizes =
      query?.sizeIds?.split(',').map(Number).filter(Number.isInteger) || [];
    const selectedColors =
      query?.colorIds?.split(',').map(Number).filter(Number.isInteger) || [];

    if (selectedSizes.length) {
      skuFilters.push(inArray(sql`ps.size_id`, selectedSizes));
    }
    if (selectedColors.length) {
      variantsFilters.push(
        inArray(productVariantsTable.colorId, selectedColors),
      );
    }

    const distinctVariantsCteQuery = getDistinctVariantsQuery(
      this.drizzleService.db,
      user,
      variantsFilters,
      skuFilters,
      isOnSale,
      isInStock,
    );

    if (selectedBrands.length) {
      productFilters.push(inArray(productsTable.brandId, selectedBrands));
    }
    if (selectedGenders.length) {
      productFilters.push(eq(productsTable.gender, query.genders as Gender));
    }
    if (byFeatured) {
      productFilters.push(
        eq(productsTable.isFeatured, query.featured === 'true' ? true : false),
      );
    }

    // if (selectedSizes.length) {
    //   fullProductFilters.push(
    //     inArray(reducedVariantsWithSkuQuery.sizeId, selectedSizes),
    //   );
    // }
    if (selectedColors.length) {
      fullProductFilters.push(
        inArray(distinctVariantsCteQuery.colorId, selectedColors),
      );
    }
    if (query.price) {
      const [min, max] = query.price
        .split(',')
        .map(Number)
        .filter(Number.isInteger);
      if (min && max) {
        fullProductFilters.push(
          or(
            and(
              gte(distinctVariantsCteQuery.minBasePrice, min * MINOR_UNITS),
              lte(distinctVariantsCteQuery.minBasePrice, max * MINOR_UNITS),
            ),
            and(
              lte(distinctVariantsCteQuery.maxBasePrice, max * MINOR_UNITS),
              gte(distinctVariantsCteQuery.maxBasePrice, min * MINOR_UNITS),
            ),
          ),
        );
      }
    }

    const allSubCategoriesIds = await getSubcategoriesIds(
      this.drizzleService.db,
      query.categorySlug,
    );
    const filteredProductsQuery = getFilteredProductsQuery(
      this.drizzleService.db,
      productFilters,
      allSubCategoriesIds,
    ).$dynamic();
    const fullProductsQuery = getFullProductQuery(
      this.drizzleService.db,
      filteredProductsQuery,
      distinctVariantsCteQuery,
      fullProductFilters,
    ).as('all_full_products');
    const allDistinctProductsQuery = this.drizzleService.db
      .selectDistinctOn([fullProductsQuery.products.id], {
        id: sql<string>`${fullProductsQuery.products.id}`.as('distinct_pid'),
      })
      .from(fullProductsQuery)
      .as('all_distinct_prods');
    const allDistinctPaginatedProductsQuery = this.drizzleService.db
      .select()
      .from(allDistinctProductsQuery)
      .limit(perPage)
      .offset((page - 1) * perPage)
      .as('all_dist_products_paginated');
    const fullPaginatedProductsQuery = this.drizzleService.db
      .select()
      .from(allDistinctPaginatedProductsQuery)
      .innerJoin(
        fullProductsQuery,
        eq(fullProductsQuery.products.id, allDistinctPaginatedProductsQuery.id),
      )
      .as('full_products_paginated');

    const fullPaginatedProductsWthImgQuery = this.drizzleService.db
      .selectDistinctOn(
        [fullPaginatedProductsQuery.all_full_products.distinct_vars.variantId],
        {
          full_products_paginated: {
            products: fullPaginatedProductsQuery.all_full_products
              .products as unknown as SQL<
              InferRecordDataTypes<
                typeof fullPaginatedProductsQuery.all_full_products.products
              >
            >,
            brands: fullPaginatedProductsQuery.all_full_products
              .brands as unknown as SQL<
              InferRecordDataTypes<
                typeof fullPaginatedProductsQuery.all_full_products.brands
              >
            >,
            categories: fullPaginatedProductsQuery.all_full_products
              .categories as unknown as SQL<
              InferRecordDataTypes<
                typeof fullPaginatedProductsQuery.all_full_products.categories
              >
            >,
            distinct_vars: fullPaginatedProductsQuery.all_full_products
              .distinct_vars as unknown as SQL<
              InferRecordDataTypes<
                typeof fullPaginatedProductsQuery.all_full_products.distinct_vars
              >
            >,
          },
          product_images: {
            ...omit(productImagesTable, ['id']),
            id: sql<string>`${productImagesTable.id}`.as('prodImgId'),
          },
        },
      )
      .from(fullPaginatedProductsQuery)
      .leftJoin(
        productImagesTable,
        eq(
          productImagesTable.productVarId,
          fullPaginatedProductsQuery.all_full_products.distinct_vars.variantId,
        ),
      );
    let fullPaginatedAndOrderedProductsQuery = fullPaginatedProductsWthImgQuery;
    if (sortBy) {
      if (sortBy === 'price') {
        // We are selecting from subquery to resolve this issue: SELECT DISTINCT ON expressions must match initial ORDER BY expressions
        fullPaginatedAndOrderedProductsQuery = this.drizzleService.db
          .select()
          .from(
            fullPaginatedProductsWthImgQuery.as(
              'full_products_paginated_and_imgs',
            ),
          )
          .orderBy(desc(distinctVariantsCteQuery.maxBasePrice)) as any;
      }
      if (sortBy === '-price') {
        fullPaginatedAndOrderedProductsQuery = this.drizzleService.db
          .select()
          .from(
            fullPaginatedProductsWthImgQuery.as(
              'full_products_paginated_and_imgs',
            ),
          )
          .orderBy(asc(distinctVariantsCteQuery.minBasePrice)) as any;
      }
    }
    const totalFullDistinctProductsQuery = this.drizzleService.db.$count(
      allDistinctProductsQuery,
    );

    const [paginatedProductsResult, totalItems] = await Promise.all([
      fullPaginatedAndOrderedProductsQuery,
      totalFullDistinctProductsQuery,
    ]);

    const formattedList = new Map<string, CatalogResponseDto>();
    // const formattedList = new Map<string, any>();
    paginatedProductsResult.forEach(
      ({
        product_images,
        full_products_paginated: {
          products,
          distinct_vars,
          brands,
          categories,
        },
      }) => {
        const minPrice = distinct_vars.minBasePrice / MINOR_UNITS;
        const maxPrice = distinct_vars.maxBasePrice / MINOR_UNITS;
        const minPriceWithDiscount =
          distinct_vars.minBasePriceWithDiscount / MINOR_UNITS;
        const maxPriceWithDiscount =
          distinct_vars.maxBasePriceWithDiscount / MINOR_UNITS;
        const formattedPriceRange =
          minPrice !== maxPrice ? `$${minPrice}-${maxPrice}` : null;
        const formattedPriceRangeWithDiscount =
          minPriceWithDiscount !== maxPriceWithDiscount
            ? `$${minPriceWithDiscount}-${maxPriceWithDiscount}`
            : null;
        const formattedDiscount =
          distinct_vars.discountType === 'FIXED' && distinct_vars.discountValue
            ? `$${distinct_vars.discountValue / MINOR_UNITS}`
            : distinct_vars.discountType === 'PERCENTAGE' &&
                distinct_vars.discountValue
              ? `${distinct_vars.discountValue}%`
              : null;

        const variant = {
          variantId: distinct_vars.variantId,
          variantName: distinct_vars.variantName,
          slug: distinct_vars.variantSlug,
          color: distinct_vars.color,
          hex: distinct_vars.hex,
          totalQty: distinct_vars.totalQty,
          isInStock: !!distinct_vars.totalQty,
          isFavourite: distinct_vars.isFavourite,
          formattedPrice: '$' + minPrice,
          formattedPriceWithDiscount: '$' + minPriceWithDiscount,
          minBasePrice: distinct_vars.minBasePrice,
          maxBasePrice: distinct_vars.maxBasePrice,
          minBasePriceWithDiscount: distinct_vars.minBasePriceWithDiscount,
          maxBasePriceWithDiscount: distinct_vars.maxBasePriceWithDiscount,
          minPrice,
          maxPrice,
          minPriceWithDiscount,
          maxPriceWithDiscount,
          formattedPriceRange,
          formattedPriceRangeWithDiscount,
          discountType: distinct_vars.discountType,
          discountValue: distinct_vars.discountValue,
          formattedDiscount,
          // there could be only single image thankfully to distinct selection
          images: product_images ? [product_images] : [],
        };

        if (formattedList.has(products.id)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const item = formattedList.get(products.id)!;
          const total = item.totalQty + distinct_vars.totalQty;
          item.totalQty = total;
          item.isInStock = !!total;
          item.variants.push(variant);
          formattedList.set(products.id, item);
        } else {
          const item: CatalogResponseDto = {
            productId: products.id,
            name: products.name,
            gender: products.gender,
            isFeatured: products.isFeatured,
            totalQty: distinct_vars.totalQty,
            isInStock: !!distinct_vars.totalQty,
            category: {
              id: categories.id,
              name: categories.name,
            },
            brand: {
              id: brands.id,
              name: brands.name,
            },

            variants: [variant],
          };
          formattedList.set(products.id, item);
        }
      },
    );
    const products = Array.from(formattedList.values());

    return tsRestHandler(c.catalog.getProducts, async () => {
      return {
        status: 200,
        body: {
          status: 'success',
          data: {
            products,
            pagination: createPaginationDto({
              perPage,
              page,
              total: totalItems,
            }),
          },
        },
      };
    });
  }

  @Get('filters')
  @TsRestHandler(c.catalog.getFilters)
  async getFilters(@Query() query: CatalogQueryDto) {
    const productFilters: {
      or: (SQL | undefined)[];
      and: (SQL | undefined)[];
    } = { or: [], and: [] };

    let selectedGenders: Gender[] = [];
    if (query.genders) {
      selectedGenders = query.genders
        .split(',')
        .filter((g) => Object.values(Gender).includes(g)) as Gender[];
      if (selectedGenders.length) {
        productFilters.and.push(inArray(productsTable.gender, selectedGenders));
      }
    }
    let selectedColorIds: number[] = [];
    if (query.colorIds) {
      selectedColorIds = query.colorIds
        .split(',')
        .map(Number)
        .filter(Number.isInteger);
      if (selectedColorIds.length) {
        productFilters.and.push(
          inArray(productVariantsTable.colorId, selectedColorIds),
        );
      }
    }
    let selectedBrandIds: number[] = [];
    if (query.brandIds) {
      selectedBrandIds = query.brandIds
        .split(',')
        .map(Number)
        .filter(Number.isInteger);
      if (selectedBrandIds.length) {
        productFilters.and.push(
          inArray(productsTable.brandId, selectedBrandIds),
        );
      }
    }
    let selectedSizeIds: number[] = [];
    if (query.sizeIds) {
      selectedSizeIds = query.sizeIds
        .split(',')
        .map(Number)
        .filter(Number.isInteger);
      if (selectedSizeIds.length) {
        productFilters.and.push(
          inArray(productSkusTable.sizeId, selectedSizeIds),
        );
      }
    }
    let selectedPriceRange: [number, number] | null = null;
    if (query.price) {
      const [min, max] = query.price.split(',').map(Number);
      if (min && max) {
        selectedPriceRange = [min, max];
      }
    }
    const byOnSale = query.sale === 'true';
    if (byOnSale) {
      productFilters.and.push(isNotNull(discountsTable.discountValue));
    }
    const byFeatured = query.featured === 'true' || query.featured === 'false';
    if (byFeatured) {
      productFilters.and.push(
        eq(productsTable.isFeatured, query.featured === 'true'),
      );
    }
    const byInStock = query.inStock === 'true' || query.inStock === 'false';
    if (byInStock) {
      productFilters.and.push(
        query.inStock === 'true'
          ? gt(productSkusTable.stockQty, 0)
          : eq(productSkusTable.stockQty, 0),
      );
    }

    const touchedFilters = {
      color: selectedColorIds.length > 0,
      brand: selectedBrandIds.length > 0,
      size: selectedSizeIds.length > 0,
      gender: selectedGenders.length > 0,
      price: !!selectedPriceRange,
      isOnSale: byOnSale,
      isFeatured: byFeatured,
      isInStock: byInStock,
    };

    const allSubCategoriesIds = await getSubcategoriesIds(
      this.drizzleService.db,
      query.categorySlug,
    );

    const productsQuery = this.drizzleService.db
      .select({
        products: getTableColumns(productsTable),
        variants: {
          ...getTableColumns(productVariantsTable),
          id: sql<string>`${productVariantsTable.id}`.as('variants_variant_id'),
          name: sql<string>`${productVariantsTable.name}`.as(
            'variants_variant_name',
          ),
          productId: sql<string>`${productVariantsTable.productId}`.as(
            'variants_variant_pid',
          ),
        },
        skus: {
          ...getTableColumns(productSkusTable),
          id: sql<string>`${productSkusTable.id}`.as('skus_sku_id'),
          productId: sql<string>`${productSkusTable.productId}`.as(
            'skus_sku_pid',
          ),
          isActive: sql<boolean>`${productSkusTable.isActive}`.as(
            'skus_sku_active',
          ),
          createdAt: sql<string>`${productSkusTable.createdAt}`.as(
            'skus_sku_cr_at',
          ),
          updatedAt: sql<string>`${productSkusTable.updatedAt}`.as(
            'skus_sku_upd_at',
          ),
        },
        brands: {
          ...getTableColumns(brandsTable),
          id: sql<number>`${brandsTable.id}`.as('brands_brand_id'),
          name: sql<string>`${brandsTable.name}`.as('brands_brand_name'),
          isActive: sql<boolean>`${brandsTable.isActive}`.as(
            'brands_brand_active',
          ),
        },
        colors: {
          ...getTableColumns(colorsTable),
          id: sql<number>`${colorsTable.id}`.as('colors_color_id'),
          name: sql<string>`${colorsTable.name}`.as('colors_color_name'),
          isActive: sql<boolean>`${colorsTable.isActive}`.as(
            'colors_color_active',
          ),
        },
        sizes: {
          ...getTableColumns(sizesTable),
          id: sql<number>`${sizesTable.id}`.as('sizes_size_id'),
          isActive: sql<boolean>`${sizesTable.isActive}`.as(
            'sizes_size_active',
          ),
        },
      })
      .from(productsTable)
      .innerJoin(
        productVariantsTable,
        eq(productVariantsTable.productId, productsTable.id),
      )
      .innerJoin(
        productSkusTable,
        eq(productSkusTable.productVarId, productVariantsTable.id),
      )
      .innerJoin(colorsTable, eq(colorsTable.id, productVariantsTable.colorId))
      .innerJoin(brandsTable, eq(brandsTable.id, productsTable.brandId))
      .leftJoin(sizesTable, eq(sizesTable.id, productSkusTable.sizeId))
      .leftJoin(
        discountsTable,
        eq(discountsTable.productVarId, productVariantsTable.id),
      )
      .where(
        and(
          eq(productsTable.isActive, true),
          eq(productSkusTable.isActive, true),
          ...productFilters.and,
          or(...productFilters.or),
          allSubCategoriesIds?.length
            ? inArray(productsTable.categoryId, allSubCategoriesIds)
            : undefined,
        ),
      );

    // This query is only to get available price range for applied filters (without
    // counting prices filter)
    const productsExceptPricesFilterSubQuery = productsQuery.as('products');
    // Main query with all filters including prices
    const productsSubQuery = this.drizzleService.db
      .select()
      .from(productsExceptPricesFilterSubQuery)
      .where(
        and(
          selectedPriceRange
            ? and(
                gte(
                  productsExceptPricesFilterSubQuery.skus.basePrice,
                  selectedPriceRange[0] * MINOR_UNITS,
                ),
                lte(
                  productsExceptPricesFilterSubQuery.skus.basePrice,
                  selectedPriceRange[1] * MINOR_UNITS,
                ),
              )
            : undefined,
        ),
      )
      .as('products_filtered_b_price');

    const distinctBrandsQuery = this.drizzleService.db
      .selectDistinctOn([productsSubQuery.brands.id], {
        id: productsSubQuery.products.brandId,
      })
      .from(productsSubQuery);
    const distinctColorsQuery = this.drizzleService.db
      .selectDistinctOn([productsSubQuery.colors.id], {
        id: productsSubQuery.colors.id,
      })
      .from(productsSubQuery);
    const distinctSizesQuery = this.drizzleService.db
      .selectDistinctOn([productsSubQuery.sizes.id], {
        id: productsSubQuery.sizes.id,
      })
      .from(productsSubQuery);
    const distinctGendersQuery = this.drizzleService.db
      .selectDistinctOn([productsSubQuery.products.gender], {
        gender: productsSubQuery.products.gender,
      })
      .from(productsSubQuery);

    const [
      [priceRange = null],
      allBrands,
      allColors,
      allSizes,
      distinctGenders,
      { rows: catRows },
    ] = await Promise.all([
      this.drizzleService.db
        .select({
          min: min(productsSubQuery.skus.basePrice),
          max: max(productsSubQuery.skus.basePrice),
        })
        .from(productsExceptPricesFilterSubQuery),

      this.drizzleService.db
        .select({
          ...getTableColumns(brandsTable),
          selected: selectedBrandIds.length
            ? sql<boolean>`${brandsTable.id} IN (${sql.raw(selectedBrandIds.join(','))})`.as(
                'brand_selected',
              )
            : sql<boolean>`false`.as('brand_selected'),
          disabled: Object.values(omit(touchedFilters, 'brand')).some((v) => v)
            ? sql<boolean>`${brandsTable.id} NOT IN (${distinctBrandsQuery})`.as(
                'brand_disabled',
              )
            : sql<boolean>`false`.as('brand_disabled'),
        })
        .from(brandsTable)
        .where(eq(brandsTable.isActive, true))
        .orderBy(brandsTable.name),

      this.drizzleService.db
        .select({
          ...getTableColumns(colorsTable),
          selected: selectedColorIds.length
            ? sql<boolean>`${colorsTable.id} IN (${sql.raw(selectedColorIds.join(','))})`.as(
                'color_selected',
              )
            : sql<boolean>`false`.as('color_selected'),
          disabled: Object.values(omit(touchedFilters, 'color')).some((v) => v)
            ? sql<boolean>`${colorsTable.id} NOT IN (${distinctColorsQuery})`.as(
                'color_disabled',
              )
            : sql<boolean>`false`.as('color_disabled'),
        })
        .from(colorsTable)
        .where(eq(colorsTable.isActive, true))
        .orderBy(colorsTable.name),

      this.drizzleService.db
        .select({
          ...getTableColumns(sizesTable),
          selected: selectedSizeIds.length
            ? sql<boolean>`${sizesTable.id} IN (${sql.raw(selectedSizeIds.join(','))})`.as(
                'size_selected',
              )
            : sql<boolean>`false`.as('size_selected'),
          disabled: Object.values(omit(touchedFilters, 'size')).some((v) => v)
            ? sql<boolean>`${sizesTable.id} NOT IN (${distinctSizesQuery})`.as(
                'size_disabled',
              )
            : sql<boolean>`false`.as('size_disabled'),
        })
        .from(sizesTable)
        .where(eq(sizesTable.isActive, true))
        .orderBy(sizesTable.size),

      distinctGendersQuery,

      getFlatCategories(this.drizzleService.db),
    ]);

    const allGenders = Object.values(Gender).map((gender) => ({
      title: capitalize(gender),
      gender,
      selected: selectedGenders.includes(gender),
      disabled: Object.values(omit(touchedFilters, 'size')).some((v) => v)
        ? !distinctGenders.some((o) => o.gender === gender)
        : false,
    }));

    const allCategories = formatCategoriesTree(catRows);

    return tsRestHandler(c.catalog.getFilters, async () => ({
      status: 200,
      body: {
        status: 'success',
        data: {
          price: {
            title: 'Price',
            applied: {
              minPrice: selectedPriceRange ? selectedPriceRange[0] : null,
              maxPrice: selectedPriceRange ? selectedPriceRange[1] : null,
              minBasePrice: selectedPriceRange
                ? selectedPriceRange[0] * MINOR_UNITS
                : null,
              maxBasePrice: selectedPriceRange
                ? selectedPriceRange[1] * MINOR_UNITS
                : null,
            },
            available: {
              minPrice: priceRange?.min ? priceRange.min / MINOR_UNITS : null,
              maxPrice: priceRange?.max ? priceRange.max / MINOR_UNITS : null,
              minBasePrice: priceRange ? priceRange.min : null,
              maxBasePrice: priceRange ? priceRange.max : null,
            },
            queryParam: 'price',
          },
          colors: {
            title: 'Color',
            values: allColors,
            queryParam: 'colorId',
          },
          brands: {
            title: 'Brand',
            values: allBrands,
            queryParam: 'brandId',
          },
          size: {
            title: 'Size',
            values: allSizes,
            queryParam: 'sizeId',
          },
          genders: {
            title: 'Gender',
            values: allGenders,
            queryParam: 'gender',
          },
          categories: {
            title: 'Category',
            values: allCategories,
            queryParam: 'categorySlug',
          },
        },
      },
    }));
  }

  @Get('products/:id') // id = variantId
  @TsRestHandler(c.catalog.getProductDetails)
  async getCatalogProductDetails(
    @Param('id') idOrSlug: string,
    @User() user: UserEntity,
  ) {
    if (!idOrSlug) throw new NotFoundException();

    const discountsSubQuery = this.drizzleService.db
      .select({
        discounts: getTableColumns(discountsTable),
      })
      .from(productVariantsTable)
      .where(
        and(
          eq(discountsTable.isActive, true),
          or(
            eq(productVariantsTable.id, idOrSlug),
            eq(productVariantsTable.slug, idOrSlug),
          ),
        ),
      )
      .innerJoin(
        discountsTable,
        eq(discountsTable.productVarId, productVariantsTable.id),
      )
      .limit(1)
      .as('discounts_sub_q');
    const [variantWithFullProduct = null] = await this.drizzleService.db
      .select({
        product_variants: getTableColumns(productVariantsTable),
        products: getTableColumns(productsTable),
        brands: getTableColumns(brandsTable),
        categories: getTableColumns(categoriesTable),
        discounts: discountsSubQuery.discounts,
      })
      .from(productVariantsTable)
      .where(
        and(
          eq(productsTable.isActive, true),
          or(
            eq(productVariantsTable.id, idOrSlug),
            eq(productVariantsTable.slug, idOrSlug),
          ),
        ),
      )
      .innerJoin(
        productsTable,
        eq(productsTable.id, productVariantsTable.productId),
      )
      .innerJoin(brandsTable, eq(brandsTable.id, productsTable.brandId))
      .innerJoin(
        categoriesTable,
        eq(categoriesTable.id, productsTable.categoryId),
      )
      .leftJoin(
        discountsSubQuery,
        eq(productVariantsTable.id, discountsSubQuery.discounts.productVarId),
      );

    if (!variantWithFullProduct) throw new NotFoundException();

    const skusQuery = this.drizzleService.db
      .select({
        product_skus: {
          ...getTableColumns(productSkusTable),
          basePriceWithDiscount: basePriceWithDiscount(
            productSkusTable.basePrice,
            variantWithFullProduct.discounts?.discountType || null,
            variantWithFullProduct.discounts?.discountValue || null,
          ),
        },
        sizes: getTableColumns(sizesTable),
      })
      .from(productSkusTable)
      .where(
        eq(
          productSkusTable.productVarId,
          variantWithFullProduct.product_variants.id,
        ),
      )
      .innerJoin(sizesTable, eq(sizesTable.id, productSkusTable.sizeId));

    const aggregatedVariantsQuery = this.drizzleService.db
      .select({
        productVariantId: productVariantsTable.id,
        totalStockQty: sum(productSkusTable.stockQty)
          .mapWith(Number)
          .as('total_stock_qty'),
        minPrice: min(productSkusTable.basePrice)
          .mapWith(Number)
          .as('min_price'),
        maxPrice: max(productSkusTable.basePrice)
          .mapWith(Number)
          .as('max_price'),
      })
      .from(productVariantsTable)
      .where(
        and(
          eq(
            productVariantsTable.productId,
            variantWithFullProduct.product_variants.productId,
          ),
        ),
      )
      .innerJoin(
        productSkusTable,
        eq(productVariantsTable.id, productSkusTable.productVarId),
      )
      .groupBy(productVariantsTable.id)
      .as('aggregated_variants');

    const variantsQuery = this.drizzleService.db
      .select({
        product_variants: productVariantsTable,
        aggregated_variants: aggregatedVariantsQuery._.selectedFields,
        colors: getTableColumns(colorsTable),
        minBasePriceWithDiscount: basePriceWithDiscount(
          sql`${aggregatedVariantsQuery.minPrice}`,
          variantWithFullProduct.discounts?.discountType || null,
          variantWithFullProduct.discounts?.discountValue || null,
        ),
        maxBasePriceWithDiscount: basePriceWithDiscount(
          sql`${aggregatedVariantsQuery.maxPrice}`,
          variantWithFullProduct.discounts?.discountType || null,
          variantWithFullProduct.discounts?.discountValue || null,
        ),
        isFavourite: !user?.id
          ? sql<boolean>`false`
          : sql<boolean>`
          CASE
            WHEN (${this.drizzleService.db
              .select({ id: getTableColumns(favouriteProductsTable).id })
              .from(favouriteProductsTable)
              .where(
                and(
                  eq(favouriteProductsTable.userId, user.id),
                  eq(
                    favouriteProductsTable.productVarId,
                    aggregatedVariantsQuery.productVariantId,
                  ),
                ),
              )}) IS NOT NULL
            THEN true
            ELSE false
          END
        `,
      })
      .from(aggregatedVariantsQuery)
      .innerJoin(
        productVariantsTable,
        eq(productVariantsTable.id, aggregatedVariantsQuery.productVariantId),
      )
      .innerJoin(colorsTable, eq(colorsTable.id, productVariantsTable.colorId));

    const currentVarImagesQuery = this.drizzleService.db
      .select()
      .from(productImagesTable)
      .where(
        eq(
          productImagesTable.productVarId,
          variantWithFullProduct.product_variants.id,
        ),
      )
      .orderBy(asc(productImagesTable.createdAt));

    const [currentVarSkus, allVariants, currentVarImgs] = await Promise.all([
      skusQuery,
      variantsQuery,
      currentVarImagesQuery,
    ]);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const currentVariant = allVariants.find(
      (o) =>
        o.product_variants.id === variantWithFullProduct.product_variants.id,
    )!;

    const formattedDiscount =
      variantWithFullProduct.discounts?.discountType === 'FIXED' &&
      variantWithFullProduct.discounts?.discountValue
        ? `$${variantWithFullProduct.discounts.discountValue / MINOR_UNITS}`
        : variantWithFullProduct.discounts?.discountType === 'PERCENTAGE' &&
            variantWithFullProduct.discounts?.discountValue
          ? `${variantWithFullProduct.discounts.discountValue}%`
          : null;
    const minPrice = currentVariant.aggregated_variants.minPrice / MINOR_UNITS;
    const maxPrice = currentVariant.aggregated_variants.maxPrice / MINOR_UNITS;
    const minPriceWithDiscount =
      currentVariant.minBasePriceWithDiscount / MINOR_UNITS;
    const maxPriceWithDiscount =
      currentVariant.maxBasePriceWithDiscount / MINOR_UNITS;

    const formattedDetails: CatalogProductDetailsDto = {
      variantId: variantWithFullProduct.product_variants.id,
      name:
        currentVariant.product_variants.name ||
        `${variantWithFullProduct.products.name}, ${currentVariant.colors.name}`,
      slug:
        currentVariant.product_variants.slug ||
        currentVariant.product_variants.id,
      color: currentVariant.colors,
      product: {
        ...variantWithFullProduct.products,
        descriptionHtml: variantWithFullProduct.products.description
          ? productDescrToHtml(variantWithFullProduct.products.description)
          : null,
      },
      category: variantWithFullProduct.categories,
      brand: variantWithFullProduct.brands,
      sizes: currentVarSkus.map(({ sizes, product_skus }) => ({
        productSkuId: product_skus.id,
        id: sizes.id,
        size: sizes.size,
        system: sizes.system,
        basePrice: product_skus.basePrice,
        basePriceWithDiscount: product_skus.basePriceWithDiscount,
        price: product_skus.basePrice / MINOR_UNITS,
        priceWithDiscount: product_skus.basePriceWithDiscount / MINOR_UNITS,
        formattedPrice: `$${product_skus.basePrice / MINOR_UNITS}`,
        formattedPriceWithDiscount: `$${product_skus.basePriceWithDiscount / MINOR_UNITS}`,
        stockQty: product_skus.stockQty,
        isInStock: !!product_skus.stockQty,
      })),
      variants: allVariants.map(
        ({ colors, product_variants, aggregated_variants, isFavourite }) => ({
          ...product_variants,
          slug: product_variants.slug || product_variants.id,
          color: colors,
          isInStock: !!aggregated_variants.totalStockQty,
          isFavourite,
        }),
      ),
      images: currentVarImgs,
      discountType: variantWithFullProduct.discounts?.discountType || null,
      discountValue: variantWithFullProduct.discounts?.discountValue || null,
      formattedDiscount,
      minBasePrice: currentVariant.aggregated_variants.minPrice,
      maxBasePrice: currentVariant.aggregated_variants.maxPrice,
      minBasePriceWithDiscount: currentVariant.minBasePriceWithDiscount,
      maxBasePriceWithDiscount: currentVariant.maxBasePriceWithDiscount,
      minPrice,
      maxPrice,
      minPriceWithDiscount,
      maxPriceWithDiscount,
      formattedPrice: `$${minPrice}`,
      formattedPriceWithDiscount: `$${minPriceWithDiscount}`,
      formattedPriceRange:
        minPrice !== maxPrice ? `$${minPrice}-${maxPrice}` : null,
      formattedPriceRangeWithDiscount:
        minPriceWithDiscount !== maxPriceWithDiscount
          ? `$${minPriceWithDiscount}-${maxPriceWithDiscount}`
          : null,
      isInStock: !!currentVariant.aggregated_variants.totalStockQty,
      isFavourite: currentVariant.isFavourite,
    };

    return tsRestHandler(c.catalog.getProductDetails, async () => ({
      status: 200,
      body: { status: 'success', data: { details: formattedDetails } },
    }));
  }

  @Get('search')
  @TsRestHandler(c.catalog.searchByCatalog)
  async searchByCatalog(@Query('q') q: string) {
    return tsRestHandler(c.catalog.searchByCatalog, async () => {
      const searchQuery = q.split(' ').join(' | ');
      const rankSql = sql`
    (setweight(to_tsvector('english', ${brandsTable.name}), 'A')
      || setweight(to_tsvector('english', ${productsTable.name}), 'A')
      || setweight(to_tsvector('english', coalesce(${productVariantsTable.name}, '')), 'A'))
      , to_tsquery('english', ${searchQuery})`;
      const matchSql = sql`
      (setweight(to_tsvector('english', ${brandsTable.name}), 'A')
        || setweight(to_tsvector('english', ${productsTable.name}), 'A')
        || setweight(to_tsvector('english', coalesce(${productVariantsTable.name}, '')), 'A'))
      @@ to_tsquery('english', ${searchQuery})`;

      const imagesQuery = this.drizzleService.db
        .$with('images_cte')
        .as(
          this.drizzleService.db
            .selectDistinctOn([productImagesTable.productVarId])
            .from(productImagesTable)
            .orderBy(
              productImagesTable.productVarId,
              asc(productImagesTable.createdAt),
            ),
        );
      const resultsQuery = this.drizzleService.db
        .with(imagesQuery)
        .select({
          rank: sql<number>`ts_rank(${rankSql})`,
          productVariant: {
            ...getTableColumns(productVariantsTable),
            slug: sql<string>`coalesce(${productVariantsTable.slug}, ${productVariantsTable.id})`,
          },
          product: getTableColumns(productsTable),
          brand: getTableColumns(brandsTable),
          category: getTableColumns(categoriesTable),
          image: imagesQuery._.selectedFields,
        })
        .from(productVariantsTable)
        .innerJoin(
          productsTable,
          eq(productsTable.id, productVariantsTable.productId),
        )
        .innerJoin(brandsTable, eq(brandsTable.id, productsTable.brandId))
        .innerJoin(
          categoriesTable,
          eq(categoriesTable.id, productsTable.categoryId),
        )
        .leftJoin(
          imagesQuery,
          eq(imagesQuery.productVarId, productVariantsTable.id),
        )
        .where(and(eq(productsTable.isActive, true), matchSql))
        .orderBy((t) => desc(t.rank));

      const products = await resultsQuery;

      return {
        status: 200,
        body: { status: 'success', data: { products } },
      };
    });
  }
}

async function getSubcategoriesIds(
  db: DrizzleService['db'],
  categorySlug?: string,
) {
  const { rows } = categorySlug
    ? await db.execute<{ id: number }>(
        sql`WITH RECURSIVE category_hierarchy AS (
            SELECT id, name, slug, parent_id
            FROM categories
            WHERE slug = ${categorySlug}

            UNION ALL

            SELECT c.id, c.name, c.slug, c.parent_id
            FROM categories c
            INNER JOIN category_hierarchy ch ON c.parent_id = ch.id
            )
            SELECT * FROM category_hierarchy;
        `,
      )
    : { rows: [] };
  return rows.map((o) => o.id);
}

function getFlatCategories(db: DrizzleService['db']) {
  return db.execute<{
    id: number;
    name: string;
    slug: string;
    parent_id: number;
    path: string[];
  }>(
    sql`WITH RECURSIVE category_hierarchy AS (
        SELECT id, name, slug, parent_id, ARRAY[slug]::text[] AS path
        FROM categories
        WHERE parent_id IS NULL

        UNION ALL

        SELECT c.id, c.name, c.slug, c.parent_id, ch.path || c.slug
        FROM categories c
        INNER JOIN category_hierarchy ch ON c.parent_id = ch.id
        )
        SELECT * FROM category_hierarchy ORDER BY path;
    `,
  );
}

function getFilteredProductsQuery(
  db: DrizzleService['db'],
  filters?: (SQL | undefined)[],
  categoryIds?: number[],
) {
  return db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.isActive, true),
        categoryIds?.length
          ? inArray(productsTable.categoryId, categoryIds)
          : undefined,
        ...(filters || []),
      ),
    );
}

function getDistinctVariantsQuery(
  db: DrizzleService['db'],
  user?: UserEntity,
  variantsFilters: (SQL | undefined)[] = [],
  skuFilters: (SQL | undefined)[] = [],
  isOnSale = false,
  isInStock?: boolean,
) {
  const skusSubQuery = db
    .select({
      productVarId: productSkusTable.productVarId,
      total: sum(productSkusTable.stockQty)
        .mapWith(Number)
        .as('total_skus_qty_by_var'),
      min: min(productSkusTable.basePrice)
        .mapWith(Number)
        .as('min_skus_price_by_var'),
      max: max(productSkusTable.basePrice)
        .mapWith(Number)
        .as('max_skus_price_by_var'),
    })
    .from(productSkusTable)
    .where(
      and(
        eq(productSkusTable.productVarId, productVariantsTable.id),
        eq(productSkusTable.isActive, true),
        ...skuFilters,
      ),
    )
    .groupBy(productSkusTable.productVarId);

  const skusCteSubQuery = db.$with('skus_cte').as(skusSubQuery);

  const discountsSubQuery = db
    .selectDistinctOn([discountsTable.productVarId])
    .from(discountsTable)
    .where(and(eq(discountsTable.isActive, true)))
    .as('var_disc');

  let distinctVarsSelection = db
    .selectDistinctOn([productVariantsTable.id], {
      totalQty: sql`
          (${db
            .with(skusCteSubQuery)
            .select({ total: skusCteSubQuery.total })
            .from(skusCteSubQuery)})
        `
        .mapWith(Number)
        .as('total_skus_qty_by_var'),
      minBasePrice: sql`
          (${db
            .with(skusCteSubQuery)
            .select({ min: skusCteSubQuery.min })
            .from(skusCteSubQuery)})
        `
        .mapWith(Number)
        .as('min_skus_price_by_var'),
      maxBasePrice: sql`
          (${db
            .with(skusCteSubQuery)
            .select({ max: skusCteSubQuery.max })
            .from(skusCteSubQuery)})
        `
        .mapWith(Number)
        .as('max_skus_price_by_var'),
      minBasePriceWithDiscount: basePriceWithDiscount(
        sql`
          (${db
            .with(skusCteSubQuery)
            .select({ min: skusCteSubQuery.min })
            .from(skusCteSubQuery)})
        `.mapWith(Number),
        discountsSubQuery.discountType,
        discountsSubQuery.discountValue,
      ).as('min_price_with_disc'),
      maxBasePriceWithDiscount: basePriceWithDiscount(
        sql`
          (${db
            .with(skusCteSubQuery)
            .select({ max: skusCteSubQuery.max })
            .from(skusCteSubQuery)})
        `.mapWith(Number),
        discountsSubQuery.discountType,
        discountsSubQuery.discountValue,
      ).as('max_price_with_disc'),
      productId: productVariantsTable.productId,
      variantId: sql<string>`${productVariantsTable.id}`.as('prod_var_id'),
      variantSlug:
        sql<string>`coalesce(${productVariantsTable.slug}, ${productVariantsTable.id})`.as(
          'var_slug',
        ),
      variantName: sql<string>`${productVariantsTable.name}`.as('var_name'),
      colorId: productVariantsTable.colorId,
      color: colorsTable.name,
      hex: colorsTable.hex,
      discount: discountsSubQuery._.selectedFields,
      isFavourite: user?.id
        ? sql<boolean>`
          CASE
            WHEN ${favouriteProductsTable.id} IS NOT NULL
            THEN true
            else false
          END
        `.as('favorite')
        : sql<boolean>`false`.as('favorite'),
    })
    .from(productVariantsTable)
    .where((t) =>
      and(
        eq(productSkusTable.isActive, true),
        ...variantsFilters,
        ...skuFilters,
        isOnSale ? isNotNull(discountsSubQuery.discountValue) : undefined,
        isInStock
          ? gt(sql`${t.totalQty}`, 0)
          : isInStock === false
            ? eq(sql`${t.totalQty}`, 0)
            : undefined,
      ),
    )
    .innerJoin(
      productSkusTable,
      eq(productSkusTable.productVarId, productVariantsTable.id),
    )
    .leftJoin(
      discountsSubQuery,
      eq(discountsSubQuery.productVarId, productVariantsTable.id),
    )
    .leftJoin(colorsTable, eq(colorsTable.id, productVariantsTable.colorId))
    .$dynamic();

  if (user?.id) {
    distinctVarsSelection = distinctVarsSelection.leftJoin(
      favouriteProductsTable,
      and(
        eq(favouriteProductsTable.productVarId, productVariantsTable.id),
        eq(favouriteProductsTable.userId, user.id),
      ),
    );
  }

  return db.$with('distinct_vars').as(distinctVarsSelection);
}

function getFullProductQuery(
  db: DrizzleService['db'],
  productsQuery: ReturnType<
    ReturnType<typeof getFilteredProductsQuery>['$dynamic']
  >,
  distinctVariantsCteQuery: ReturnType<typeof getDistinctVariantsQuery>,
  filters: (SQL | undefined)[],
) {
  const dynamicProductsQuery = productsQuery.as('products');
  const query = db
    .with(distinctVariantsCteQuery)
    .select({
      // Rename ambiguous columns (like id)
      products: {
        ...omit(getTableColumns(productsTable), [
          'id',
          'name',
          'isActive',
          'createdAt',
          'updatedAt',
        ]),
        id: sql<string>`${dynamicProductsQuery.id}`.as('pid'),
        name: sql<string>`${dynamicProductsQuery.name}`.as('productName'),
        isActive: sql<boolean>`${dynamicProductsQuery.isActive}`.as(
          'isActiveProduct',
        ),
        createdAt: sql<string>`${dynamicProductsQuery.createdAt}`.as(
          'productCreatedAt',
        ),
        updatedAt: sql<string>`${dynamicProductsQuery.updatedAt}`.as(
          'productUpdatedAt',
        ),
      },
      categories: {
        ...omit(getTableColumns(categoriesTable), ['id', 'name', 'isActive']),
        id: sql<number>`${categoriesTable.id}`.as('catId'),
        name: sql<string>`${categoriesTable.name}`.as('categoryName'),
        isActive: sql<boolean>`${categoriesTable.isActive}`.as(
          'isActiveCategory',
        ),
      },
      brands: {
        ...omit(getTableColumns(brandsTable), ['id', 'name', 'isActive']),
        id: sql<number>`${brandsTable.id}`.as('brId'),
        name: sql<string>`${brandsTable.name}`.as('brandName'),
        isActive: sql<boolean>`${brandsTable.isActive}`.as('isActiveBrand'),
      },
      distinct_vars: {
        totalQty: distinctVariantsCteQuery.totalQty,
        productId: distinctVariantsCteQuery.productId,
        variantSlug: distinctVariantsCteQuery.variantSlug,
        variantId: distinctVariantsCteQuery.variantId,
        variantName: distinctVariantsCteQuery.variantName,
        minBasePrice: distinctVariantsCteQuery.minBasePrice,
        maxBasePrice: distinctVariantsCteQuery.maxBasePrice,
        minBasePriceWithDiscount:
          distinctVariantsCteQuery.minBasePriceWithDiscount,
        maxBasePriceWithDiscount:
          distinctVariantsCteQuery.maxBasePriceWithDiscount,
        colorId: distinctVariantsCteQuery.colorId,
        color: distinctVariantsCteQuery.color,
        hex: distinctVariantsCteQuery.hex,
        discountType: distinctVariantsCteQuery.discount.discountType,
        discountValue: distinctVariantsCteQuery.discount.discountValue,
        isFavourite: distinctVariantsCteQuery.isFavourite,
      },
    })
    .from(dynamicProductsQuery)
    .where(and(...filters))
    .innerJoin(brandsTable, eq(brandsTable.id, dynamicProductsQuery.brandId))
    .innerJoin(
      categoriesTable,
      eq(categoriesTable.id, dynamicProductsQuery.categoryId),
    )
    .innerJoin(
      distinctVariantsCteQuery,
      eq(dynamicProductsQuery.id, distinctVariantsCteQuery.productId),
    );

  return query;
}

function setCategoryTreeLeaf(
  tree: CatalogFiltersResponseDto['categories']['values'],
  row: Omit<
    CatalogFiltersResponseDto['categories']['values'][number],
    'children'
  >,
  parentPaths: string[],
) {
  parentPaths.forEach((path, i, arr) => {
    const idx = tree.findIndex((o) => o.slug === path);
    if (i !== arr.length - 1) {
      return setCategoryTreeLeaf(tree[idx].children, row, arr.slice(1));
    }
    if (idx !== -1) {
      tree[idx].children.push({ ...row, children: [] });
      return tree;
    }
  });
}

function formatCategoriesTree(
  categoryRows: Omit<
    CatalogFiltersResponseDto['categories']['values'][number],
    'children'
  >[],
) {
  return categoryRows.reduce<CatalogFiltersResponseDto['categories']['values']>(
    (acc, row) => {
      const parentPaths = row.path.slice(0, -1);
      if (parentPaths.length) {
        setCategoryTreeLeaf(acc, row, parentPaths);
      } else {
        acc.push({
          ...row,
          children: [],
        });
      }
      return acc;
    },
    [],
  );
}
