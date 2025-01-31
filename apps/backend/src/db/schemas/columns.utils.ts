import { timestamp } from 'drizzle-orm/pg-core';

export const timestamps = {
  updatedAt: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
};
