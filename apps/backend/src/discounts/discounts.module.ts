import { Module } from '@nestjs/common';

import { DiscountsController } from './discounts.controller.js';

@Module({
  controllers: [DiscountsController],
})
export class DiscountsModule {}
