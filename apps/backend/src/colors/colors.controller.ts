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
  ColorCreateDto,
  ColorUpdateDto,
} from '@sneakers-store/contracts';
import { eq, type InferSelectModel } from 'drizzle-orm';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';
import { colorsTable } from '../db/schemas/color.schema.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../db/schemas/user.schema.js';

const adminRoles = [Role.SUPER_ADMIN, Role.ADMIN];

@Controller('colors')
export class ColorsController {
  constructor(private drizzleService: DrizzleService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
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
  getColor(@Param('colorId', ParseUUIDPipe) colorId: string) {
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
  getColors() {
    return tsRestHandler(c.colors.getColors, async () => {
      const colors = await this.drizzleService.db.select().from(colorsTable);
      return { status: 200, body: { status: 'success', data: { colors } } };
    });
  }

  @Patch(':colorId')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.colors.updateColor)
  updateColor(
    @Param('colorId', ParseUUIDPipe) colorId: string,
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
  @Roles(adminRoles)
  @TsRestHandler(c.colors.deleteColor)
  deleteColor(@Param('colorId', ParseUUIDPipe) colorId: string) {
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
  @Roles(adminRoles)
  @TsRestHandler(c.colors.deleteColors)
  deleteColors(@Body() { ids }: { ids: string[] }) {
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
