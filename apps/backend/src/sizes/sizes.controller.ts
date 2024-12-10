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
  UseGuards,
} from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import {
  contract as c,
  SizeCreateDto,
  SizeUpdateDto,
} from '@sneakers-store/contracts';
import { eq, type InferSelectModel } from 'drizzle-orm';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';
import { sizesTable } from '../db/schemas/size.schema.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../db/schemas/user.schema.js';

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
  getSize(@Param('sizeId', ParseUUIDPipe) sizeId: string) {
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
  getSizes() {
    return tsRestHandler(c.sizes.getSizes, async () => {
      const sizes = await this.drizzleService.db.select().from(sizesTable);
      return { status: 200, body: { status: 'success', data: { sizes } } };
    });
  }

  @Patch(':sizeId')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.sizes.updateSize)
  updateSize(
    @Param('sizeId', ParseUUIDPipe) sizeId: string,
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
  deleteSize(@Param('sizeId', ParseUUIDPipe) sizeId: string) {
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
  deleteSizes(@Body() { ids }: { ids: string[] }) {
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
