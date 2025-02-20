import * as t from 'drizzle-orm/pg-core';
import { PaymentStatus } from '@sneakers-store/contracts';

import { usersTable } from './user.schema.js';
import { timestamps } from './columns.utils.js';
import { productSkusTable } from './product.schema.js';
import { discountTypeEnum } from './discounts.schema.js';

export const paymentStatusEnum = t.pgEnum('payment_status', [
  PaymentStatus.PENDING,
  PaymentStatus.PAID,
  PaymentStatus.CANCELED,
  PaymentStatus.REFUND,
]);

export const ordersTable = t.pgTable('orders', {
  id: t
    .text()
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  userId: t.text().references(() => usersTable.id, { onDelete: 'set null' }),
  priceInCents: t.integer().notNull(), // in minor units
  totalPriceInCents: t.integer().notNull(), // in minor units
  totalDiscountInCents: t.integer(), // fixed, in minor units
  customerName: t.text(),
  email: t.text(),
  phone: t.varchar({ length: 20 }),
  address: t.json().$type<{
    line1: string;
    line2: string;
    state: string;
    country: string;
    city: string;
    postalCode: string;
  }>(),
  payStatus: paymentStatusEnum().notNull().default('pending'),
  ...timestamps,
});

export const orderLinesTable = t.pgTable('order_lines', {
  id: t
    .text()
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  orderId: t
    .text()
    .notNull()
    .references(() => ordersTable.id, { onDelete: 'cascade' }),
  productSkuId: t
    .text()
    .notNull()
    .references(() => productSkusTable.id, { onDelete: 'set null' }),
  priceInCents: t.integer().notNull(), // in minor units
  finalPriceInCents: t.integer().notNull(), // in minor units
  qty: t.integer().notNull(),
  discountType: discountTypeEnum(),
  discountValue: t.integer(),
});
