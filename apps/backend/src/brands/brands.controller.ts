import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import {
  contract as c,
  BrandCreateDto,
  BrandUpdateDto,
  type BrandQueryDto,
} from '@sneakers-store/contracts';
import { and, eq, type InferSelectModel, type SQL } from 'drizzle-orm';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';
import { brandsTable } from '../db/schemas/brand.schema.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { INVALID_QUERY } from '../shared/constants.js';
import { ADMIN_ROLES } from '../db/schemas/user.schema.js';

@Controller('brands')
export class BrandsController {
  constructor(private drizzleService: DrizzleService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.brands.createBrand)
  createBrand(@Body(ConfiguredValidationPipe) createBrandDto: BrandCreateDto) {
    return tsRestHandler(c.brands.createBrand, async () => {
      const [brand] = await this.drizzleService.db
        .insert(brandsTable)
        .values(createBrandDto)
        .returning();
      return { status: 201, body: { status: 'success', data: { brand } } };
    });
  }

  @Get(':brandId')
  @TsRestHandler(c.brands.getBrandById)
  getBrand(@Param('brandId', ParseIntPipe) brandId: number) {
    return tsRestHandler(c.brands.getBrandById, async () => {
      const [brand = null] = await this.drizzleService.db
        .select()
        .from(brandsTable)
        .where(eq(brandsTable.id, brandId));
      if (!brand) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { brand } } };
    });
  }

  @Get()
  @TsRestHandler(c.brands.getBrands)
  getBrands(
    @Query(new ConfiguredValidationPipe({ errorMessage: INVALID_QUERY }))
    query?: BrandQueryDto,
  ) {
    const { active } = query || {};
    const filters: SQL[] = [];
    if (active !== undefined) {
      filters.push(eq(brandsTable.isActive, active));
    }
    return tsRestHandler(c.brands.getBrands, async () => {
      const brands = await this.drizzleService.db
        .select()
        .from(brandsTable)
        .where(and(...filters));
      return { status: 200, body: { status: 'success', data: { brands } } };
    });
  }

  @Patch(':brandId')
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.brands.updateBrand)
  updateBrand(
    @Param('brandId', ParseIntPipe) brandId: number,
    @Body(ConfiguredValidationPipe) updateBrandDto: BrandUpdateDto,
  ) {
    return tsRestHandler(c.brands.updateBrand, async () => {
      const [brand = null] = await this.drizzleService.db
        .update(brandsTable)
        .set(updateBrandDto)
        .where(eq(brandsTable.id, brandId))
        .returning();
      if (!brand) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { brand } } };
    });
  }

  @Delete(':brandId')
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.brands.deleteBrand)
  deleteBrand(@Param('brandId', ParseIntPipe) brandId: number) {
    return tsRestHandler(c.brands.deleteBrand, async () => {
      const [brand = null] = await this.drizzleService.db
        .delete(brandsTable)
        .where(eq(brandsTable.id, brandId))
        .returning();
      if (!brand) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { brand } } };
    });
  }

  @HttpCode(200)
  @Post('command/bulkDelete')
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.brands.deleteBrands)
  deleteBrands(@Body() { ids }: { ids: number[] }) {
    type FulfilledAllSettled<T> = Exclude<
      PromiseSettledResult<T>,
      { status: 'rejected' }
    >;

    return tsRestHandler(c.brands.deleteBrands, async () => {
      const results = (
        await Promise.allSettled(
          ids.map((id) =>
            this.drizzleService.db
              .delete(brandsTable)
              .where(eq(brandsTable.id, id))
              .returning()
              .then(([b]) => b || null),
          ),
        )
      )
        .filter((o) => o.status === 'fulfilled' && o.value !== null)
        .map(
          (o: FulfilledAllSettled<InferSelectModel<typeof brandsTable>>) =>
            o.value,
        );

      return {
        status: 200,
        body: { status: 'success', data: { brands: results } },
      };
    });
  }
}
