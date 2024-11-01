import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';

import { DRIZZLE_OPTS } from './drizzle.constants';
import type { DrizzleModuleOptions } from './drizzle.validation';

@Injectable()
export class DrizzleService implements OnModuleInit {
  public db: ReturnType<typeof drizzle>;

  constructor(@Inject(DRIZZLE_OPTS) options: DrizzleModuleOptions) {
    const { host, port, user, password, database } = options;
    this.db = drizzle({
      connection: `postgres://${user}:${password}@${host}:${port}/${database}`,
      casing: 'snake_case',
    });
  }

  async onModuleInit() {
    const result = await this.db.execute('select 1');

    if (result) console.log('DB instantiated');
  }
}
