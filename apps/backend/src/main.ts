import { NestFactory } from '@nestjs/core';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser(), morgan('dev'));
  // app.enableCors({ origin: [/\.localhost:300[1,2]$/], credentials: true });
  app.enableCors({ origin: true });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
