import { Module } from '@nestjs/common';

import { CatalogController } from './catalog.controller.js';

@Module({
  controllers: [CatalogController],
})
export class CatalogModule {}
