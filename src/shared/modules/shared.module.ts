import { Global, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database.module';
import { AppLoggerService } from '../../common/logger';
import {
  LoggingInterceptor,
  ResponseTransformInterceptor,
  TimeoutInterceptor,
} from '../../common/interceptors';

@Global() // - Makes the module global, so its exports are available everywhere
@Module({
  imports: [
    DatabaseModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 10 }],
    }),
  ],
  providers: [
    AppLoggerService,
    LoggingInterceptor,
    TimeoutInterceptor,
    ResponseTransformInterceptor,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
  ],
  exports: [DatabaseModule, AppLoggerService],
})
export class SharedModule {}
