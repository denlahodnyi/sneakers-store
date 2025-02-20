import { Injectable } from '@nestjs/common';
import { and, asc, desc, eq, getTableColumns, inArray, sql } from 'drizzle-orm';
import {
  PRICE_MINOR_UNITS,
  type CartResponseDto,
} from '@sneakers-store/contracts';
import type { PgSelect } from 'drizzle-orm/pg-core';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import {
  productImagesTable,
  productSkusTable,
  productsTable,
  productVariantsTable,
} from '../db/schemas/product.schema.js';
import { cartItemsTable, cartsTable } from '../db/schemas/cart.schema.js';
import {
  formattedDiscount,
  formattedPrice,
  basePriceWithDiscount,
} from '../shared/sql/templates.js';
import { discountsTable } from '../db/schemas/discounts.schema.js';
import { colorsTable } from '../db/schemas/color.schema.js';
import { sizesTable } from '../db/schemas/size.schema.js';
import type { InferRecordDataTypes } from '../drizzle/drizzle.lib.js';

@Injectable()
export class CartsService {
  constructor(private drizzleService: DrizzleService) {}

  getUserCartQuery = (userId: string) =>
    this.drizzleService.db
      .select({ cartId: getTableColumns(cartsTable).id })
      .from(cartsTable)
      .where(eq(cartsTable.userId, userId))
      .orderBy(desc(cartsTable.createdAt))
      .limit(1);

  getImagesQuery = () =>
    this.drizzleService.db
      .selectDistinctOn([productImagesTable.productVarId])
      .from(productImagesTable)
      .orderBy(
        productImagesTable.productVarId,
        asc(productImagesTable.createdAt),
      );

  getImagesCteSubQuery = () => {
    const { db } = this.drizzleService;
    const imagesCteQuery = db.$with('images_cte').as(this.getImagesQuery);
    return db
      .with(imagesCteQuery)
      .select()
      .from(imagesCteQuery)
      .as('images_query');
  };

  getBaseCartItemsSelection = () => ({
    stockQty: productSkusTable.stockQty,
    price: sql<number>`${productSkusTable.basePrice} / ${PRICE_MINOR_UNITS}`.as(
      'price',
    ),
    formattedPrice: formattedPrice(productSkusTable.basePrice).as(
      'formatted_price',
    ),
    discountValue: discountsTable.discountValue,
    discountType: discountsTable.discountType,
    formattedDiscount: formattedDiscount(
      discountsTable.discountType,
      discountsTable.discountValue,
    ).as('formatted_discount'),
    priceWithDiscount: basePriceWithDiscount(
      productSkusTable.basePrice,
      discountsTable.discountType,
      discountsTable.discountValue,
    ).as('price_with_discount'),
    name: sql<string>`COALESCE(${productVariantsTable.name}, ${productsTable.name})`.as(
      'product_name',
    ),
    slug: sql<string>`COALESCE(${productVariantsTable.slug}, ${productVariantsTable.id})`.as(
      'slug',
    ),
    image: this.getImagesCteSubQuery()._.selectedFields,
    color: getTableColumns(colorsTable),
    size: getTableColumns(sizesTable),
    productId: productsTable.id,
    productVariantId: productVariantsTable.id,
    productSkuId: productSkusTable.id,
  });

  buildQueryWithFullItems = (qb: PgSelect) => {
    return qb
      .innerJoin(
        productVariantsTable,
        eq(productSkusTable.productVarId, productVariantsTable.id),
      )
      .innerJoin(
        productsTable,
        eq(productSkusTable.productId, productsTable.id),
      )
      .innerJoin(colorsTable, eq(productVariantsTable.colorId, colorsTable.id))
      .innerJoin(sizesTable, eq(productSkusTable.sizeId, sizesTable.id))
      .leftJoin(
        discountsTable,
        eq(discountsTable.productVarId, productVariantsTable.id),
      )
      .leftJoin(
        this.getImagesCteSubQuery(),
        eq(this.getImagesCteSubQuery().productVarId, productVariantsTable.id),
      );
  };

  async getUserCart(userId: string) {
    return this.getUserCartQuery(userId);
  }

  formatItems(
    items: Omit<
      CartResponseDto['items'][number],
      | 'isInStock'
      | 'formattedPriceWithDiscount'
      | 'priceInCents'
      | 'finalPrice'
      | 'finalPriceInCents'
      | 'formattedFinalPrice'
    >[],
  ) {
    return items.map((it) => {
      const priceWithDiscount = it.priceWithDiscount / PRICE_MINOR_UNITS;
      const finalPrice = priceWithDiscount;
      return {
        ...it,
        isInStock: it.stockQty > 0,
        priceInCents: it.price * PRICE_MINOR_UNITS,
        priceWithDiscount,
        formattedPriceWithDiscount: `$${finalPrice}`,
        finalPrice: finalPrice,
        finalPriceInCents: it.priceWithDiscount,
        formattedFinalPrice: `$${finalPrice}`,
      };
    });
  }

  getFormattedCartUsingFullItems(
    fullItems: CartResponseDto['items'],
    overwriteFields?: Partial<CartResponseDto>,
  ): CartResponseDto {
    const { totalQty, price, totalPrice } = fullItems.reduce(
      (prev, cur) => {
        return {
          totalQty: cur.isInStock ? prev.totalQty + cur.qty : prev.totalQty,
          price: cur.isInStock ? prev.price + cur.price * cur.qty : prev.price,
          totalPrice: cur.isInStock
            ? prev.totalPrice + cur.finalPrice * cur.qty
            : prev.totalPrice,
        };
      },
      {
        totalQty: 0,
        price: 0, // price (excluding discount)
        totalPrice: 0, // total price (including discount)
      },
    );
    const totalDiscount = parseFloat(Number(price - totalPrice).toFixed(2));
    return {
      id: fullItems[0]?.cartId,
      items: fullItems,
      totalQty,
      price,
      priceInCents: price * PRICE_MINOR_UNITS,
      totalPrice,
      totalPriceInCents: totalPrice * PRICE_MINOR_UNITS,
      totalDiscount: totalDiscount > 0 ? totalDiscount : null,
      totalDiscountInCents:
        totalDiscount > 0 ? totalDiscount * PRICE_MINOR_UNITS : null,
      formattedTotalDiscount: totalDiscount > 0 ? `$${totalDiscount}` : null,
      formattedPrice: `$${price}`,
      formattedTotalPrice: `$${totalPrice}`,
      ...overwriteFields,
    };
  }

  async getFullUserCartItems(
    cartId: string,
  ): Promise<CartResponseDto['items']> {
    const { db } = this.drizzleService;

    const selection = {
      id: cartItemsTable.id,
      qty: cartItemsTable.qty,
      ...this.getBaseCartItemsSelection(),
    };

    type SelectionResult = InferRecordDataTypes<typeof selection>[];

    const items = (await this.buildQueryWithFullItems(
      db
        .select(selection)
        .from(cartItemsTable)
        .innerJoin(
          productSkusTable,
          eq(cartItemsTable.productSkuId, productSkusTable.id),
        )
        .where(
          and(
            eq(cartItemsTable.cartId, cartId),
            eq(productsTable.isActive, true),
            eq(sizesTable.isActive, true),
            eq(colorsTable.isActive, true),
          ),
        )
        .$dynamic(),
    )) as unknown as SelectionResult;

    return this.formatItems(items.map((it) => ({ ...it, cartId })));
  }

  async getFullUserCart(userId: string): Promise<CartResponseDto> {
    const userCartQuery = this.getUserCartQuery(userId).as('user_cart');
    const [userCart = null] = await this.drizzleService.db
      .select()
      .from(userCartQuery);
    const items = userCart?.cartId
      ? await this.getFullUserCartItems(userCart.cartId)
      : [];
    return this.getFormattedCartUsingFullItems(items, { id: userCart?.cartId });
  }

  async getCartFromItems(
    selectedItems: { productSkuId: string; qty: number }[],
  ): Promise<CartResponseDto> {
    const { db } = this.drizzleService;
    const selection = {
      cartId: sql<null>`null`,
      id: sql<null>`null`,
      qty: sql<number>`0`,
      ...this.getBaseCartItemsSelection(),
    };

    type SelectionResult = InferRecordDataTypes<typeof selection>[];

    const items = (await this.buildQueryWithFullItems(
      db
        .select(selection)
        .from(productSkusTable)
        .where(
          and(
            inArray(
              productSkusTable.id,
              selectedItems
                .filter((it) => it.productSkuId && it.qty > 0)
                .map((it) => it.productSkuId),
            ),
            eq(productSkusTable.isActive, true),
            eq(productsTable.isActive, true),
            eq(sizesTable.isActive, true),
            eq(colorsTable.isActive, true),
          ),
        )
        .$dynamic(),
    )) as unknown as SelectionResult;

    const formattedItems = this.formatItems(items).map((it) => {
      const qty =
        selectedItems.find((sit) => sit.productSkuId === it.productSkuId)
          ?.qty || 1;
      return {
        ...it,
        qty: qty > it.stockQty && it.stockQty > 0 ? it.stockQty : qty, // Selected items qty should not exceed positive stock qty
      };
    });

    return this.getFormattedCartUsingFullItems(formattedItems);
  }
}
