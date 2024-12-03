import { Module } from '@nestjs/common';

import { BrandsController } from './brands.controller.js';

@Module({
  controllers: [BrandsController],
})
export class BrandsModule {}
