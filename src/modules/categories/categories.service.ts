import { Category, CategoryDocument } from '@/modules/categories/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';

import { BaseService } from '@/common/base';
import { multerFileToMedia } from '@/common/utils';
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
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    if (file) {
      removeFile(category.image?.url || '');
      dto.image = multerFileToMedia(file);
    } else {
      delete dto.image;
    }

    const cleanData = super.cleanUpdate(dto);

    Object.assign(category, cleanData);

    await category.save();

    return category;
  }
}
