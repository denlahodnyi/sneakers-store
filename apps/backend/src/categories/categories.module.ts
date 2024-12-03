import { Module } from '@nestjs/common';

import { CategoriesController } from './categories.controller.js';

@Module({
  controllers: [CategoriesController],
})
export class CategoriesModule {}
