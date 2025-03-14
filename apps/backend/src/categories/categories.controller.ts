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
  CategoryCreateDto,
  CategoryUpdateDto,
  CategoryQueryDto,
} from '@sneakers-store/contracts';
import {
  and,
  eq,
  getTableColumns,
  type InferSelectModel,
  type SQL,
} from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';
import { categoriesTable } from '../db/schemas/category.schema.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { INVALID_QUERY } from '../shared/constants.js';
import { ADMIN_ROLES } from '../db/schemas/user.schema.js';

const parentTable = alias(categoriesTable, 'parent');

@Controller('categories')
export class CategoriesController {
  constructor(private drizzleService: DrizzleService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.categories.createCategory)
  createCategory(
    @Body(ConfiguredValidationPipe) createCategoryDto: CategoryCreateDto,
  ) {
    return tsRestHandler(c.categories.createCategory, async () => {
      const [category] = await this.drizzleService.db
        .insert(categoriesTable)
        .values(createCategoryDto)
        .returning();
      return { status: 201, body: { status: 'success', data: { category } } };
    });
  }

  @Get(':categoryId')
  @TsRestHandler(c.categories.getCategoryById)
  getCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return tsRestHandler(c.categories.getCategoryById, async () => {
      const [category = null] = await this.drizzleService.db
        .select({ ...getTableColumns(categoriesTable), parent: parentTable })
        .from(categoriesTable)
        .leftJoin(parentTable, eq(parentTable.id, categoriesTable.parentId)) // TODO: do i need this?
        .where(eq(categoriesTable.id, categoryId));
      if (!category) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { category } } };
    });
  }

  @Get()
  @TsRestHandler(c.categories.getCategories)
  getCategories(
    @Query(new ConfiguredValidationPipe({ errorMessage: INVALID_QUERY }))
    query?: CategoryQueryDto,
  ) {
    const { active } = query || {};
    return tsRestHandler(c.categories.getCategories, async () => {
      const filters: SQL[] = [];
      if (active !== undefined) {
        filters.push(eq(categoriesTable.isActive, active));
      }
      const categories = await this.drizzleService.db
        .select({ ...getTableColumns(categoriesTable), parent: parentTable })
        .from(categoriesTable)
        .where(and(...filters))
        .leftJoin(parentTable, eq(parentTable.id, categoriesTable.parentId)); // TODO: do i need this?
      return { status: 200, body: { status: 'success', data: { categories } } };
    });
  }

  @Patch(':categoryId')
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.categories.updateCategory)
  updateCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body(ConfiguredValidationPipe) updateCategoryDto: CategoryUpdateDto,
  ) {
    return tsRestHandler(c.categories.updateCategory, async () => {
      const [category = null] = await this.drizzleService.db
        .update(categoriesTable)
        .set(updateCategoryDto)
        .where(eq(categoriesTable.id, categoryId))
        .returning();
      if (!category) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { category } } };
    });
  }

  @Delete(':categoryId')
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.categories.deleteCategory)
  deleteCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return tsRestHandler(c.categories.deleteCategory, async () => {
      const [category = null] = await this.drizzleService.db
        .delete(categoriesTable)
        .where(eq(categoriesTable.id, categoryId))
        .returning();
      if (!category) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { category } } };
    });
  }

  @HttpCode(200)
  @Post('command/bulkDelete')
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.categories.deleteCategories)
  deleteCategories(@Body() { ids }: { ids: number[] }) {
    type FulfilledAllSettled<T> = Exclude<
      PromiseSettledResult<T>,
      { status: 'rejected' }
    >;

    return tsRestHandler(c.categories.deleteCategories, async () => {
      const results = (
        await Promise.allSettled(
          ids.map((id) =>
            this.drizzleService.db
              .delete(categoriesTable)
              .where(eq(categoriesTable.id, id))
              .returning()
              .then(([c]) => c || null),
          ),
        )
      )
        .filter((o) => o.status === 'fulfilled' && o.value !== null)
        .map(
          (o: FulfilledAllSettled<InferSelectModel<typeof categoriesTable>>) =>
            o.value,
        );

      return {
        status: 200,
        body: { status: 'success', data: { categories: results } },
      };
    });
  }
}
