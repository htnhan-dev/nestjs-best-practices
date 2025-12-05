import { Category, CategoryDocument } from '@/modules/categories/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';

import { BaseService } from '@/common/base';
import removeFile from '@/common/utils/remove-file.util';
import { CategoriesRepository } from '@/modules/categories/categories.repository';
import { UpdateCategoryDto } from '@/modules/categories/dto';

@Injectable()
export class CategoriesService extends BaseService<CategoryDocument> {
  constructor(private readonly categoryRepository: CategoriesRepository) {
    super(categoryRepository, Category.name);
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    file?: Express.Multer.File,
  ): Promise<CategoryDocument> {
    const category = await this.categoryRepository.update(id, dto);

    if (!category) throw new NotFoundException('Category not found');

    if (file) {
      removeFile(category.image?.url || '');
    }

    return category;
  }
}
