import { Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq, getTableColumns } from 'drizzle-orm';
import type {
  FullOrderResponseDto,
  UserFullOrderResponseDto,
} from '@sneakers-store/contracts';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import {
  productImagesTable,
  productSkusTable,
  productsTable,
  productVariantsTable,
} from '../db/schemas/product.schema.js';
import { orderLinesTable, ordersTable } from '../db/schemas/order.schema.js';
import {
  formattedDiscount,
  formattedPrice,
  priceFromMinorUnits,
} from '../shared/sql/templates.js';
import { sizesTable } from '../db/schemas/size.schema.js';
import { categoriesTable } from '../db/schemas/category.schema.js';
import { brandsTable } from '../db/schemas/brand.schema.js';
import { colorsTable } from '../db/schemas/color.schema.js';
import { usersTable } from '../db/schemas/user.schema.js';

@Injectable()
export class OrdersService {
  constructor(private drizzleService: DrizzleService) {}

  async getOrder(orderId: string) {
    const { db } = this.drizzleService;

    const [order] = await db
      .select({
        ...getTableColumns(ordersTable),
        price: priceFromMinorUnits(ordersTable.priceInCents),
        totalPrice: priceFromMinorUnits(ordersTable.totalPriceInCents),
        totalDiscount: priceFromMinorUnits(ordersTable.totalDiscountInCents),
        formattedTotalPrice: formattedPrice(ordersTable.totalPriceInCents),
        formattedTotalDiscount: formattedPrice(
          ordersTable.totalDiscountInCents,
        ),
      })
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId));

    if (!order) throw new NotFoundException();

    return order;
  }

  async getFullOrder(orderId: string) {
    const { db } = this.drizzleService;
    const orderItems = await db
      .select({
        product: productsTable,
        productVariant: productVariantsTable,
        user: usersTable,
        order: {
          ...getTableColumns(ordersTable),
          price: priceFromMinorUnits(ordersTable.priceInCents),
          totalPrice: priceFromMinorUnits(ordersTable.totalPriceInCents),
          totalDiscount: priceFromMinorUnits(ordersTable.totalDiscountInCents),
          formattedTotalPrice: formattedPrice(ordersTable.totalPriceInCents),
          formattedTotalDiscount: formattedPrice(
            ordersTable.totalDiscountInCents,
          ),
        },
        item: {
          ...getTableColumns(orderLinesTable),
          price: priceFromMinorUnits(orderLinesTable.priceInCents),
          finalPrice: priceFromMinorUnits(orderLinesTable.finalPriceInCents),
          formattedPrice: formattedPrice(orderLinesTable.priceInCents),
          formattedFinalPrice: formattedPrice(
            orderLinesTable.finalPriceInCents,
          ),
          formattedDiscount: formattedDiscount(
            orderLinesTable.discountType,
            orderLinesTable.discountValue,
          ),
        },
      })
      .from(ordersTable)
      .innerJoin(orderLinesTable, eq(orderLinesTable.orderId, ordersTable.id))
      .innerJoin(
        productSkusTable,
        eq(productSkusTable.id, orderLinesTable.productSkuId),
      )
      .innerJoin(
        productVariantsTable,
        eq(productVariantsTable.id, productSkusTable.productVarId),
      )
      .innerJoin(
        productsTable,
        eq(productsTable.id, productSkusTable.productId),
      )
      .leftJoin(usersTable, eq(usersTable.id, ordersTable.userId))
      .where(eq(ordersTable.id, orderId));

    if (!orderItems.length) throw new NotFoundException();

    const order: FullOrderResponseDto = {
      ...orderItems[0].order,
      user: orderItems[0].user,
      items: orderItems.map((o) => ({
        ...o.item,
        productName: o.productVariant.name || o.product.name,
      })),
    };

    return order;
  }

  async getFullUserOrder(orderId: string, userId: string) {
    const { db } = this.drizzleService;
    // TODO: move query to separate service
    const imagesQuery = db
      .selectDistinctOn([productImagesTable.productVarId])
      .from(productImagesTable)
      .orderBy(
        productImagesTable.productVarId,
        asc(productImagesTable.createdAt),
      )
      .as('image');
    const orderItems = await db
      .select({
        product: productsTable,
        productVariant: productVariantsTable,
        category: categoriesTable,
        size: sizesTable,
        brand: brandsTable,
        color: colorsTable,
        image: imagesQuery._.selectedFields,
        order: {
          ...getTableColumns(ordersTable),
          price: priceFromMinorUnits(ordersTable.priceInCents),
          totalPrice: priceFromMinorUnits(ordersTable.totalPriceInCents),
          totalDiscount: priceFromMinorUnits(ordersTable.totalDiscountInCents),
          formattedTotalPrice: formattedPrice(ordersTable.totalPriceInCents),
          formattedTotalDiscount: formattedPrice(
            ordersTable.totalDiscountInCents,
          ),
        },
        item: {
          ...getTableColumns(orderLinesTable),
          price: priceFromMinorUnits(orderLinesTable.priceInCents),
          finalPrice: priceFromMinorUnits(orderLinesTable.finalPriceInCents),
          formattedPrice: formattedPrice(orderLinesTable.priceInCents),
          formattedFinalPrice: formattedPrice(
            orderLinesTable.finalPriceInCents,
          ),
          formattedDiscount: formattedDiscount(
            orderLinesTable.discountType,
            orderLinesTable.discountValue,
          ),
        },
      })
      .from(ordersTable)
      .innerJoin(orderLinesTable, eq(orderLinesTable.orderId, ordersTable.id))
      .innerJoin(
        productSkusTable,
        eq(productSkusTable.id, orderLinesTable.productSkuId),
      )
      .innerJoin(
        productVariantsTable,
        eq(productVariantsTable.id, productSkusTable.productVarId),
      )
      .innerJoin(
        productsTable,
        eq(productsTable.id, productSkusTable.productId),
      )
      .innerJoin(colorsTable, eq(colorsTable.id, productVariantsTable.colorId))
      .leftJoin(sizesTable, eq(sizesTable.id, productSkusTable.sizeId))
      .leftJoin(
        categoriesTable,
        eq(categoriesTable.id, productsTable.categoryId),
      )
      .leftJoin(brandsTable, eq(brandsTable.id, productsTable.brandId))
      .leftJoin(
        imagesQuery,
        eq(imagesQuery.productVarId, productVariantsTable.id),
      )
      .where(and(eq(ordersTable.id, orderId), eq(ordersTable.userId, userId)));

    if (!orderItems.length) throw new NotFoundException();

    const order: UserFullOrderResponseDto = {
      ...orderItems[0].order,
      items: orderItems.map((o) => ({
        ...o.item,
        productVariantId: o.productVariant.id,
        productName: o.productVariant.name || o.product.name,
        slug: o.productVariant.slug || o.productVariant.id,
        gender: o.product.gender,
        category: o.category,
        brand: o.brand,
        size: o.size,
        color: o.color,
        image: o.image,
      })),
    };

    return order;
  }
}
