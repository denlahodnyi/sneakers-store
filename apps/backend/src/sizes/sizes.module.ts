import { Module } from '@nestjs/common';

import { SizesController } from './sizes.controller.js';

@Module({
  controllers: [SizesController],
})
export class SizesModule {}
