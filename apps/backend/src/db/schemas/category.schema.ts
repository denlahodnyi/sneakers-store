import { sql } from 'drizzle-orm';
import * as t from 'drizzle-orm/pg-core';

export const categoriesTable = t.pgTable(
  'categories',
  {
    id: t
      .text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: t.varchar({ length: 50 }).notNull(),
    isActive: t.boolean().notNull().default(false),
    parentId: t.text(),
  },
  (table) => [
    t
      .foreignKey({
        columns: [table.parentId],
        foreignColumns: [table.id],
      })
      .onDelete('set null'),
    t.check('parent_id_check1', sql`${table.parentId} != ${table.id}`),
  ],
);
