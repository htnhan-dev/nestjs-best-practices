import { CategoriesController } from './categories.controller';
import { CategoriesRepository } from '@/modules/categories/categories.repository';
import { CategoriesService } from './categories.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository],
})
export class CategoriesModule {}
