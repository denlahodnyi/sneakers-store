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
  ProductVariantCreateDto,
  ProductVariantUpdateDto,
  ProductVariantQueryDto,
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
import { productVariantsTable } from '../db/schemas/product.schema.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../db/schemas/user.schema.js';
import { colorsTable } from '../db/schemas/color.schema.js';

const adminRoles = [Role.SUPER_ADMIN, Role.ADMIN];

@Controller('product-vars')
export class ProductVariantsController {
  constructor(private drizzleService: DrizzleService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.productVariants.createProductVariant)
  createProductVariant(
    @Body(ConfiguredValidationPipe)
    createProductVariantDto: ProductVariantCreateDto,
  ) {
    return tsRestHandler(c.productVariants.createProductVariant, async () => {
      const [productVariant] = await this.drizzleService.db
        .insert(productVariantsTable)
        .values(createProductVariantDto)
        .returning();
      return {
        status: 201,
        body: { status: 'success', data: { productVariant } },
      };
    });
  }

  @Get(':productVarId')
  @TsRestHandler(c.productVariants.getProductVariantById)
  getProductVariant(
    @Param('productVarId', ParseUUIDPipe) productVarId: string,
  ) {
    return tsRestHandler(c.productVariants.getProductVariantById, async () => {
      const [productVariant = null] = await this.drizzleService.db
        .select({
          ...getTableColumns(productVariantsTable),
          color: {
            name: colorsTable.name,
            hex: colorsTable.hex,
          },
        })
        .from(productVariantsTable)
        .where(eq(productVariantsTable.id, productVarId))
        .innerJoin(
          colorsTable,
          eq(productVariantsTable.colorId, colorsTable.id),
        );

      if (!productVariant) throw new NotFoundException();

      return {
        status: 200,
        body: { status: 'success', data: { productVariant } },
      };
    });
  }

  @Get()
  @TsRestHandler(c.productVariants.getProductVariants)
  getProductVariants(
    @Query(new ValidationPipe({ transform: true }))
    query?: ProductVariantQueryDto,
  ) {
    return tsRestHandler(c.productVariants.getProductVariants, async () => {
      const include = { color: !!query?.fields?.includes('color') };
      const filters: SQL[] = [];
      if (query?.productId !== undefined) {
        filters.push(eq(productVariantsTable.productId, query.productId));
      }
      let dq = this.drizzleService.db
        .select({
          ...getTableColumns(productVariantsTable),
          ...(include.color
            ? { color: { name: colorsTable.name, hex: colorsTable.hex } }
            : {}),
        })
        .from(productVariantsTable)
        .where(and(...filters))
        .$dynamic();
      type DQ = typeof dq;
      if (include.color) {
        dq = dq.leftJoin(
          colorsTable,
          eq(colorsTable.id, productVariantsTable.colorId),
        ) as DQ;
      }
      const productVariants = await dq;
      return {
        status: 200,
        body: { status: 'success', data: { productVariants } },
      };
    });
  }

  @Patch(':productVarId')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.productVariants.updateProductVariant)
  updateProductVariant(
    @Param('productVarId', ParseUUIDPipe) productVarId: string,
    @Body(ConfiguredValidationPipe)
    updateProductVariantDto: ProductVariantUpdateDto,
  ) {
    return tsRestHandler(c.productVariants.updateProductVariant, async () => {
      const [productVariant = null] = await this.drizzleService.db
        .update(productVariantsTable)
        .set(updateProductVariantDto)
        .where(eq(productVariantsTable.id, productVarId))
        .returning();
      if (!productVariant) throw new NotFoundException();
      return {
        status: 200,
        body: { status: 'success', data: { productVariant } },
      };
    });
  }

  @Delete(':productVarId')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.productVariants.deleteProductVariant)
  deleteProductVariant(
    @Param('productVarId', ParseUUIDPipe) productVarId: string,
  ) {
    return tsRestHandler(c.productVariants.deleteProductVariant, async () => {
      const [productVariant = null] = await this.drizzleService.db
        .delete(productVariantsTable)
        .where(eq(productVariantsTable.id, productVarId))
        .returning();
      if (!productVariant) throw new NotFoundException();
      return {
        status: 200,
        body: { status: 'success', data: { productVariant } },
      };
    });
  }

  @HttpCode(200)
  @Post('command/bulkDelete')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.productVariants.deleteProductVariants)
  deleteProductVariants(@Body() { ids }: { ids: string[] }) {
    type FulfilledAllSettled<T> = Exclude<
      PromiseSettledResult<T>,
      { status: 'rejected' }
    >;

    return tsRestHandler(c.productVariants.deleteProductVariants, async () => {
      const results = (
        await Promise.allSettled(
          ids.map((id) =>
            this.drizzleService.db
              .delete(productVariantsTable)
              .where(eq(productVariantsTable.id, id))
              .returning()
              .then(([b]) => b || null),
          ),
        )
      )
        .filter((o) => o.status === 'fulfilled' && o.value !== null)
        .map(
          (
            o: FulfilledAllSettled<
              InferSelectModel<typeof productVariantsTable>
            >,
          ) => o.value,
        );

      return {
        status: 200,
        body: { status: 'success', data: { productVariants: results } },
      };
    });
  }
}
