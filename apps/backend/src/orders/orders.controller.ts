import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import {
  contract as c,
  OrderCreateDto,
  OrderQueryDto,
} from '@sneakers-store/contracts';
import {
  desc,
  eq,
  getTableColumns,
  sql,
  type InferSelectModel,
} from 'drizzle-orm';

import { AuthGuard } from '../auth/auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { ADMIN_ROLES, type UserEntity } from '../db/schemas/user.schema.js';
import { User } from '../auth/user.decorator.js';
import { DrizzleService } from '../drizzle/drizzle.service.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';
import { INVALID_QUERY } from '../shared/constants.js';
import { orderLinesTable, ordersTable } from '../db/schemas/order.schema.js';
import {
  formattedPrice,
  priceFromMinorUnits,
} from '../shared/sql/templates.js';
import { OrdersService } from './orders.service.js';
import createPaginationDto from '../shared/libs/pagination/createPaginationDto.js';
import { productSkusTable } from '../db/schemas/product.schema.js';
import { Public } from '../auth/public.decorator.js';

const LIMIT = 10;

@Controller()
export class OrdersController {
  constructor(
    private drizzleService: DrizzleService,
    private orderService: OrdersService,
  ) {}

  @Get('/orders')
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.order.getOrders)
  getOrders(
    @Query(new ConfiguredValidationPipe({ errorMessage: INVALID_QUERY }))
    query?: OrderQueryDto,
  ) {
    return tsRestHandler(c.order.getOrders, async () => {
      const { db } = this.drizzleService;
      const { perPage = LIMIT } = query || {};
      const page = query?.page || 1;

      const orders = await db
        .select({
          ...getTableColumns(ordersTable),
          price: priceFromMinorUnits(ordersTable.priceInCents),
          totalPrice: priceFromMinorUnits(ordersTable.totalPriceInCents),
          totalDiscount: priceFromMinorUnits(ordersTable.totalDiscountInCents),
          formattedTotalPrice: formattedPrice(ordersTable.totalPriceInCents),
          formattedTotalDiscount: formattedPrice(
            ordersTable.totalDiscountInCents,
          ),
          total: sql<number>`COUNT(*) OVER()`.mapWith(Number).as('total'),
        })
        .from(ordersTable)
        .offset((page - 1) * perPage)
        .limit(perPage)
        .orderBy(desc(ordersTable.createdAt));

      return {
        status: 200,
        body: {
          status: 'success',
          data: {
            orders,
            pagination: createPaginationDto({
              page,
              perPage,
              total: orders[0]?.total || 0,
            }),
          },
        },
      };
    });
  }

  @Get('/orders/:orderId')
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.order.getOrder)
  getOrder(@Param('orderId') orderId: string) {
    return tsRestHandler(c.order.getOrder, async () => {
      const order = await this.orderService.getFullOrder(orderId);

      return { status: 200, body: { status: 'success', data: { order } } };
    });
  }

  @Post('/orders')
  @Public()
  @TsRestHandler(c.order.createOrder)
  createOrder(
    @Body(ConfiguredValidationPipe)
    body: OrderCreateDto,
  ) {
    return tsRestHandler(c.order.createOrder, async () => {
      const { db } = this.drizzleService;

      const createdOrder = await db.transaction(async (tx) => {
        const { items, ...orderBody } = body;
        const [order] = await tx
          .insert(ordersTable)
          .values({
            ...orderBody,
            address: orderBody.address as unknown as InferSelectModel<
              typeof ordersTable
            >['address'],
          })
          .returning();
        if (order.id) {
          const createdItems = await tx
            .insert(orderLinesTable)
            .values(
              items.map((o) => ({
                ...o,
                orderId: order.id,
                ...(o.discount
                  ? {
                      discountType: o.discount.discountType,
                      discountValue: o.discount.discountValue,
                    }
                  : {}),
              })),
            )
            .returning();
          await Promise.all(
            createdItems.map((it) =>
              tx
                .update(productSkusTable)
                .set({
                  stockQty: sql`${productSkusTable.stockQty} - ${it.qty}`,
                })
                .where(eq(productSkusTable.id, it.productSkuId)),
            ),
          );
          return order;
        } else {
          tx.rollback();
        }
      });

      if (!createdOrder) throw new InternalServerErrorException();

      const order = await this.orderService.getOrder(createdOrder.id);

      return { status: 201, body: { status: 'success', data: { order } } };
    });
  }

  @Delete('/orders/:orderId')
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.order.getOrder)
  deleteOrder(@Param('orderId') orderId: string) {
    return tsRestHandler(c.order.deleteOrder, async () => {
      const { db } = this.drizzleService;
      const [order] = await db
        .delete(ordersTable)
        .where(eq(ordersTable.id, orderId))
        .returning();

      return {
        status: 200,
        body: { status: 'success', data: { order } },
      };
    });
  }

  @HttpCode(200)
  @Post('command/bulkDelete')
  @UseGuards(AuthGuard)
  @Roles(ADMIN_ROLES)
  @TsRestHandler(c.order.deleteOrders)
  deleteColors(@Body() { ids }: { ids: string[] }) {
    type FulfilledAllSettled<T> = Exclude<
      PromiseSettledResult<T>,
      { status: 'rejected' }
    >;

    return tsRestHandler(c.order.deleteOrders, async () => {
      const results = (
        await Promise.allSettled(
          ids.map((id) =>
            this.drizzleService.db
              .delete(ordersTable)
              .where(eq(ordersTable.id, id))
              .returning()
              .then(([b]) => b || null),
          ),
        )
      )
        .filter((o) => o.status === 'fulfilled' && o.value !== null)
        .map(
          (o: FulfilledAllSettled<InferSelectModel<typeof ordersTable>>) =>
            o.value,
        );

      return {
        status: 200,
        body: { status: 'success', data: { orders: results } },
      };
    });
  }

  @Get('/me/orders')
  @UseGuards(AuthGuard)
  @TsRestHandler(c.order.getUserOrders)
  getUserOrders(@User() user: UserEntity, @Query() query?: OrderQueryDto) {
    return tsRestHandler(c.order.getUserOrders, async () => {
      const { db } = this.drizzleService;
      const { perPage = LIMIT } = query || {};
      const page = query?.page || 1;

      const orders = await db
        .select({
          ...getTableColumns(ordersTable),
          price: priceFromMinorUnits(ordersTable.priceInCents),
          totalPrice: priceFromMinorUnits(ordersTable.totalPriceInCents),
          totalDiscount: priceFromMinorUnits(ordersTable.totalDiscountInCents),
          formattedTotalPrice: formattedPrice(ordersTable.totalPriceInCents),
          formattedTotalDiscount: formattedPrice(
            ordersTable.totalDiscountInCents,
          ),
          total: sql<number>`COUNT(*) OVER()`.mapWith(Number).as('total'),
        })
        .from(ordersTable)
        .where(eq(ordersTable.userId, user.id))
        .offset((page - 1) * perPage)
        .limit(perPage)
        .orderBy(desc(ordersTable.createdAt));

      return {
        status: 200,
        body: {
          status: 'success',
          data: {
            orders,
            pagination: createPaginationDto({
              page,
              perPage,
              total: orders[0]?.total || 0,
            }),
          },
        },
      };
    });
  }

  @Get('/me/orders/:orderId')
  @UseGuards(AuthGuard)
  @TsRestHandler(c.order.getUserOrder)
  getUserOrder(@User() user: UserEntity, @Param('orderId') orderId: string) {
    return tsRestHandler(c.order.getUserOrder, async () => {
      const order = await this.orderService.getFullUserOrder(orderId, user.id);

      return {
        status: 200,
        body: { status: 'success', data: { order } },
      };
    });
  }
}
