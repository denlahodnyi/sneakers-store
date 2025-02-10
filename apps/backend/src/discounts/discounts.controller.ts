import {
  Body,
  Controller,
  Delete,
  Get,
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
  DiscountCreateDto,
  DiscountQueryDto,
  DiscountUpdateDto,
} from '@sneakers-store/contracts';
import { and, eq, getTableColumns, not, type SQL } from 'drizzle-orm';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { Roles } from '../auth/roles.decorator.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';
import { discountsTable } from '../db/schemas/discounts.schema.js';
import { INVALID_QUERY } from '../shared/constants.js';
import { formattedDiscount } from '../shared/sql/templates.js';
import { ADMIN_ROLES } from '../db/schemas/user.schema.js';

const selection = {
  ...getTableColumns(discountsTable),
  formattedDiscount: formattedDiscount(
    discountsTable.discountType,
    discountsTable.discountValue,
  ) as SQL<string>,
};

@Controller('discounts')
export class DiscountsController {
  constructor(private drizzleService: DrizzleService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.discount.createDiscount)
  createDiscount(
    @Body(ConfiguredValidationPipe) createDiscountDto: DiscountCreateDto,
  ) {
    return tsRestHandler(c.discount.createDiscount, async () => {
      if (createDiscountDto.isActive && createDiscountDto.productVarId) {
        await this.drizzleService.db
          .update(discountsTable)
          .set({ isActive: false })
          .where(
            and(
              eq(discountsTable.productVarId, createDiscountDto.productVarId),
              eq(discountsTable.isActive, true),
            ),
          );
      }
      const [discount] = await this.drizzleService.db
        .insert(discountsTable)
        .values(createDiscountDto)
        .returning(selection);
      return {
        status: 201,
        body: {
          status: 'success',
          data: { discount },
        },
      };
    });
  }

  @Get(':discountId')
  @TsRestHandler(c.discount.getDiscountById)
  getDiscount(@Param('discountId', ParseUUIDPipe) discountId: string) {
    return tsRestHandler(c.discount.getDiscountById, async () => {
      const [discount = null] = await this.drizzleService.db
        .select(selection)
        .from(discountsTable)
        .where(eq(discountsTable.id, discountId));
      if (!discount) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { discount } } };
    });
  }

  @Get()
  @TsRestHandler(c.discount.getDiscounts)
  getDiscounts(
    @Query(new ConfiguredValidationPipe({ errorMessage: INVALID_QUERY }))
    query?: DiscountQueryDto,
  ) {
    const { active, productVarId } = query || {};
    return tsRestHandler(c.discount.getDiscounts, async () => {
      const filters: SQL[] = [];
      if (active !== undefined) {
        filters.push(eq(discountsTable.isActive, active));
      }
      if (productVarId) {
        filters.push(eq(discountsTable.productVarId, productVarId));
      }
      const discounts = await this.drizzleService.db
        .select(selection)
        .from(discountsTable)
        .where(and(...filters));
      return { status: 200, body: { status: 'success', data: { discounts } } };
    });
  }

  @Patch(':discountId')
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.discount.updateDiscount)
  updateDiscount(
    @Param('discountId', ParseUUIDPipe) discountId: string,
    @Body(ConfiguredValidationPipe) updateDiscountDto: DiscountUpdateDto,
  ) {
    return tsRestHandler(c.discount.updateDiscount, async () => {
      if (updateDiscountDto.isActive && updateDiscountDto.productVarId) {
        await this.drizzleService.db
          .update(discountsTable)
          .set({ isActive: false })
          .where(
            and(
              eq(discountsTable.productVarId, updateDiscountDto.productVarId),
              eq(discountsTable.isActive, true),
              not(eq(discountsTable.id, discountId)),
            ),
          );
      }
      const [discount = null] = await this.drizzleService.db
        .update(discountsTable)
        .set(updateDiscountDto)
        .where(eq(discountsTable.id, discountId))
        .returning(selection);
      if (!discount) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { discount } } };
    });
  }

  @Delete(':discountId')
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.discount.deleteDiscount)
  deleteDiscount(@Param('discountId', ParseUUIDPipe) discountId: string) {
    return tsRestHandler(c.discount.deleteDiscount, async () => {
      const [discount = null] = await this.drizzleService.db
        .delete(discountsTable)
        .where(eq(discountsTable.id, discountId))
        .returning(selection);
      if (!discount) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { discount } } };
    });
  }
}
