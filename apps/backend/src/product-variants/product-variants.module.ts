import { Module } from '@nestjs/common';

import { ProductVariantsController } from './product-variants.controller.js';

@Module({
  controllers: [ProductVariantsController],
})
export class ProductVariantsModule {}
