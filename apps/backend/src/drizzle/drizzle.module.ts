import { Module, type DynamicModule } from '@nestjs/common';

import { DrizzleService } from './drizzle.service';
import { DRIZZLE_OPTS } from './drizzle.constants';
import {
  drizzleModuleOptionsSchema,
  type DrizzleModuleOptions,
} from './drizzle.validation';

@Module({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DrizzleModule {
  static forRoot(options: DrizzleModuleOptions): DynamicModule {
    drizzleModuleOptionsSchema.parse(options);

    return {
      global: true,
      module: DrizzleModule,
      imports: [],
      exports: [DrizzleService],
      providers: [
        {
          provide: DRIZZLE_OPTS,
          useValue: options,
        },
        DrizzleService,
      ],
    };
  }
}
