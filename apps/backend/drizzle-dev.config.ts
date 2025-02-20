/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as dotenv from '@dotenvx/dotenvx';
import { defineConfig } from 'drizzle-kit';

dotenv.config({
  path: ['.env.development.local', '.env.development', '.env'],
});

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schemas/*.schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    // url: process.env.DATABASE_URL!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    database: process.env.DB_NAME!,
    ssl: false,
  },
  casing: 'snake_case',
});
