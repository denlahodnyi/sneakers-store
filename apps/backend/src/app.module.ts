import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { DrizzleModule } from './drizzle/drizzle.module';

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
  ],
  exports: [],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
