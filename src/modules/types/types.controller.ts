import { Type, TypeDocument } from '@/modules/types/schemas';

import { BaseController, BaseResponse } from '@/common/base';
import { ApiEndpoint } from '@/common/decorators';
import { OptimizedMediaInterceptor } from '@/common/interceptors';
import { multerFileToMedia } from '@/common/utils';
import { multerConfig } from '@/configs/multer.config';
import { CreateTypeDto, UpdateTypeDto } from '@/modules/types/dto';
import {
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
    @Body() body: UpdateTypeDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BaseResponse<TypeDocument>> {
    if (file) {
      body.image = multerFileToMedia(file, body.name);
    }
    const result = await this.typesService.update(id, body, file);
    return this.ok(result, 'Type updated successfully');
  }
}
