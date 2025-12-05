import { Type, TypeDocument } from '@/modules/types/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';

import { BaseService } from '@/common/base';
import removeFile from '@/common/utils/remove-file.util';
import { UpdateTypeDto } from '@/modules/types/dto';
import { TypesRepository } from '@/modules/types/types.repository';

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
    const type = await this.typesRepository.update(id, dto);

    if (!type) throw new NotFoundException('Type not found');

    if (file) {
      removeFile(type.image?.url || '');
    }

    return type;
  }
}
