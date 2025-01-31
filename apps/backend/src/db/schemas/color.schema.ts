import * as t from 'drizzle-orm/pg-core';

export const colorsTable = t.pgTable('colors', {
  id: t.serial().primaryKey(),
  name: t.varchar({ length: 50 }).unique().notNull(),
  hex: t.varchar({ length: 7 }).array().notNull(), // #000000
  isActive: t.boolean().notNull().default(false),
});
