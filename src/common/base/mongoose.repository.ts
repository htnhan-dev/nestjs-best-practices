import type { BaseRepository, PaginatedResult } from '@/common/base';
import type { Model, UpdateQuery } from 'mongoose';

import type { PaginationQueryDto } from '@/common/dto';

export class MongooseRepository<TEntity> implements BaseRepository<TEntity> {
  constructor(private readonly model: Model<TEntity>) {}

  async create<T>(dto: T): Promise<TEntity> {
    const document = await this.model.create(dto as unknown as TEntity);
    return document as TEntity;
  }

  async find(
    pagination?: PaginationQueryDto,
  ): Promise<PaginatedResult<TEntity>> {
    const page = Number(pagination?.page ?? 1);
    const limit = Number(pagination?.limit ?? 25);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.model.find().skip(skip).limit(limit).lean().exec(),
      this.model.countDocuments().exec(),
    ]);

    return {
      items: items as unknown as TEntity[],
      total,
      page,
      limit,
    };
  }

  async findById(id: string): Promise<TEntity | null> {
    const document = await this.model.findById(id).lean().exec();
    return (document as unknown as TEntity) ?? null;
  }

  async update<T>(id: string, dto: T): Promise<TEntity | null> {
    const updated = await this.model
      .findByIdAndUpdate(id, dto as unknown as UpdateQuery<TEntity>, {
        new: true,
        runValidators: true,
        lean: true,
      })
      .exec();

    return (updated as unknown as TEntity) ?? null;
  }

  async remove(id: string): Promise<boolean> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    return Boolean(deleted);
  }
}
