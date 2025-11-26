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
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppLoggerService,
    LoggingInterceptor,
    TimeoutInterceptor,
    ResponseTransformInterceptor,
  ],
})
export class AppModule {}
