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
  ColorCreateDto,
  ColorUpdateDto,
  ColorQueryDto,
} from '@sneakers-store/contracts';
import { and, eq, type InferSelectModel, type SQL } from 'drizzle-orm';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';
import { colorsTable } from '../db/schemas/color.schema.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { INVALID_QUERY } from '../shared/constants.js';
import { ADMIN_ROLES } from '../db/schemas/user.schema.js';

@Controller('colors')
export class ColorsController {
  constructor(private drizzleService: DrizzleService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.colors.createColor)
  createColor(@Body(ConfiguredValidationPipe) createColorDto: ColorCreateDto) {
    return tsRestHandler(c.colors.createColor, async () => {
      const [color] = await this.drizzleService.db
        .insert(colorsTable)
        .values(createColorDto)
        .returning();
      return { status: 201, body: { status: 'success', data: { color } } };
    });
  }

  @Get(':colorId')
  @TsRestHandler(c.colors.getColorById)
  getColor(@Param('colorId', ParseIntPipe) colorId: number) {
    return tsRestHandler(c.colors.getColorById, async () => {
      const [color = null] = await this.drizzleService.db
        .select()
        .from(colorsTable)
        .where(eq(colorsTable.id, colorId));
      if (!color) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { color } } };
    });
  }

  @Get()
  @TsRestHandler(c.colors.getColors)
  getColors(
    @Query(new ConfiguredValidationPipe({ errorMessage: INVALID_QUERY }))
    query?: ColorQueryDto,
  ) {
    const { active } = query || {};
    return tsRestHandler(c.colors.getColors, async () => {
      const filters: SQL[] = [];
      if (active !== undefined) {
        filters.push(eq(colorsTable.isActive, active));
      }
      const colors = await this.drizzleService.db
        .select()
        .from(colorsTable)
        .where(and(...filters));
      return { status: 200, body: { status: 'success', data: { colors } } };
    });
  }

  @Patch(':colorId')
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.colors.updateColor)
  updateColor(
    @Param('colorId', ParseIntPipe) colorId: number,
    @Body(ConfiguredValidationPipe) updateColorDto: ColorUpdateDto,
  ) {
    return tsRestHandler(c.colors.updateColor, async () => {
      const [color = null] = await this.drizzleService.db
        .update(colorsTable)
        .set(updateColorDto)
        .where(eq(colorsTable.id, colorId))
        .returning();
      if (!color) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { color } } };
    });
  }

  @Delete(':colorId')
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.colors.deleteColor)
  deleteColor(@Param('colorId', ParseIntPipe) colorId: number) {
    return tsRestHandler(c.colors.deleteColor, async () => {
      const [color = null] = await this.drizzleService.db
        .delete(colorsTable)
        .where(eq(colorsTable.id, colorId))
        .returning();
      if (!color) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { color } } };
    });
  }

  @HttpCode(200)
  @Post('command/bulkDelete')
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.colors.deleteColors)
  deleteColors(@Body() { ids }: { ids: number[] }) {
    type FulfilledAllSettled<T> = Exclude<
      PromiseSettledResult<T>,
      { status: 'rejected' }
    >;

    return tsRestHandler(c.colors.deleteColors, async () => {
      const results = (
        await Promise.allSettled(
          ids.map((id) =>
            this.drizzleService.db
              .delete(colorsTable)
              .where(eq(colorsTable.id, id))
              .returning()
              .then(([b]) => b || null),
          ),
        )
      )
        .filter((o) => o.status === 'fulfilled' && o.value !== null)
        .map(
          (o: FulfilledAllSettled<InferSelectModel<typeof colorsTable>>) =>
            o.value,
        );

      return {
        status: 200,
        body: { status: 'success', data: { colors: results } },
      };
    });
  }
}
