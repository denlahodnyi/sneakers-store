import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import {
  contract as c,
  ProductCreateDto,
  ProductUpdateDto,
  ProductQueryDto,
  DiscountType,
  PRICE_MINOR_UNITS,
} from '@sneakers-store/contracts';
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  sql,
  type InferSelectModel,
  type SQL,
} from 'drizzle-orm';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';
import {
  productSkusTable,
  productsTable,
  productVariantsTable,
} from '../db/schemas/product.schema.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../db/schemas/user.schema.js';
import { categoriesTable } from '../db/schemas/category.schema.js';
import { brandsTable } from '../db/schemas/brand.schema.js';
import { colorsTable } from '../db/schemas/color.schema.js';
import { productDescrToHtml } from './products.lib.js';
import { INVALID_QUERY } from '../shared/constants.js';
import createPaginationDto from '../shared/libs/pagination/createPaginationDto.js';
import { discountsTable } from '../db/schemas/discounts.schema.js';
import { formattedPrice } from '../shared/sql/templates.js';
import { sizesTable } from '../db/schemas/size.schema.js';

const adminRoles = [Role.SUPER_ADMIN, Role.ADMIN];
const LIMIT = 10;

@Controller('products')
export class ProductsController {
  constructor(private drizzleService: DrizzleService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.products.createProduct)
  createProduct(
    @Body(ConfiguredValidationPipe) createProductDto: ProductCreateDto,
  ) {
    return tsRestHandler(c.products.createProduct, async () => {
      const [newProd] = await this.drizzleService.db
        .insert(productsTable)
        .values(createProductDto)
        .returning();
      // TODO: drizzle doesn't support CTE with RETURNING for now. Check it
      // later to make it in single query
      const [product] = await this.drizzleService.db
        .select({
          ...getTableColumns(productsTable),
          brand: brandsTable.name,
        })
        .from(productsTable)
        .where(eq(productsTable.id, newProd.id))
        .leftJoin(brandsTable, eq(productsTable.brandId, brandsTable.id));
      return { status: 201, body: { status: 'success', data: { product } } };
    });
  }

  @Get(':productId')
  @TsRestHandler(c.products.getProductById)
  getProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return tsRestHandler(c.products.getProductById, async () => {
      const [product = null] = await this.drizzleService.db
        .select({
          ...getTableColumns(productsTable),
          brand: brandsTable.name,
          category: categoriesTable.name,
        })
        .from(productsTable)
        .where(eq(productsTable.id, productId))
        .leftJoin(
          categoriesTable,
          eq(productsTable.categoryId, categoriesTable.id),
        )
        .leftJoin(brandsTable, eq(productsTable.brandId, brandsTable.id));

      if (!product) throw new NotFoundException();

      const discCte = this.drizzleService.db.$with('disc_cte').as(
        this.drizzleService.db
          .select()
          .from(discountsTable)
          .where(and(eq(discountsTable.isActive, true)))
          .orderBy(desc(discountsTable.createdAt)),
      );

      const variantsQuery = this.drizzleService.db
        .with(discCte)
        .selectDistinctOn([productVariantsTable.id], {
          id: productVariantsTable.id,
          name: productVariantsTable.name,
          color: {
            id: colorsTable.id,
            name: colorsTable.name,
            hex: colorsTable.hex,
          },
          discount: {
            ...discCte._.selectedFields,
            formattedDiscount: sql<string>`
              case
                when ${discCte.discountType} = ${DiscountType.FIXED}
                  then '$' || ${discCte.discountValue} / ${PRICE_MINOR_UNITS}
                when ${discCte.discountType} = ${DiscountType.PERCENTAGE}
                  then ${discCte.discountValue} || '%'
                else null
              end
            `,
          },
        })
        .from(productVariantsTable)
        .leftJoin(colorsTable, eq(productVariantsTable.colorId, colorsTable.id))
        .leftJoin(discCte, eq(discCte.productVarId, productVariantsTable.id))
        .where(eq(productVariantsTable.productId, productId));

      const skusQuery = this.drizzleService.db
        .select({
          ...getTableColumns(productSkusTable),
          size: getTableColumns(sizesTable),
          formattedPrice: formattedPrice(productSkusTable.basePrice),
        })
        .from(productSkusTable)
        .where(eq(productSkusTable.productId, productId))
        .leftJoin(sizesTable, eq(sizesTable.id, productSkusTable.sizeId));

      const [variants, skus] = await Promise.all([variantsQuery, skusQuery]);

      return {
        status: 200,
        body: {
          status: 'success',
          data: {
            product: {
              ...product,
              descriptionHtml: product.description
                ? productDescrToHtml(product.description)
                : null,
              variants,
              skus,
            },
          },
        },
      };
    });
  }

  @Get()
  @TsRestHandler(c.products.getProducts)
  getProducts(
    @Query(new ConfiguredValidationPipe({ errorMessage: INVALID_QUERY }))
    query?: ProductQueryDto,
  ) {
    const { active, perPage = LIMIT, priorIds } = query || {};
    const page = query?.page || 1;
    return tsRestHandler(c.products.getProducts, async () => {
      const filters: SQL[] = [];
      const priorityIds = priorIds?.split(',') || [];
      if (active !== undefined) {
        filters.push(eq(productsTable.isActive, active));
      }
      let baseProductsQuery = this.drizzleService.db
        .select({
          ...getTableColumns(productsTable),
          brand: sql<string | null>`${brandsTable.name}`.as('brand_name'),
        })
        .from(productsTable)
        .where(and(...filters))
        .leftJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
        .limit(perPage)
        .offset((page - 1) * perPage)
        .$dynamic();
      if (priorityIds.length) {
        baseProductsQuery = baseProductsQuery.orderBy(sql`
            CASE
              WHEN ${productsTable.id} IN ${priorityIds} THEN 0
              ELSE 1
            END
          `);
      }
      const productsCte = this.drizzleService.db
        .$with('products_cte')
        .as(baseProductsQuery);
      const products = await this.drizzleService.db
        .with(productsCte)
        .select({
          total: sql<number>`${this.drizzleService.db
            .select({ total: count() })
            .from(productsTable)
            .where(and(...filters))
            .as('total_items')}`.mapWith(Number),
          id: productsCte.id,
          brandId: productsCte.brandId,
          categoryId: productsCte.categoryId,
          name: productsCte.name,
          description: productsCte.description,
          gender: productsCte.gender,
          isActive: productsCte.isActive,
          isFeatured: productsCte.isFeatured,
          brand: productsCte.brand,
        })
        .from(productsCte);
      return {
        status: 200,
        body: {
          status: 'success',
          data: {
            products,
            pagination: createPaginationDto({
              perPage,
              page,
              total: products[0]?.total || 0,
            }),
          },
        },
      };
    });
  }

  @Patch(':productId')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.products.updateProduct)
  updateProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body(ConfiguredValidationPipe) updateProductDto: ProductUpdateDto,
  ) {
    return tsRestHandler(c.products.updateProduct, async () => {
      const [updProduct = null] = await this.drizzleService.db
        .update(productsTable)
        .set(updateProductDto)
        .where(eq(productsTable.id, productId))
        .returning();

      if (!updProduct) throw new NotFoundException();

      // @TODO: same issue with CTE as in createProduct
      const [product] = await this.drizzleService.db
        .select({
          ...getTableColumns(productsTable),
          brand: brandsTable.name,
          category: categoriesTable.name,
        })
        .from(productsTable)
        .where(eq(productsTable.id, productId))
        .leftJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
        .leftJoin(
          categoriesTable,
          eq(productsTable.categoryId, categoriesTable.id),
        );

      const discCte = this.drizzleService.db.$with('disc_cte').as(
        this.drizzleService.db
          .select()
          .from(discountsTable)
          .where(and(eq(discountsTable.isActive, true)))
          .orderBy(desc(discountsTable.createdAt)),
      );

      const variantsQuery = this.drizzleService.db
        .with(discCte)
        .selectDistinctOn([productVariantsTable.id], {
          id: productVariantsTable.id,
          name: productVariantsTable.name,
          color: {
            id: colorsTable.id,
            name: colorsTable.name,
            hex: colorsTable.hex,
          },
          discount: {
            ...discCte._.selectedFields,
            formattedDiscount: sql<string>`
              case
                when ${discCte.discountType} = ${DiscountType.FIXED}
                  then '$' || ${discCte.discountValue} / ${PRICE_MINOR_UNITS}
                when ${discCte.discountType} = ${DiscountType.PERCENTAGE}
                  then ${discCte.discountValue} || '%'
                else null
              end
            `,
          },
        })
        .from(productVariantsTable)
        .leftJoin(colorsTable, eq(productVariantsTable.colorId, colorsTable.id))
        .leftJoin(discCte, eq(discCte.productVarId, productVariantsTable.id))
        .where(eq(productVariantsTable.productId, productId));

      const skusQuery = this.drizzleService.db
        .select({
          ...getTableColumns(productSkusTable),
          size: getTableColumns(sizesTable),
          formattedPrice: formattedPrice(productSkusTable.basePrice),
        })
        .from(productSkusTable)
        .where(eq(productSkusTable.productId, productId))
        .leftJoin(sizesTable, eq(sizesTable.id, productSkusTable.sizeId));

      const [variants, skus] = await Promise.all([variantsQuery, skusQuery]);

      return {
        status: 200,
        body: {
          status: 'success',
          data: {
            product: {
              ...product,
              descriptionHtml: product.description
                ? productDescrToHtml(product.description)
                : null,
              variants,
              skus,
            },
          },
        },
      };
    });
  }

  @Delete(':productId')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.products.deleteProduct)
  deleteProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return tsRestHandler(c.products.deleteProduct, async () => {
      const [product = null] = await this.drizzleService.db
        .delete(productsTable)
        .where(eq(productsTable.id, productId))
        .returning();
      if (!product) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { product } } };
    });
  }

  @HttpCode(200)
  @Post('command/bulkDelete')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.products.deleteProducts)
  deleteProducts(@Body() { ids }: { ids: string[] }) {
    type FulfilledAllSettled<T> = Exclude<
      PromiseSettledResult<T>,
      { status: 'rejected' }
    >;

    return tsRestHandler(c.products.deleteProducts, async () => {
      const results = (
        await Promise.allSettled(
          ids.map((id) =>
            this.drizzleService.db
              .delete(productsTable)
              .where(eq(productsTable.id, id))
              .returning()
              .then(([b]) => b || null),
          ),
        )
      )
        .filter((o) => o.status === 'fulfilled' && o.value !== null)
        .map(
          (o: FulfilledAllSettled<InferSelectModel<typeof productsTable>>) =>
            o.value,
        );

      return {
        status: 200,
        body: { status: 'success', data: { products: results } },
      };
    });
  }
}
