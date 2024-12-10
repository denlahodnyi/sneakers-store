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
  ProductCreateDto,
  ProductUpdateDto,
} from '@sneakers-store/contracts';
import { eq, getTableColumns, type InferSelectModel } from 'drizzle-orm';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';
import {
  productsTable,
  productVariantsTable,
} from '../db/schemas/product.schema.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../db/schemas/user.schema.js';
import { categoriesTable } from '../db/schemas/category.schema.js';
import { brandsTable } from '../db/schemas/brand.schema.js';
import { colorsTable } from '../db/schemas/color.schema.js';

const adminRoles = [Role.SUPER_ADMIN, Role.ADMIN];

@Controller('products')
export class ProductsController {
  constructor(private drizzleService: DrizzleService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.products.createProduct)
  createProduct(
    @Body(ConfiguredValidationPipe) createProductDto: ProductCreateDto,
  ) {
    return tsRestHandler(c.products.createProduct, async () => {
      const [newProd] = await this.drizzleService.db
        .insert(productsTable)
        .values(createProductDto)
        .returning();
      // TODO: drizzle doesn't support CTE with RETURNING for now. Check it
      // later to make it in single query
      const [product] = await this.drizzleService.db
        .select({
          ...getTableColumns(productsTable),
          brand: brandsTable.id,
        })
        .from(productsTable)
        .where(eq(productsTable.id, newProd.id))
        .leftJoin(brandsTable, eq(productsTable.brandId, brandsTable.id));
      return { status: 201, body: { status: 'success', data: { product } } };
    });
  }

  @Get(':productId')
  @TsRestHandler(c.products.getProductById)
  getProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return tsRestHandler(c.products.getProductById, async () => {
      const [product = null] = await this.drizzleService.db
        .select({
          ...getTableColumns(productsTable),
          brand: brandsTable.name,
          category: categoriesTable.name,
        })
        .from(productsTable)
        .where(eq(productsTable.id, productId))
        .leftJoin(
          categoriesTable,
          eq(productsTable.categoryId, categoriesTable.id),
        )
        .leftJoin(brandsTable, eq(productsTable.brandId, brandsTable.id));

      if (!product) throw new NotFoundException();

      const variants = await this.drizzleService.db
        .select({
          id: productVariantsTable.id,
          color: {
            id: colorsTable.id,
            name: colorsTable.name,
            hex: colorsTable.hex,
          },
        })
        .from(productVariantsTable)
        .where(eq(productVariantsTable.productId, productId))
        .leftJoin(
          colorsTable,
          eq(productVariantsTable.colorId, colorsTable.id),
        );

      return {
        status: 200,
        body: {
          status: 'success',
          data: {
            product: {
              ...product,
              variants,
            },
          },
        },
      };
    });
  }

  @Get()
  @TsRestHandler(c.products.getProducts)
  getProducts() {
    return tsRestHandler(c.products.getProducts, async () => {
      const products = await this.drizzleService.db
        .select({ ...getTableColumns(productsTable), brand: brandsTable.name })
        .from(productsTable)
        .leftJoin(brandsTable, eq(productsTable.brandId, brandsTable.id));
      return { status: 200, body: { status: 'success', data: { products } } };
    });
  }

  @Patch(':productId')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.products.updateProduct)
  updateProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body(ConfiguredValidationPipe) updateProductDto: ProductUpdateDto,
  ) {
    return tsRestHandler(c.products.updateProduct, async () => {
      const [updProduct = null] = await this.drizzleService.db
        .update(productsTable)
        .set(updateProductDto)
        .where(eq(productsTable.id, productId))
        .returning();

      if (!updProduct) throw new NotFoundException();

      // @TODO: same issue with CTE as in createProduct
      const [product] = await this.drizzleService.db
        .select({
          ...getTableColumns(productsTable),
          brand: brandsTable.id,
          category: categoriesTable.id,
        })
        .from(productsTable)
        .where(eq(productsTable.id, productId))
        .leftJoin(brandsTable, eq(productsTable.brandId, brandsTable.id))
        .leftJoin(
          categoriesTable,
          eq(productsTable.categoryId, categoriesTable.id),
        );
      const variants = await this.drizzleService.db
        .select({
          id: productVariantsTable.id,
          color: {
            id: colorsTable.id,
            name: colorsTable.name,
            hex: colorsTable.hex,
          },
        })
        .from(productVariantsTable)
        .where(eq(productVariantsTable.productId, productId))
        .leftJoin(
          colorsTable,
          eq(productVariantsTable.colorId, colorsTable.id),
        );

      return {
        status: 200,
        body: {
          status: 'success',
          data: { product: { ...product, variants } },
        },
      };
    });
  }

  @Delete(':productId')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.products.deleteProduct)
  deleteProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return tsRestHandler(c.products.deleteProduct, async () => {
      const [product = null] = await this.drizzleService.db
        .delete(productsTable)
        .where(eq(productsTable.id, productId))
        .returning();
      if (!product) throw new NotFoundException();
      return { status: 200, body: { status: 'success', data: { product } } };
    });
  }

  @HttpCode(200)
  @Post('command/bulkDelete')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.products.deleteProducts)
  deleteProducts(@Body() { ids }: { ids: string[] }) {
    type FulfilledAllSettled<T> = Exclude<
      PromiseSettledResult<T>,
      { status: 'rejected' }
    >;

    return tsRestHandler(c.products.deleteProducts, async () => {
      const results = (
        await Promise.allSettled(
          ids.map((id) =>
            this.drizzleService.db
              .delete(productsTable)
              .where(eq(productsTable.id, id))
              .returning()
              .then(([b]) => b || null),
          ),
        )
      )
        .filter((o) => o.status === 'fulfilled' && o.value !== null)
        .map(
          (o: FulfilledAllSettled<InferSelectModel<typeof productsTable>>) =>
            o.value,
        );

      return {
        status: 200,
        body: { status: 'success', data: { products: results } },
      };
    });
  }
}
