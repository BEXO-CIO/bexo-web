import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const cookieParserFn = (cookieParser as any).default || cookieParser;
  app.use(cookieParserFn());
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();
