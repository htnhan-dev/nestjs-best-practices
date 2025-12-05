import { Injectable, NotFoundException } from '@nestjs/common';
import { Type, TypeDocument } from '@/modules/types/schemas';

import { BaseService } from '@/common/base';
import { TypesRepository } from '@/modules/types/types.repository';
import { UpdateTypeDto } from '@/modules/types/dto';
import { multerFileToMedia } from '@/common/utils';
import removeFile from '@/common/utils/remove-file.util';

@Injectable()
export class TypesService extends BaseService<TypeDocument> {
  constructor(private readonly typesRepository: TypesRepository) {
    super(typesRepository, Type.name);
  }

  async update(
    id: string,
    dto: UpdateTypeDto,
    file?: Express.Multer.File,
  ): Promise<TypeDocument> {
    const type = await this.typesRepository.findById(id);
    if (!type) throw new NotFoundException('Type not found');

    if (file) {
      removeFile(type.image?.url || '');
      dto.image = multerFileToMedia(file, dto.name);
    }

    Object.assign(type, dto);

    await type.save();

    return type;
  }
}
