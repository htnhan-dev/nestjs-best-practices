import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration, validateEnv } from './config';

import { AppService } from '@/app.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { ProductsModule } from './modules/products/products.module';
import { SharedModule } from './shared/modules/shared.module';

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
    SharedModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
