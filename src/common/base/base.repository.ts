import type { PaginationQueryDto } from '../dto/pagination-query.dto';

export interface PaginatedResult<TEntity> {
  items: TEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface BaseRepository<TEntity> {
  create<T>(dto: T): Promise<TEntity>;
  find(pagination?: PaginationQueryDto): Promise<PaginatedResult<TEntity>>;
  findById(id: string): Promise<TEntity | null>;
  update<T>(id: string, dto: T): Promise<TEntity | null>;
  remove(id: string): Promise<boolean>;
}
