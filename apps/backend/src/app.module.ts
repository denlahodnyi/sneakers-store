import {
  Module,
  type MiddlewareConsumer,
  type NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER /* APP_INTERCEPTOR */ } from '@nestjs/core';

import { AppController } from './app.controller.js';
import { DrizzleModule } from './drizzle/drizzle.module.js';
import { UsersModule } from './users/users.module.js';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter.js';
// import { SuccessResponseInterceptor } from './shared/interceptors/success-response.interceptor.js';
import { CategoriesModule } from './categories/categories.module.js';
import { BrandsModule } from './brands/brands.module.js';
import { ColorsModule } from './colors/colors.module.js';
import { ProductsModule } from './products/products.module.js';
import { SizesModule } from './sizes/sizes.module.js';
import { ProductVariantsModule } from './product-variants/product-variants.module.js';
import { ProductSkusModule } from './product-skus/product-skus.module.js';
import { CatalogModule } from './catalog/catalog.module.js';
import { ProductImagesModule } from './product-images/product-images.module.js';
import { DiscountsModule } from './discounts/discounts.module.js';
import { FavouriteProductsModule } from './favourite-products/favourite-products.module.js';
import { SessionMiddleware } from './auth/session.middleware.js';
import { CartsModule } from './carts/carts.module.js';
import { OrdersModule } from './orders/orders.module.js';

const prodEnvs = ['.env.production.local', '.env.production', '.env'];
const devEnvs = ['.env.development.local', '.env.development', '.env'];
const testEnvs = ['.env.test.local', '.env.test', '.env'];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? prodEnvs
          : process.env.NODE_ENV === 'test'
            ? testEnvs
            : devEnvs,
    }),
    DrizzleModule.forRoot({
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      host: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT!),
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,
      /* eslint-enable @typescript-eslint/no-non-null-assertion */
    }),
    UsersModule,
    CategoriesModule,
    BrandsModule,
    ColorsModule,
    ProductsModule,
    SizesModule,
    ProductVariantsModule,
    ProductSkusModule,
    CatalogModule,
    ProductImagesModule,
    DiscountsModule,
    FavouriteProductsModule,
    CartsModule,
    OrdersModule,
  ],
  exports: [],
  controllers: [AppController],
  providers: [
    {
      // Global exception filter
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // {
    //   // Global interceptor that returns unified success response
    //   provide: APP_INTERCEPTOR,
    //   useClass: SuccessResponseInterceptor,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
