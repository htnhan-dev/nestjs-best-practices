import { Brand, BrandDocument } from '@/modules/brands/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';

import { BaseService } from '@/common/base';
import { multerFileToMedia } from '@/common/utils';
import removeFile from '@/common/utils/remove-file.util';
import { BrandsRepository } from '@/modules/brands/brands.repository';
import { UpdateBrandDto } from '@/modules/brands/dto';

@Injectable()
export class BrandsService extends BaseService<BrandDocument> {
  constructor(private readonly brandsRepository: BrandsRepository) {
    super(brandsRepository, Brand.name);
  }

  async update(
    id: string,
    dto: UpdateBrandDto,
    file?: Express.Multer.File,
  ): Promise<BrandDocument> {
    const brand = await this.brandsRepository.findById(id);
    if (!brand) throw new NotFoundException('Brand not found');

    if (file) {
      removeFile(brand.image?.url || '');
      dto.image = multerFileToMedia(file);
    }

    Object.assign(brand, dto);

    await brand.save();

    return brand;
  }
}
