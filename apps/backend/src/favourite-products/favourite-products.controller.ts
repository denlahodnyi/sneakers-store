import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  max,
  min,
  sql,
  sum,
  type SQL,
} from 'drizzle-orm';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import {
  contract as c,
  FavProductCreateDto,
  PRICE_MINOR_UNITS,
  type FavProductRemoveDto,
} from '@sneakers-store/contracts';

import { AuthGuard } from '../auth/auth.guard.js';
import { User } from '../auth/user.decorator.js';
import { type UserEntity } from '../db/schemas/user.schema.js';
import { DrizzleService } from '../drizzle/drizzle.service.js';
import {
  favouriteProductsTable,
  productImagesTable,
  productSkusTable,
  productsTable,
  productVariantsTable,
} from '../db/schemas/product.schema.js';
import { brandsTable } from '../db/schemas/brand.schema.js';
import { categoriesTable } from '../db/schemas/category.schema.js';
import { discountsTable } from '../db/schemas/discounts.schema.js';
import {
  formattedDiscount,
  formattedPrice,
  basePriceWithDiscount,
} from '../shared/sql/templates.js';

@Controller('favourite-products')
export class FavouriteProductsController {
  constructor(private drizzleService: DrizzleService) {}

  @Get('/total')
  @UseGuards(AuthGuard)
  @TsRestHandler(c.favoriteProducts.getTotalFavProducts)
  getFavouritesTotal(@User() user?: UserEntity) {
    return tsRestHandler(c.favoriteProducts.getTotalFavProducts, async () => {
      if (!user) throw new UnauthorizedException();
      const total = await this.drizzleService.db.$count(
        favouriteProductsTable,
        eq(favouriteProductsTable.userId, user.id),
      );

      return { status: 200, body: { status: 'success', data: { total } } };
    });
  }

  @Get('/full')
  @UseGuards(AuthGuard)
  @TsRestHandler(c.favoriteProducts.getFullFavProducts)
  async getFullFavourites(@User() user?: UserEntity) {
    return tsRestHandler(c.favoriteProducts.getFullFavProducts, async () => {
      if (!user) throw new UnauthorizedException();
      const { db } = this.drizzleService;

      const imagesQuery = db
        .selectDistinctOn([productImagesTable.productVarId])
        .from(productImagesTable)
        .orderBy(
          productImagesTable.productVarId,
          asc(productImagesTable.createdAt),
        );

      const discountsSubQuery = db
        .selectDistinctOn([discountsTable.productVarId])
        .from(discountsTable)
        .where(and(eq(discountsTable.isActive, true)))
        .as('var_disc');

      const likesCte = db
        .$with('likes_cte')
        .as(
          db
            .select()
            .from(favouriteProductsTable)
            .where(eq(favouriteProductsTable.userId, user.id))
            .orderBy(desc(favouriteProductsTable.createdAt)),
        );

      const aggregatedSkusByVariantsData = db
        .select({
          productVarId: productSkusTable.productVarId,
          totalQty: sum(productSkusTable.stockQty)
            .mapWith(Number)
            .as('total_skus_by_var'),
          maxBasePrice: max(productSkusTable.basePrice)
            .mapWith(Number)
            .as('max_skus_price_by_var'),
          minBasePrice: min(productSkusTable.basePrice)
            .mapWith(Number)
            .as('min_skus_price_by_var'),
        })
        .from(productSkusTable)
        .innerJoin(
          likesCte,
          eq(likesCte.productVarId, productSkusTable.productVarId),
        )
        .where(and(eq(productSkusTable.isActive, true)))
        .groupBy(productSkusTable.productVarId)
        .as('skus_aggregated');

      const productsQuery = db
        .with(likesCte)
        .select({
          ...aggregatedSkusByVariantsData._.selectedFields,
          formattedPrice: formattedPrice(
            sql`${aggregatedSkusByVariantsData.minBasePrice}`,
          ),
          minBasePriceWithDiscount: basePriceWithDiscount(
            sql`${aggregatedSkusByVariantsData.minBasePrice}`,
            discountsSubQuery.discountType,
            discountsSubQuery.discountValue,
          ),
          maxBasePriceWithDiscount: basePriceWithDiscount(
            sql`${aggregatedSkusByVariantsData.maxBasePrice}`,
            discountsSubQuery.discountType,
            discountsSubQuery.discountValue,
          ),
          image: imagesQuery.as('images')._.selectedFields,
          productVariant: {
            ...getTableColumns(productVariantsTable),
            slug: sql<string>`coalesce(${productVariantsTable.slug}, ${productVariantsTable.id})`,
          },
          product: getTableColumns(productsTable),
          brand: getTableColumns(brandsTable),
          category: getTableColumns(categoriesTable),
          discount: {
            ...discountsSubQuery._.selectedFields,
            formattedDiscount: formattedDiscount(
              discountsSubQuery.discountType,
              discountsSubQuery.discountValue,
            ) as SQL<string>,
          },
        })
        .from(aggregatedSkusByVariantsData)
        .innerJoin(
          productVariantsTable,
          eq(
            productVariantsTable.id,
            aggregatedSkusByVariantsData.productVarId,
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
          eq(
            discountsSubQuery.productVarId,
            aggregatedSkusByVariantsData.productVarId,
          ),
        )
        .leftJoin(
          imagesQuery.as('images'),
          eq(
            imagesQuery.as('images').productVarId,
            aggregatedSkusByVariantsData.productVarId,
          ),
        )
        .where(and(eq(productsTable.isActive, true)));

      const products = await productsQuery;
      const formattedProducts = products.map((p) => {
        const minPrice = p.minBasePrice / PRICE_MINOR_UNITS;
        const maxPrice = p.maxBasePrice / PRICE_MINOR_UNITS;
        const minPriceWithDiscount =
          p.minBasePriceWithDiscount / PRICE_MINOR_UNITS;
        const maxPriceWithDiscount =
          p.maxBasePriceWithDiscount / PRICE_MINOR_UNITS;

        return {
          ...p,
          minPrice,
          maxPrice,
          minPriceWithDiscount,
          maxPriceWithDiscount,
          formattedPriceWithDiscount: `$${minPriceWithDiscount}`,
          formattedPriceRange:
            minPrice !== maxPrice ? `$${minPrice}-${maxPrice}` : null,
          formattedPriceRangeWithDiscount:
            minPriceWithDiscount !== maxPriceWithDiscount
              ? `$${minPriceWithDiscount}-${maxPriceWithDiscount}`
              : null,
          isInStock: !!p.totalQty,
          isFavourite: true,
        };
      });

      return {
        status: 200,
        body: { status: 'success', data: { products: formattedProducts } },
      };
    });
  }

  @Post()
  @UseGuards(AuthGuard)
  @TsRestHandler(c.favoriteProducts.addFavProduct)
  addToFavourites(
    @Body() createFavProductDto: FavProductCreateDto,
    @User() user?: UserEntity,
  ) {
    return tsRestHandler(c.favoriteProducts.addFavProduct, async () => {
      if (!user) throw new UnauthorizedException();
      const [{ id }] = await this.drizzleService.db
        .insert(favouriteProductsTable)
        .values({ ...createFavProductDto, userId: user.id })
        .returning();

      return {
        status: 201,
        body: { status: 'success', data: { product: { id } } },
      };
    });
  }

  @Post('/command/delete')
  @UseGuards(AuthGuard)
  @TsRestHandler(c.favoriteProducts.removeFavProduct)
  deleteFromFavourites(
    @Body() removeFavProductDto: FavProductRemoveDto,
    @User() user?: UserEntity,
  ) {
    return tsRestHandler(c.favoriteProducts.removeFavProduct, async () => {
      if (!user) throw new UnauthorizedException();
      const [{ id }] = await this.drizzleService.db
        .delete(favouriteProductsTable)
        .where(
          and(
            eq(
              favouriteProductsTable.productVarId,
              removeFavProductDto.productVarId,
            ),
            eq(favouriteProductsTable.userId, user.id),
          ),
        )
        .returning();

      return {
        status: 200,
        body: { status: 'success', data: { product: { id } } },
      };
    });
  }
}
