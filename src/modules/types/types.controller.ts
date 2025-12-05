import { Type, TypeDocument } from '@/modules/types/schemas';

import { BaseController, BaseResponse } from '@/common/base';
import { ApiEndpoint } from '@/common/decorators';
import { OptimizedMediaInterceptor } from '@/common/interceptors';
import { multerFileToMedia, slugify } from '@/common/utils';
import { multerConfig } from '@/configs/multer.config';
import { CreateTypeDto, UpdateTypeDto } from '@/modules/types/dto';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { TypesService } from './types.service';

@Controller('types')
@ApiTags('Types')
export class TypesController extends BaseController<TypeDocument> {
  constructor(private readonly typesService: TypesService) {
    super(typesService, Type.name);
  }

  @Post()
  @ApiEndpoint({
    title: 'Create',
    success: 'Type created successfully',
    method: 'POST',
    consumesMultipart: true,
  })
  @HttpCode(201)
  @UseInterceptors(
    FileInterceptor('image', multerConfig('storage/types')),
    OptimizedMediaInterceptor,
  )
  async create(
    @Body() body: CreateTypeDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BaseResponse<TypeDocument>> {
    if (file) {
      body.image = multerFileToMedia(file, body.name);
    }
    return super._create(body);
  }

  @Put(':id')
  @ApiEndpoint({
    title: 'Update',
    success: 'Type updated successfully',
    method: 'PUT',
    consumesMultipart: true,
  })
  @UseInterceptors(
    FileInterceptor('image', multerConfig('storage/types')),
    OptimizedMediaInterceptor,
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTypeDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BaseResponse<TypeDocument>> {
    if (!dto || typeof dto !== 'object' || Object.keys(dto).length === 0) {
      throw new BadRequestException('Update data must be provided');
    }

    if (!dto.image && !file) {
      dto.image = null;
    }

    if (file) {
      dto.image = multerFileToMedia(file, dto.name);
    }

    dto.slug = slugify(dto.name || '');

    const data = super.cleanData(dto) as UpdateTypeDto;

    const result = await this.typesService.update(id, data, file);

    return this.ok(result, 'Type updated successfully');
  }
}
