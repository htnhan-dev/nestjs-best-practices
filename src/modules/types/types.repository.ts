import { MongooseRepository } from '@/common/base';
import { Type, TypeDocument } from '@/modules/types/schemas';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class TypesRepository extends MongooseRepository<TypeDocument> {
  constructor(@InjectModel(Type.name) typeModel: Model<TypeDocument>) {
    super(typeModel);
  }
}
