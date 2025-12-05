import { Brand, BrandSchema } from '@/modules/brands/schemas';
import { Category, CategorySchema } from '@/modules/categories/schemas';
import { Type, TypeSchema } from '@/modules/types/schemas';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Type.name, schema: TypeSchema },
      { name: Brand.name, schema: BrandSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
