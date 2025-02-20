import * as t from 'drizzle-orm/pg-core';
import { Gender } from '@sneakers-store/contracts';
import { index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { brandsTable } from './brand.schema.js';
import { categoriesTable } from './category.schema.js';
import { colorsTable } from './color.schema.js';
import { sizesTable } from './size.schema.js';
import { timestamps } from './columns.utils.js';
import { usersTable } from './user.schema.js';

export const genderEnum = t.pgEnum('gender', [
  Gender.MEN,
  Gender.WOMEN,
  Gender.KIDS,
]);

// TODO: make brand, category, size to be not null. Fix dto's
export const productsTable = t.pgTable(
  'products',
  {
    id: t
      .text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    brandId: t
      .integer()
      .references(() => brandsTable.id, { onDelete: 'set null' }),
    categoryId: t
      .integer()
      .references(() => categoriesTable.id, { onDelete: 'set null' }),
    name: t.varchar({ length: 100 }).notNull(),
    description: t.text(),
    gender: genderEnum().notNull(),
    isActive: t.boolean().notNull().default(false),
    isFeatured: t.boolean().notNull().default(false),
    ...timestamps,
  },
  (table) => ({
    nameSearchIdx: index('product_name_idx').using(
      'gin',
      sql`to_tsvector('english', ${table.name})`,
    ),
  }),
);

export const productVariantsTable = t.pgTable(
  'product_variants',
  {
    id: t
      .text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: t
      .text()
      .notNull()
      .references(() => productsTable.id, { onDelete: 'cascade' }), // @TODO: cascade?
    colorId: t
      .integer()
      .notNull()
      .references(() => colorsTable.id),
    name: t.varchar({ length: 255 }).unique(),
    slug: t.varchar({ length: 255 }).unique(),
  },
  (table) => ({
    nameSearchIdx: index('product_var_name_idx').using(
      'gin',
      sql`to_tsvector('english', ${table.name})`,
    ),
  }),
);

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
  sizeId: t.integer().references(() => sizesTable.id),
  sku: t.varchar({ length: 50 }).unique().notNull(),
  stockQty: t.integer().notNull().default(0),
  basePrice: t.integer().notNull().default(0),
  isActive: t.boolean().notNull().default(true),
  ...timestamps,
});

export const productImagesTable = t.pgTable('product_images', {
  id: t
    .text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  publicId: t.text().unique().notNull(),
  productVarId: t
    .text()
    .notNull()
    .references(() => productVariantsTable.id, { onDelete: 'cascade' }),
  url: t.text().notNull(),
  alt: t.text().default(''),
  width: t.integer(),
  height: t.integer(),
  ...timestamps,
});

export const favouriteProductsTable = t.pgTable('favourite_products', {
  id: t
    .text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productVarId: t
    .text()
    .notNull()
    .references(() => productVariantsTable.id, { onDelete: 'cascade' }),
  userId: t
    .text()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  createdAt: timestamps.createdAt,
});
