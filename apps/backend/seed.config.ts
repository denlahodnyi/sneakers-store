import { parseArgs } from 'node:util';
import * as dotenv from '@dotenvx/dotenvx';
import { SeedPg } from '@snaplet/seed/adapter-pg';
import { defineConfig } from '@snaplet/seed/config';
import { Client } from 'pg';

const {
  values: { environment },
} = parseArgs({
  strict: false, // disable to allow other @snaplet/seed options
  options: {
    environment: { type: 'string' },
  },
});

dotenv.config({
  path:
    environment === 'production'
      ? ['.env.production.local', '.env.production', '.env']
      : ['.env.development.local', '.env.development', '.env'],
});

export default defineConfig({
  adapter: async () => {
    const client = new Client({
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    await client.connect();
    return new SeedPg(client);
  },
});
