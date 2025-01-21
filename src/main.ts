import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { initializeSwagger } from 'src/utils/swagger';
import { GlobalExceptionFilter } from 'src/common/filters/global-exception.filter';
import { json, urlencoded } from 'express';
import { GlobalResponseInterceptor } from 'src/common/interceptors/global-response.interceptor';

const swaggerPath = process.env.SWAGGER_PATH || 'api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const httpAdapter = app.get(HttpAdapterHost);

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  app.enableCors(); // Enable CORS

  app.useGlobalInterceptors(new GlobalResponseInterceptor());

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter));

  app.useGlobalPipes(new ValidationPipe({}));

  initializeSwagger(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(
    `Swagger UI is running at http://localhost:${port}/${swaggerPath}`,
  );
}
bootstrap();
