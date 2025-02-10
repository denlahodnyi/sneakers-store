import * as t from 'drizzle-orm/pg-core';

import { timestamps } from './columns.utils.js';
import { usersTable } from './user.schema.js';
import { productSkusTable } from './product.schema.js';

export const cartsTable = t.pgTable('carts', {
  id: t
    .text()
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  userId: t
    .text()
    .notNull()
    .references(() => usersTable.id),
  ...timestamps,
});

export const cartItemsTable = t.pgTable('cart_items', {
  id: t
    .text()
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  cartId: t
    .text()
    .notNull()
    .references(() => cartsTable.id),
  productSkuId: t
    .text()
    .notNull()
    .references(() => productSkusTable.id),
  qty: t.integer().notNull(),
  ...timestamps,
});
