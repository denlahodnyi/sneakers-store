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
  UseGuards,
} from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import {
  contract as c,
  ProductImageCreateDto,
  ProductImageUpdateDto,
} from '@sneakers-store/contracts';
import { eq } from 'drizzle-orm';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';
import { productImagesTable } from '../db/schemas/product.schema.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../db/schemas/user.schema.js';

const adminRoles = [Role.SUPER_ADMIN, Role.ADMIN];

@Controller('product-images')
export class ProductImagesController {
  constructor(private drizzleService: DrizzleService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.productImages.createProductImg)
  createProductImg(
    @Body(ConfiguredValidationPipe)
    createProductImgDto: ProductImageCreateDto,
  ) {
    return tsRestHandler(c.productImages.createProductImg, async () => {
      const [image] = await this.drizzleService.db
        .insert(productImagesTable)
        .values(createProductImgDto)
        .returning();
      return {
        status: 201,
        body: { status: 'success', data: { image } },
      };
    });
  }

  @Get(':productImageId')
  @TsRestHandler(c.productImages.getProductImgById)
  getProductImg(
    @Param('productImageId', ParseUUIDPipe) productImageId: string,
  ) {
    return tsRestHandler(c.productImages.getProductImgById, async () => {
      const [image = null] = await this.drizzleService.db
        .select()
        .from(productImagesTable)
        .where(eq(productImagesTable.id, productImageId));

      if (!image) throw new NotFoundException();

      return {
        status: 200,
        body: {
          status: 'success',
          data: { image },
        },
      };
    });
  }

  @Get()
  @TsRestHandler(c.productImages.getProductImages)
  getProductImgs() {
    return tsRestHandler(c.productImages.getProductImages, async () => {
      const images = await this.drizzleService.db
        .select()
        .from(productImagesTable);
      return {
        status: 200,
        body: { status: 'success', data: { images } },
      };
    });
  }

  @Patch(':productImageId')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.productImages.updateProductImage)
  updateProductSku(
    @Param('productImageId', ParseUUIDPipe) productImageId: string,
    @Body(ConfiguredValidationPipe)
    updateProductImgDto: ProductImageUpdateDto,
  ) {
    return tsRestHandler(c.productImages.updateProductImage, async () => {
      const [image = null] = await this.drizzleService.db
        .update(productImagesTable)
        .set(updateProductImgDto)
        .where(eq(productImagesTable.id, productImageId))
        .returning();
      if (!image) throw new NotFoundException();
      return {
        status: 200,
        body: { status: 'success', data: { image } },
      };
    });
  }

  @Delete(':productImageId')
  @UseGuards(AuthGuard)
  @Roles(adminRoles)
  @TsRestHandler(c.productImages.deleteProductImage)
  deleteProductImg(
    @Param('productImageId', ParseUUIDPipe) productImageId: string,
  ) {
    return tsRestHandler(c.productImages.deleteProductImage, async () => {
      const [image = null] = await this.drizzleService.db
        .delete(productImagesTable)
        .where(eq(productImagesTable.id, productImageId))
        .returning();
      if (!image) throw new NotFoundException();
      return {
        status: 200,
        body: { status: 'success', data: { image } },
      };
    });
  }
}
