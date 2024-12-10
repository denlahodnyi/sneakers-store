import * as t from 'drizzle-orm/pg-core';
import { Gender } from '@sneakers-store/contracts';

import { brandsTable } from './brand.schema.js';
import { categoriesTable } from './category.schema.js';
import { colorsTable } from './color.schema.js';
import { sizesTable } from './size.schema.js';
import { timestamps } from './columns.utils.js';

export const genderEnum = t.pgEnum('gender', [
  Gender.MEN,
  Gender.WOMEN,
  Gender.KIDS,
]);

export const productsTable = t.pgTable('products', {
  id: t
    .text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  brandId: t.text().references(() => brandsTable.id, { onDelete: 'set null' }),
  categoryId: t
    .text()
    .references(() => categoriesTable.id, { onDelete: 'set null' }),
  name: t.varchar({ length: 100 }).notNull(),
  description: t.varchar({ length: 255 }),
  gender: genderEnum().notNull(),
  isActive: t.boolean().notNull().default(false),
  ...timestamps,
});

export const productVariantsTable = t.pgTable('product_variants', {
  id: t
    .text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: t
    .text()
    .notNull()
    .references(() => productsTable.id, { onDelete: 'cascade' }), // @TODO: cascade?
  colorId: t
    .text()
    .notNull()
    .references(() => colorsTable.id),
  previewImg: t.text(),
  thumbnailImg: t.text(),
  smallImg: t.text(),
  largeImg: t.text(),
});

export const productSkusTable = t.pgTable('product_skus', {
  id: t
    .text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: t
    .text()
    .notNull()
    .references(() => productsTable.id, { onDelete: 'cascade' }), // @TODO: cascade?
  productVarId: t
    .text()
    .notNull()
    .references(() => productVariantsTable.id),
  sizeId: t.text().references(() => sizesTable.id),
  sku: t.varchar({ length: 50 }).unique().notNull(),
  name: t.varchar({ length: 150 }),
  slug: t.varchar({ length: 255 }),
  stockQty: t.integer().notNull().default(0),
  basePrice: t.integer().notNull().default(0),
  isActive: t.boolean().notNull().default(true),
  ...timestamps,
});
