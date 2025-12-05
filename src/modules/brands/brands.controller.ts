import { Brand, BrandDocument } from '@/modules/brands/schemas';

import { BaseController, BaseResponse } from '@/common/base';
import { ApiEndpoint } from '@/common/decorators';
import { OptimizedMediaInterceptor } from '@/common/interceptors';
import { multerFileToMedia, slugify } from '@/common/utils';
import { multerConfig } from '@/configs/multer.config';
import {
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
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto';

@Controller('brands')
@ApiTags('Brands')
export class BrandsController extends BaseController<BrandDocument> {
  constructor(private readonly brandsService: BrandsService) {
    super(brandsService, Brand.name);
  }

  @Post()
  @ApiEndpoint({
    title: 'Create',
    success: 'Brand created successfully',
    method: 'POST',
    consumesMultipart: true,
  })
  @UseInterceptors(
    FileInterceptor('image', multerConfig('storage/brands')),
    OptimizedMediaInterceptor,
  )
  async create(
    @Body() dto: CreateBrandDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BaseResponse<BrandDocument> | null> {
    dto.slug = slugify(dto.name);
    if (file) dto.image = multerFileToMedia(file);

    return super._create(dto);
  }

  @Put(':id')
  @ApiEndpoint({
    title: 'Update',
    success: 'Brand updated successfully',
    method: 'PUT',
    consumesMultipart: true,
  })
  @UseInterceptors(
    FileInterceptor('image', multerConfig('storage/brands')),
    OptimizedMediaInterceptor,
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BaseResponse<BrandDocument>> {
    dto.slug = slugify(dto.name || '');

    const result = await this.brandsService.update(id, dto, file);

    return this.ok(result, 'Brand updated successfully');
  }
}
