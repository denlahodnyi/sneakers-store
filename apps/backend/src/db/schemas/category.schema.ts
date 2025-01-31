import { sql } from 'drizzle-orm';
import * as t from 'drizzle-orm/pg-core';

export const categoriesTable = t.pgTable(
  'categories',
  {
    id: t.serial().primaryKey(),
    name: t.varchar({ length: 50 }).notNull(),
    slug: t.varchar({ length: 100 }).notNull(),
    isActive: t.boolean().notNull().default(false),
    parentId: t.integer(),
  },
  (table) => [
    t
      .foreignKey({
        columns: [table.parentId],
        foreignColumns: [table.id],
      })
      .onDelete('set null'),
    t.check(
      'parent_id_check1',
      sql`${table.parentId}::int != ${table.id}::int`,
    ),
  ],
);
