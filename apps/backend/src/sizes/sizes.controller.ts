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
  SizeCreateDto,
  SizeUpdateDto,
  SizeQueryDto,
} from '@sneakers-store/contracts';
import { and, eq, type InferSelectModel, type SQL } from 'drizzle-orm';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';
import { sizesTable } from '../db/schemas/size.schema.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../db/schemas/user.schema.js';
import { INVALID_QUERY } from '../shared/constants.js';

const adminRoles = [Role.SUPER_ADMIN, Role.ADMIN];

@Controller('sizes')
export class SizesController {
  constructor(private drizzleService: DrizzleService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.sizes.createSize)
  createSize(@Body(ConfiguredValidationPipe) createSizeDto: SizeCreateDto) {
    return tsRestHandler(c.sizes.createSize, async () => {
      const [size] = await this.drizzleService.db
        .insert(sizesTable)
        .values(createSizeDto)
        .returning();
      return { status: 201, body: { status: 'success', data: { size } } };
    });
  }

  @Get(':sizeId')
  @TsRestHandler(c.sizes.getSizeById)
  getSize(@Param('sizeId', ParseIntPipe) sizeId: number) {
    return tsRestHandler(c.sizes.getSizeById, async () => {
      const [size = null] = await this.drizzleService.db
        .select()
        .from(sizesTable)
        .where(eq(sizesTable.id, sizeId));
      if (!size) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { size } } };
    });
  }

  @Get()
  @TsRestHandler(c.sizes.getSizes)
  getSizes(
    @Query(new ConfiguredValidationPipe({ errorMessage: INVALID_QUERY }))
    query?: SizeQueryDto,
  ) {
    const { active } = query || {};
    return tsRestHandler(c.sizes.getSizes, async () => {
      const filters: SQL[] = [];
      if (active !== undefined) {
        filters.push(eq(sizesTable.isActive, active));
      }
      const sizes = await this.drizzleService.db
        .select()
        .from(sizesTable)
        .where(and(...filters));
      return { status: 200, body: { status: 'success', data: { sizes } } };
    });
  }

  @Patch(':sizeId')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.sizes.updateSize)
  updateSize(
    @Param('sizeId', ParseIntPipe) sizeId: number,
    @Body(ConfiguredValidationPipe) updateSizeDto: SizeUpdateDto,
  ) {
    return tsRestHandler(c.sizes.updateSize, async () => {
      const [size = null] = await this.drizzleService.db
        .update(sizesTable)
        .set(updateSizeDto)
        .where(eq(sizesTable.id, sizeId))
        .returning();
      if (!size) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { size } } };
    });
  }

  @Delete(':sizeId')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.sizes.deleteSize)
  deleteSize(@Param('sizeId', ParseIntPipe) sizeId: number) {
    return tsRestHandler(c.sizes.deleteSize, async () => {
      const [size = null] = await this.drizzleService.db
        .delete(sizesTable)
        .where(eq(sizesTable.id, sizeId))
        .returning();
      if (!size) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { size } } };
    });
  }

  @HttpCode(200)
  @Post('command/bulkDelete')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.sizes.deleteSizes)
  deleteSizes(@Body() { ids }: { ids: number[] }) {
    type FulfilledAllSettled<T> = Exclude<
      PromiseSettledResult<T>,
      { status: 'rejected' }
    >;

    return tsRestHandler(c.sizes.deleteSizes, async () => {
      const results = (
        await Promise.allSettled(
          ids.map((id) =>
            this.drizzleService.db
              .delete(sizesTable)
              .where(eq(sizesTable.id, id))
              .returning()
              .then(([b]) => b || null),
          ),
        )
      )
        .filter((o) => o.status === 'fulfilled' && o.value !== null)
        .map(
          (o: FulfilledAllSettled<InferSelectModel<typeof sizesTable>>) =>
            o.value,
        );

      return {
        status: 200,
        body: { status: 'success', data: { sizes: results } },
      };
    });
  }
}
