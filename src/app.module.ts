import { ConfigModule, ConfigService } from '@nestjs/config';
import { configuration, validateEnv } from './configs';

import { AppController } from './app.controller';
import { AppService } from '@/app.service';
import { BrandsModule } from './modules/brands/brands.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './modules/products/products.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { SharedModule } from './shared/shared.module';
import { TypesModule } from './modules/types/types.module';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'storage'),
      serveRoot: '/storage',
      exclude: ['/api'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public', 'docs'),
      serveRoot: '/docs',
      serveStaticOptions: { index: 'stoplight.html' },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api', '/docs', '/storage'],
    }),

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
    CategoriesModule,
    TypesModule,
    BrandsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
