import * as t from 'drizzle-orm/pg-core';
import { DiscountType } from '@sneakers-store/contracts';
import { uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { timestamps } from './columns.utils.js';
import { productVariantsTable } from './product.schema.js';

export const discountTypeEnum = t.pgEnum('discount_type', [
  DiscountType.PERCENTAGE,
  DiscountType.FIXED,
]);

export const discountsTable = t.pgTable(
  'discounts',
  {
    id: t
      .text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productVarId: t
      .text()
      .notNull()
      .references(() => productVariantsTable.id, { onDelete: 'cascade' }),
    discountType: discountTypeEnum().notNull(),
    discountValue: t.integer().notNull(),
    isActive: t.boolean().notNull().default(false),
    ...timestamps,
  },
  (table) => ({
    // Allow only one active discount per product_variant
    activeIdx: uniqueIndex('unique_active_discount_idx')
      .on(table.productVarId)
      .where(sql`is_active = true`),
  }),
);
