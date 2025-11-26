import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import {
  LoggingInterceptor,
  ResponseTransformInterceptor,
  TimeoutInterceptor,
} from '@/common/interceptors';

import { AppLoggerService } from '@/common/logger';
import { AppModule } from './app.module';
import { HttpExceptionsFilter } from '@/common/filters';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new Logger('Bootstrap');

  app.enableCors({ origin: true, credentials: true });

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

  const loggingInterceptor = app.get<LoggingInterceptor>(LoggingInterceptor);
  const timeoutInterceptor = app.get<TimeoutInterceptor>(TimeoutInterceptor);
  const responseTransformInterceptor = app.get<ResponseTransformInterceptor>(
    ResponseTransformInterceptor,
  );

  app.useGlobalInterceptors(
    loggingInterceptor,
    timeoutInterceptor,
    responseTransformInterceptor,
  );

  app.useGlobalFilters(new HttpExceptionsFilter(httpAdapterHost, appLogger));

  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port);
  logger.log(`🌠 Application is running on port: ${port}`);
}

void bootstrap();
