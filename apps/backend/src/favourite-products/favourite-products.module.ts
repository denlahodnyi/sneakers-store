import { Module } from '@nestjs/common';

import { FavouriteProductsController } from './favourite-products.controller.js';

@Module({
  controllers: [FavouriteProductsController],
})
export class FavouriteProductsModule {}
