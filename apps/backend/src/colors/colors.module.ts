import { Module } from '@nestjs/common';

import { ColorsController } from './colors.controller.js';

@Module({
  controllers: [ColorsController],
})
export class ColorsModule {}
