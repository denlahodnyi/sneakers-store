import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  contract as c,
  CartSyncBodyDto,
  CartGenBodyDto,
  CartItemCreateDto,
  CartItemUpdateDto,
} from '@sneakers-store/contracts';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { eq, getTableColumns } from 'drizzle-orm';
import { differenceBy, intersectionBy } from 'lodash-es';

import { AuthGuard } from '../auth/auth.guard.js';
import { UserEntity } from '../db/schemas/user.schema.js';
import { User } from '../auth/user.decorator.js';
import { DrizzleService } from '../drizzle/drizzle.service.js';
import { cartItemsTable, cartsTable } from '../db/schemas/cart.schema.js';
import { CartsService } from './carts.service.js';
import { ConfiguredValidationPipe } from '../shared/pipes/configured-validation.pipe.js';
import { productSkusTable } from '../db/schemas/product.schema.js';

@Controller('carts')
export class CartsController {
  constructor(
    private drizzleService: DrizzleService,
    private cartsService: CartsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @TsRestHandler(c.cart.createCart)
  createCart(@User() user: UserEntity) {
    return tsRestHandler(c.cart.createCart, async () => {
      const [cart] = await this.drizzleService.db
        .insert(cartsTable)
        .values({ userId: user.id })
        .returning();
      return {
        status: 201,
        body: { status: 'success', data: { cart: { id: cart.id } } },
      };
    });
  }

  @Delete()
  @UseGuards(AuthGuard)
  @TsRestHandler(c.cart.deleteCart)
  deleteCart(@Param('cartId') cartId: string) {
    return tsRestHandler(c.cart.deleteCart, async () => {
      const [cart] = await this.drizzleService.db
        .delete(cartsTable)
        .where(eq(cartsTable.id, cartId))
        .returning();
      return {
        status: 200,
        body: { status: 'success', data: { cart: { id: cart.id } } },
      };
    });
  }

  @Get()
  @UseGuards(AuthGuard)
  @TsRestHandler(c.cart.getUserCart)
  getCart(@User() user: UserEntity) {
    return tsRestHandler(c.cart.getUserCart, async () => {
      const cart = await this.cartsService.getFullUserCart(user.id);

      return {
        status: 200,
        body: {
          status: 'success',
          data: { cart },
        },
      };
    });
  }

  @Post(':cartId/command/sync')
  @UseGuards(AuthGuard)
  @TsRestHandler(c.cart.syncCart)
  syncCarts(
    @User() user: UserEntity,
    @Param('cartId') cartId: string,
    @Body(ConfiguredValidationPipe) cartSyncDto: CartSyncBodyDto,
  ) {
    return tsRestHandler(c.cart.syncCart, async () => {
      const { db } = this.drizzleService;
      const receivedItems = cartSyncDto.items.filter(
        (o) => o.productSkuId && o.qty > 0,
      );

      if (!receivedItems.length) {
        const cart = await this.cartsService.getFullUserCart(user.id);
        return {
          status: 200,
          body: {
            status: 'success',
            data: { cart },
          },
        };
      }

      const userCartItems = await db
        .select()
        .from(cartItemsTable)
        .where(eq(cartItemsTable.cartId, cartId));

      const userCartItemsMap = new Map(
        userCartItems.map((o) => [o.productSkuId, o]),
      );
      // Find items from local cart that don't presence db
      const itemsToAdd = differenceBy(
        receivedItems,
        userCartItems,
        'productSkuId',
      );
      // Find intersected items - the will be replaced
      const itemsToReplace = intersectionBy(
        receivedItems,
        userCartItems,
        'productSkuId',
      );

      await db.transaction(async (tx) => {
        if (itemsToAdd.length) {
          await tx
            .insert(cartItemsTable)
            .values(itemsToAdd.map((o) => ({ ...o, cartId })));
        }
        if (itemsToReplace.length) {
          for (const item of itemsToReplace) {
            const replaceableItem = userCartItemsMap.get(item.productSkuId);
            if (replaceableItem && item.qty !== replaceableItem.qty) {
              await tx
                .update(cartItemsTable)
                .set({ qty: item.qty })
                .where(eq(cartItemsTable.id, replaceableItem.id));
            }
          }
        }
      });

      const cart = await this.cartsService.getFullUserCart(user.id);
      return {
        status: 200,
        body: {
          status: 'success',
          data: { cart },
        },
      };
    });
  }

  @Post('/command/generate')
  @TsRestHandler(c.cart.generateCart)
  generateCart(@Body(ConfiguredValidationPipe) genCartDto: CartGenBodyDto) {
    return tsRestHandler(c.cart.generateCart, async () => {
      const cart = await this.cartsService.getCartFromItems(genCartDto.items);
      return { status: 200, body: { status: 'success', data: { cart } } };
    });
  }

  @Post(':cartId/items')
  @UseGuards(AuthGuard)
  @TsRestHandler(c.cart.createCartItem)
  createCartItem(
    @User() user: UserEntity,
    @Param('cartId') cartId: string,
    @Body(ConfiguredValidationPipe) createCartItemDto: CartItemCreateDto,
  ) {
    return tsRestHandler(c.cart.createCartItem, async () => {
      const { db } = this.drizzleService;

      if (createCartItemDto.qty) {
        const [{ stockQty }] = await db
          .select({ stockQty: getTableColumns(productSkusTable).stockQty })
          .from(productSkusTable)
          .where(eq(productSkusTable.id, createCartItemDto.productSkuId));

        if (createCartItemDto.qty > stockQty) {
          throw new BadRequestException(
            'Selected quantity exceeds quantity in stock',
          );
        }
      }

      await db.insert(cartItemsTable).values({
        productSkuId: createCartItemDto.productSkuId,
        qty: createCartItemDto.qty,
        cartId,
      });
      const cart = await this.cartsService.getFullUserCart(user.id);

      return {
        status: 201,
        body: {
          status: 'success',
          data: { cart },
        },
      };
    });
  }

  @Patch(':cartId/items/:cartItemId')
  @UseGuards(AuthGuard)
  @TsRestHandler(c.cart.updateCartItem)
  updateCartItem(
    @User() user: UserEntity,
    @Param('cartItemId') cartItemId: string,
    @Body(ConfiguredValidationPipe) updateCartItemDto: CartItemUpdateDto,
  ) {
    return tsRestHandler(c.cart.updateCartItem, async () => {
      const { db } = this.drizzleService;

      const [cartItem] = await db
        .select()
        .from(cartItemsTable)
        .where(eq(cartItemsTable.id, cartItemId));

      if (updateCartItemDto.qty) {
        const [{ stockQty }] = await db
          .select({ stockQty: getTableColumns(productSkusTable).stockQty })
          .from(productSkusTable)
          .where(
            eq(
              productSkusTable.id,
              updateCartItemDto.productSkuId || cartItem.productSkuId,
            ),
          );

        if (updateCartItemDto.qty > stockQty) {
          throw new BadRequestException(
            'Selected quantity exceeds quantity in stock',
          );
        }
      }

      await db
        .update(cartItemsTable)
        .set({ qty: updateCartItemDto.qty })
        .where(eq(cartItemsTable.id, cartItemId));
      const cart = await this.cartsService.getFullUserCart(user.id);

      return {
        status: 200,
        body: {
          status: 'success',
          data: { cart },
        },
      };
    });
  }

  @Delete(':cartId/items/:cartItemId')
  @UseGuards(AuthGuard)
  @TsRestHandler(c.cart.deleteCartItem)
  deleteCartItem(
    @User() user: UserEntity,
    @Param('cartItemId') cartItemId: string,
  ) {
    return tsRestHandler(c.cart.deleteCartItem, async () => {
      const { db } = this.drizzleService;
      await db.delete(cartItemsTable).where(eq(cartItemsTable.id, cartItemId));
      const cart = await this.cartsService.getFullUserCart(user.id);
      return {
        status: 200,
        body: {
          status: 'success',
          data: { cart },
        },
      };
    });
  }

  @Delete(':cartId/items/command/deleteAll')
  @UseGuards(AuthGuard)
  @TsRestHandler(c.cart.deleteAllCartItems)
  deleteAllCartItems(@Param('cartId') cartId: string) {
    return tsRestHandler(c.cart.deleteAllCartItems, async () => {
      const { db } = this.drizzleService;
      await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cartId));
      return {
        status: 200,
        body: {
          status: 'success',
          data: { cart: { id: cartId } },
        },
      };
    });
  }
}
