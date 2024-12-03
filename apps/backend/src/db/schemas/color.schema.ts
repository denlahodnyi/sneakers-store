import * as t from 'drizzle-orm/pg-core';

export const colorsTable = t.pgTable('colors', {
  id: t
    .text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: t.varchar({ length: 50 }).unique().notNull(),
  hex: t.varchar({ length: 7 }).notNull(), // #000 or #000000
  isActive: t.boolean().notNull().default(false),
});
