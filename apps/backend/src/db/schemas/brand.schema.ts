import * as t from 'drizzle-orm/pg-core';

export const brandsTable = t.pgTable('brands', {
  id: t
    .text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: t.varchar({ length: 50 }).unique().notNull(),
  isActive: t.boolean().notNull().default(false),
  iconUrl: t.varchar({ length: 250 }),
});
