import { SizeSystem } from '@sneakers-store/contracts';
import * as t from 'drizzle-orm/pg-core';

export const sizeSystemEnum = t.pgEnum('size_system', [
  SizeSystem.EU,
  SizeSystem.US,
]);

export const sizesTable = t.pgTable('sizes', {
  id: t.serial().primaryKey(),
  size: t.text().notNull(),
  system: sizeSystemEnum(),
  isActive: t.boolean().notNull().default(false),
});
