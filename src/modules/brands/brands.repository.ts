import { MongooseRepository } from '@/common/base';
import { Brand, BrandDocument } from '@/modules/brands/schemas';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BrandsRepository extends MongooseRepository<BrandDocument> {
  constructor(@InjectModel(Brand.name) brandModel: Model<BrandDocument>) {
    super(brandModel);
  }
}
