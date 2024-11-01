import { pgTable } from 'drizzle-orm/pg-core';
import * as t from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: t.integer().primaryKey(),
  name: t.varchar({ length: 50 }).notNull(),
});
