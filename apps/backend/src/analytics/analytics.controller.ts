import { Controller, Get, UseGuards } from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { contract as c } from '@sneakers-store/contracts';
import { and, asc, avg, count, desc, eq, gt, sql, sum } from 'drizzle-orm';

import { DrizzleService } from '../drizzle/drizzle.service.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { ADMIN_ROLES } from '../db/schemas/user.schema.js';
import { orderLinesTable, ordersTable } from '../db/schemas/order.schema.js';
import {
  formattedPrice,
  priceFromMinorUnits,
} from '../shared/sql/templates.js';
import {
  productSkusTable,
  productsTable,
} from '../db/schemas/product.schema.js';

@Controller('analytics')
export class AnalyticsController {
  constructor(private drizzleService: DrizzleService) {}

  @Get()
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.analytics.getSummary)
  async getSummary() {
    return tsRestHandler(c.analytics.getSummary, async () => {
      const { db } = this.drizzleService;

      const [ordersSummary] = await db
        .select({
          total: count(),
          totalRevenue: formattedPrice(sum(ordersTable.totalPriceInCents)),
          averageRevenue: formattedPrice(avg(ordersTable.totalPriceInCents)),
        })
        .from(ordersTable)
        .where(eq(ordersTable.payStatus, 'paid'));

      const productsStockSumQuery = db
        .select({
          productId: productSkusTable.productId,
          unitsInStock: sum(productSkusTable.stockQty)
            .mapWith(Number)
            .as('units_in_stock'),
        })
        .from(productSkusTable)
        .where(and(eq(productSkusTable.isActive, true)))
        .groupBy(productSkusTable.productId)
        .as('stock_by_products');

      const [productsStockSummary = null] = await db
        .select({
          totalUnitsInStock: sql`${sum(
            productsStockSumQuery.unitsInStock,
          )}`.mapWith(Number),
          totalProductsInStock: count(productsStockSumQuery.productId),
        })
        .from(productsStockSumQuery)
        .innerJoin(
          productsTable,
          eq(productsTable.id, productsStockSumQuery.productId),
        )
        .where(
          and(
            eq(productsTable.isActive, true),
            gt(productsStockSumQuery.unitsInStock, 0),
          ),
        );

      const bestSellersSubQuery = db
        .select({
          productSkuId: orderLinesTable.productSkuId,
          total: sum(orderLinesTable.qty).mapWith(Number).as('total'),
        })
        .from(orderLinesTable)
        .groupBy(orderLinesTable.productSkuId)
        .orderBy((selection) => desc(selection.total))
        .limit(3)
        .as('top_product_sku');

      const bestSellers = await db
        .select({
          name: productsTable.name,
          count: bestSellersSubQuery.total,
        })
        .from(bestSellersSubQuery)
        .innerJoin(
          productSkusTable,
          eq(productSkusTable.id, bestSellersSubQuery.productSkuId),
        )
        .innerJoin(
          productsTable,
          eq(productsTable.id, productSkusTable.productId),
        )
        .where(eq(productsTable.isActive, true));

      const yearOverview = await db
        .select({
          yearMonth:
            sql<string>`to_char(${ordersTable.createdAt}, 'YYYY Month')`.as(
              'month_year',
            ),
          date: sql<string>`to_date(to_char(${ordersTable.createdAt}, 'YYYY Month'), 'YYYY Month')::timestamp`.as(
            'date',
          ),
          revenue: priceFromMinorUnits(
            sum(ordersTable.totalPriceInCents),
          ).mapWith(Number),
          formattedRevenue: formattedPrice(sum(ordersTable.totalPriceInCents)),
        })
        .from(ordersTable)
        .where(
          sql`extract(year from created_at) = extract(year from current_date)`,
        )
        .groupBy(sql`month_year`)
        .orderBy((sel) => asc(sel.date));

      return {
        status: 200,
        body: {
          status: 'success',
          data: {
            summary: {
              totalOrders: ordersSummary.total,
              totalRevenue: ordersSummary.totalRevenue,
              avgRevenue: ordersSummary.averageRevenue,
              productsInStock: productsStockSummary?.totalProductsInStock || 0,
              unitsInStock: productsStockSummary?.totalUnitsInStock || 0,
              bestSellingProducts: bestSellers,
              yearOverview,
            },
          },
        },
      };
    });
  }
}
