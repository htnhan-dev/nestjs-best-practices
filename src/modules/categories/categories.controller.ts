import { Category, CategoryDocument } from '@/modules/categories/schemas';

import { BaseController, BaseResponse } from '@/common/base';
import { ApiEndpoint } from '@/common/decorators';
import { OptimizedMediaInterceptor } from '@/common/interceptors';
import { multerFileToMedia, slugify } from '@/common/utils';
import { multerConfig } from '@/configs/multer.config';
import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Controller('categories')
@ApiTags('Categories')
export class CategoriesController extends BaseController<CategoryDocument> {
  constructor(private readonly categoryService: CategoriesService) {
    super(categoryService, Category.name);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', multerConfig('storage/categories')),
    OptimizedMediaInterceptor,
  )
  @ApiEndpoint({
    title: 'Create',
    success: 'Category created successfully',
    method: 'POST',
    consumesMultipart: true,
  })
  async create(
    @Body() dto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BaseResponse<CategoryDocument> | null> {
    dto.slug = slugify(dto.name);
    console.log('file : ', file);

    if (file) {
      dto.image = multerFileToMedia(file);
    } else {
      delete dto.image;
    }

    dto.slug = slugify(dto.name);
    return super._create(dto);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', multerConfig('storage/categories')),
    OptimizedMediaInterceptor,
  )
  @ApiEndpoint({
    title: 'Update',
    success: 'Category updated successfully',
    method: 'PUT',
    consumesMultipart: true,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BaseResponse<CategoryDocument>> {
    if (!dto || typeof dto !== 'object' || Object.keys(dto).length === 0) {
      throw new BadRequestException('Update data must be provided');
    }

    dto.slug = slugify(dto.name || '');

    const result = await this.categoryService.update(id, dto, file);

    return this.ok(result, 'Category updated successfully');
  }
}
