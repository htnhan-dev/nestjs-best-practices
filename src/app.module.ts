import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  LoggingInterceptor,
  ResponseTransformInterceptor,
  TimeoutInterceptor,
} from '@/common/interceptors';
import { configuration, validateEnv } from './config';

import { AppController } from './app.controller';
import { AppLoggerService } from '@/common/logger';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { ProductsModule } from '@/modules/products/products.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('database.url'),
      }),
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    ProductsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppLoggerService,
    LoggingInterceptor,
    TimeoutInterceptor,
    ResponseTransformInterceptor,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
