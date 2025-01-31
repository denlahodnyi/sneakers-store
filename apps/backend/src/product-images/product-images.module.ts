import { Module } from '@nestjs/common';

import { ProductImagesController } from './product-images.controller.js';

@Module({
  controllers: [ProductImagesController],
})
export class ProductImagesModule {}
