import { Category, CategorySchema } from '@/modules/categories/schemas';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
