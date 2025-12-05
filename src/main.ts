import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mkdirSync, writeFileSync } from 'fs';

import { HttpExceptionsFilter } from '@/common/filters';
import { AppLoggerService } from '@/common/logger';
import { requestIdMiddleware } from '@/common/middlewares';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new Logger('Bootstrap');

  app.enableCors({ origin: true, credentials: true });

  // Add a request id on every request to help correlate logs
  app.use(requestIdMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: false,
      validateCustomDecorators: true,
    }),
  );

  const appLogger = app.get<AppLoggerService>(AppLoggerService);
  app.useLogger(appLogger);

  const httpAdapterHost = app.get<HttpAdapterHost>(HttpAdapterHost);

  // Interceptors are registered globally via APP_INTERCEPTOR in SharedModule
  // to avoid double-registration we don't call app.useGlobalInterceptors here.

  app.useGlobalFilters(new HttpExceptionsFilter(httpAdapterHost, appLogger));

  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Unified CRM API')
    .setDescription(
      `
###  Welcome to the API Docs
Here is an overview of how the API works:

- Authentication: Bearer token
- Pagination: page, limit
- Errors: 400 | 404 | 409 | 500
  `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'authorization',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Generate openapi.json for external UI (Stoplight Elements)
  try {
    // ensure public/docs exists
    mkdirSync(join(process.cwd(), 'public', 'docs'), { recursive: true });
    writeFileSync(
      join(process.cwd(), 'public', 'docs', 'openapi.json'),
      JSON.stringify(document, null, 2),
    );
  } catch (err) {
    console.warn('Failed to write openapi.json:', err);
  }

  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);
  logger.log(`🌠 Application is running at: ${host}:${port}`);
}

void bootstrap();
