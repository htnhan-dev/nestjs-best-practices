import type { PaginationQueryDto } from '../dto/pagination-query.dto';

export interface PaginatedResult<TEntity> {
  items: TEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface BaseRepository<TEntity> {
  create<T extends Record<string, unknown>>(dto: T): Promise<TEntity>;
  find(pagination?: PaginationQueryDto): Promise<PaginatedResult<TEntity>>;
  findById(id: string): Promise<TEntity | null>;
  update<T extends Record<string, unknown>>(
    id: string,
    dto: T,
  ): Promise<TEntity | null>;
  remove(id: string): Promise<boolean>;
}
