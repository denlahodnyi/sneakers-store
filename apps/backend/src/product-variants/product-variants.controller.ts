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
  ProductVariantCreateDto,
  ProductVariantUpdateDto,
  ProductVariantQueryDto,
} from '@sneakers-store/contracts';
import {
  and,
  asc,
  count,
  eq,
  getTableColumns,
  sql,
  type InferSelectModel,
  type SQL,
} from 'drizzle-orm';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';
import {
  productImagesTable,
  productVariantsTable,
} from '../db/schemas/product.schema.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../db/schemas/user.schema.js';
import { colorsTable } from '../db/schemas/color.schema.js';
import { INVALID_QUERY } from '../shared/constants.js';
import createPaginationDto from '../shared/libs/pagination/createPaginationDto.js';

const adminRoles = [Role.SUPER_ADMIN, Role.ADMIN];
const LIMIT = 10;

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
      const { images: imagesPayload, ...variantPayload } =
        createProductVariantDto;
      const [productVariant] = await this.drizzleService.db
        .insert(productVariantsTable)
        .values(variantPayload)
        .returning();

      const images =
        imagesPayload?.length && productVariant
          ? await this.drizzleService.db
              .insert(productImagesTable)
              .values(
                imagesPayload.map((img) => ({
                  ...img,
                  productVarId: productVariant.id,
                })),
              )
              .returning()
          : [];

      return {
        status: 201,
        body: {
          status: 'success',
          data: { productVariant: { ...productVariant, images } },
        },
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

      const images = await this.drizzleService.db
        .select()
        .from(productImagesTable)
        .where(eq(productImagesTable.productVarId, productVarId))
        .orderBy(asc(productImagesTable.createdAt));

      return {
        status: 200,
        body: {
          status: 'success',
          data: { productVariant: { ...productVariant, images } },
        },
      };
    });
  }

  @Get()
  @TsRestHandler(c.productVariants.getProductVariants)
  getProductVariants(
    @Query(new ConfiguredValidationPipe({ errorMessage: INVALID_QUERY }))
    query?: ProductVariantQueryDto,
  ) {
    const { perPage = LIMIT, productId, fields } = query || {};
    const page = query?.page || 1;
    return tsRestHandler(c.productVariants.getProductVariants, async () => {
      const filters: SQL[] = [];
      const include = { color: !!fields?.includes('color') };
      if (productId !== undefined) {
        filters.push(eq(productVariantsTable.productId, productId));
      }
      const productVarsCte = this.drizzleService.db
        .$with('product_vars_cte')
        .as(
          this.drizzleService.db
            .select()
            .from(productVariantsTable)
            .where(and(...filters))
            .limit(perPage)
            .offset((page - 1) * perPage),
        );
      let productVarsQuery = this.drizzleService.db
        .with(productVarsCte)
        .select({
          total: sql<number>`${this.drizzleService.db
            .select({ total: count() })
            .from(productVariantsTable)
            .where(and(...filters))
            .as('total_items')}`.mapWith(Number),
          id: productVarsCte.id,
          productId: productVarsCte.productId,
          colorId: productVarsCte.colorId,
          name: productVarsCte.name,
          slug: productVarsCte.slug,
          ...(include.color
            ? { color: { name: colorsTable.name, hex: colorsTable.hex } }
            : {}),
        })
        .from(productVarsCte)
        .$dynamic();
      if (include.color) {
        productVarsQuery = productVarsQuery.leftJoin(
          colorsTable,
          eq(colorsTable.id, productVarsCte.colorId),
        ) as typeof productVarsQuery;
      }
      const productVariants = (await productVarsQuery).map((o) => ({
        ...o,
        images: [],
      }));

      return {
        status: 200,
        body: {
          status: 'success',
          data: {
            productVariants,
            pagination: createPaginationDto({
              page,
              perPage,
              total: productVariants[0]?.total || 0,
            }),
          },
        },
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
      const images = await this.drizzleService.db
        .select()
        .from(productImagesTable)
        .where(eq(productImagesTable.productVarId, productVarId));
      return {
        status: 200,
        body: {
          status: 'success',
          data: { productVariant: { ...productVariant, images } },
        },
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
        body: {
          status: 'success',
          data: { productVariant: { ...productVariant, images: [] } },
        },
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
              .then(([pv]) => pv || null),
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
        )
        .map((o) => ({ ...o, images: [] }));

      return {
        status: 200,
        body: { status: 'success', data: { productVariants: results } },
      };
    });
  }
}
