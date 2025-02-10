import { DiscountType, PRICE_MINOR_UNITS } from '@sneakers-store/contracts';
import { sql, type Column, type SQL } from 'drizzle-orm';

export const formattedPrice = (column: Column | SQL) =>
  // Truncate zeros after decimal point (450 instead of 450.00), otherwise leave two numbers (450.99)
  sql<string>`
    '$' ||
      CASE
        WHEN ROUND(${column}::numeric / ${PRICE_MINOR_UNITS}, 2) = (${column}::numeric / ${PRICE_MINOR_UNITS})::int
          THEN (${column}::numeric / ${PRICE_MINOR_UNITS})::int -- Whole number (e.g. 450)
        ELSE ROUND(${column}::numeric / ${PRICE_MINOR_UNITS}, 2) -- Keep decimals (e.g 450.99)
      END`;

export const basePriceWithDiscount = (
  basePrice: Column | SQL,
  discountType: Column | SQL | DiscountType | null,
  discountValue: Column | SQL | number | null,
) =>
  sql<number>`
  CASE
      WHEN ${discountType} = ${DiscountType.PERCENTAGE}
        THEN (${basePrice} * (1 - (${discountValue}::NUMERIC / 100)))::INTEGER
      WHEN ${discountType} = ${DiscountType.FIXED}
        THEN GREATEST(0, ${basePrice} - ${discountValue})
      ELSE ${basePrice}
  END
`.mapWith(Number);

export const formattedDiscount = (
  discountType: Column | SQL | DiscountType,
  discountValue: Column | SQL | number,
) =>
  sql<string | null>`
    CASE
      WHEN ${discountType} = ${DiscountType.FIXED}
        THEN ${formattedPrice(typeof discountValue === 'number' ? sql`${discountValue}` : discountValue).getSQL()}
      WHEN ${discountType} = ${DiscountType.PERCENTAGE}
        THEN ${discountValue} || '%'
    END
  `;
