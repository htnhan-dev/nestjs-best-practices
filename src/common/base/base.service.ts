import type { BaseRepository, PaginatedResult } from './base.repository';

import type { PaginationQueryDto } from '@/common/dto';
import { NotFoundException } from '@nestjs/common';

export abstract class BaseService<TEntity> {
  protected constructor(
    protected readonly repository: BaseRepository<TEntity>,
    private readonly entityName: string,
  ) {}

  // - Helper methods for derived services to use
  protected cleanUpdate<T>(dto: T): Partial<T> {
    const cleaned: Partial<T> = {};

    for (const key in dto) {
      if (!Object.prototype.hasOwnProperty.call(dto, key)) continue;

      const value = dto[key];

      if (value === undefined) continue;
      if (value === null) continue;
      if (value === '') continue;

      cleaned[key] = value;
    }

    return cleaned;
  }

  async _create<T>(dto: T): Promise<TEntity> {
    return this.repository.create(dto);
  }

  async _find(
    pagination?: PaginationQueryDto,
  ): Promise<PaginatedResult<TEntity>> {
    return this.repository.find(pagination);
  }

  async _findOne(id: string): Promise<TEntity> {
    const entity = await this.repository.findById(id);

    if (!entity) {
      throw new NotFoundException(`${this.entityName} with id ${id} not found`);
    }

    return entity;
  }

  async _update<T>(id: string, dto: T): Promise<TEntity> {
    const entity = await this.repository.update(id, dto);

    if (!entity) {
      throw new NotFoundException(`${this.entityName} with id ${id} not found`);
    }

    return entity;
  }

  async _remove(id: string): Promise<{ id: string }> {
    const removed = await this.repository.remove(id);

    if (!removed) {
      throw new NotFoundException(`${this.entityName} with id ${id} not found`);
    }

    return { id };
  }
}
