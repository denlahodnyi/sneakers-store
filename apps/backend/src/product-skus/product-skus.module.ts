import { Module } from '@nestjs/common';

import { ProductSkusController } from './product-skus.controller.js';

@Module({
  controllers: [ProductSkusController],
})
export class ProductSkusModule {}
