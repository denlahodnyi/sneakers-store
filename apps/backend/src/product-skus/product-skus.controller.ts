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
  ValidationPipe,
} from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import {
  contract as c,
  ProductSkuCreateDto,
  ProductSkuUpdateDto,
  type ProductSkuQuery,
} from '@sneakers-store/contracts';
import {
  and,
  eq,
  getTableColumns,
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
import { sizesTable } from '../db/schemas/size.schema.js';

const adminRoles = [Role.SUPER_ADMIN, Role.ADMIN];

@Controller('product-skus')
export class ProductSkusController {
  constructor(private drizzleService: DrizzleService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.productSkus.createProductSku)
  createProductSku(
    @Body(ConfiguredValidationPipe)
    createProductSkuDto: ProductSkuCreateDto,
  ) {
    return tsRestHandler(c.productSkus.createProductSku, async () => {
      const [productSku] = await this.drizzleService.db
        .insert(productSkusTable)
        .values(createProductSkuDto)
        .returning();
      return {
        status: 201,
        body: { status: 'success', data: { productSku } },
      };
    });
  }

  @Get(':productSkuId')
  @TsRestHandler(c.productSkus.getProductSkuById)
  getProductSku(@Param('productSkuId', ParseUUIDPipe) productSkuId: string) {
    return tsRestHandler(c.productSkus.getProductSkuById, async () => {
      const [productSku = null] = await this.drizzleService.db
        .select({
          ...getTableColumns(productSkusTable),
          product: {
            ...getTableColumns(productsTable),
            brand: brandsTable.name,
            category: categoriesTable.name,
          },
          variant: {
            ...getTableColumns(productVariantsTable),
          },
          color: {
            name: colorsTable.name,
            hex: colorsTable.hex,
          },
          size: {
            value: sizesTable.size,
            system: sizesTable.system,
          },
        })
        .from(productSkusTable)
        .where(eq(productSkusTable.id, productSkuId))
        .innerJoin(
          productVariantsTable,
          eq(productSkusTable.productVarId, productVariantsTable.id),
        )
        .innerJoin(
          colorsTable,
          eq(productVariantsTable.colorId, colorsTable.id),
        )
        .innerJoin(
          productsTable,
          eq(productSkusTable.productId, productsTable.id),
        )
        .innerJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
        .leftJoin(
          categoriesTable,
          eq(productsTable.categoryId, categoriesTable.id),
        )
        .leftJoin(sizesTable, eq(sizesTable.id, productSkusTable.sizeId));

      if (!productSku) throw new NotFoundException();

      return {
        status: 200,
        body: { status: 'success', data: { productSku } },
      };
    });
  }

  @Get()
  @TsRestHandler(c.productSkus.getProductSkus)
  getProductSkus(
    @Query(new ValidationPipe({ whitelist: true, transform: true }))
    query?: ProductSkuQuery,
  ) {
    const filters: SQL[] = [];
    if (query?.productId !== undefined) {
      filters.push(eq(productVariantsTable.productId, query.productId));
    }
    return tsRestHandler(c.productSkus.getProductSkus, async () => {
      const productSkus = await this.drizzleService.db
        .select()
        .from(productSkusTable)
        .where(and(...filters));
      return {
        status: 200,
        body: { status: 'success', data: { productSkus } },
      };
    });
  }

  @Patch(':productSkuId')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.productSkus.updateProductSku)
  updateProductSku(
    @Param('productSkuId', ParseUUIDPipe) productSkuId: string,
    @Body(ConfiguredValidationPipe)
    updateProductSkuDto: ProductSkuUpdateDto,
  ) {
    return tsRestHandler(c.productSkus.updateProductSku, async () => {
      const [productSku = null] = await this.drizzleService.db
        .update(productSkusTable)
        .set(updateProductSkuDto)
        .where(eq(productSkusTable.id, productSkuId))
        .returning();
      if (!productSku) throw new NotFoundException();
      return {
        status: 200,
        body: { status: 'success', data: { productSku } },
      };
    });
  }

  @Delete(':productSkuId')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.productSkus.deleteProductSku)
  deleteProductSku(@Param('productSkuId', ParseUUIDPipe) productSkuId: string) {
    return tsRestHandler(c.productSkus.deleteProductSku, async () => {
      const [productSku = null] = await this.drizzleService.db
        .delete(productSkusTable)
        .where(eq(productSkusTable.id, productSkuId))
        .returning();
      if (!productSku) throw new NotFoundException();
      return {
        status: 200,
        body: { status: 'success', data: { productSku } },
      };
    });
  }

  @HttpCode(200)
  @Post('command/bulkDelete')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.productSkus.deleteProductSkus)
  deleteProductSkus(@Body() { ids }: { ids: string[] }) {
    type FulfilledAllSettled<T> = Exclude<
      PromiseSettledResult<T>,
      { status: 'rejected' }
    >;

    return tsRestHandler(c.productSkus.deleteProductSkus, async () => {
      const results = (
        await Promise.allSettled(
          ids.map((id) =>
            this.drizzleService.db
              .delete(productSkusTable)
              .where(eq(productSkusTable.id, id))
              .returning()
              .then(([b]) => b || null),
          ),
        )
      )
        .filter((o) => o.status === 'fulfilled' && o.value !== null)
        .map(
          (o: FulfilledAllSettled<InferSelectModel<typeof productSkusTable>>) =>
            o.value,
        );

      return {
        status: 200,
        body: { status: 'success', data: { productSkus: results } },
      };
    });
  }
}
