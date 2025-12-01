import type { BaseService } from './base.service';
import { BaseResponse, PaginationMeta } from '@/common/base';
import { PaginationQueryDto } from '@/common/dto';
import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

export abstract class BaseController<TEntity> {
  protected constructor(
    protected readonly service: BaseService<TEntity>,
    private readonly resourceName: string,
  ) {}

  // Helper methods (ok/fail)
  protected ok<T>(data: T, message?: string): BaseResponse<T> {
    return BaseResponse.ok(data, message);
  }

  protected okWithMeta<T>(
    data: T,
    meta: PaginationMeta,
    message?: string,
  ): BaseResponse<T> {
    return BaseResponse.okWithMeta(data, meta, message);
  }

  protected fail<T>(message: string): BaseResponse<T> {
    return BaseResponse.fail<T>(message);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async _create<T>(@Body() dto: T): Promise<BaseResponse<TEntity>> {
    const entity = await this.service.create(dto);
    return this.ok(entity, `${this.resourceName} created successfully`);
  }

  @Get()
  async _find(
    @Query() query: PaginationQueryDto,
  ): Promise<BaseResponse<TEntity[]>> {
    const result = await this.service.find(query);
    const meta: PaginationMeta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    };
    return this.okWithMeta(
      result.items,
      meta,
      `Data ${this.resourceName} retrieved successfully`,
    );
  }

  @Get(':id')
  async _findOne(@Param('id') id: string): Promise<BaseResponse<TEntity>> {
    const entity = await this.service.findOne(id);
    return this.ok(entity, `${this.resourceName} retrieved successfully`);
  }

  @Patch(':id')
  async _update<T>(
    @Param('id') id: string,
    @Body() dto: T,
  ): Promise<BaseResponse<TEntity>> {
    const entity = await this.service.update(id, dto);
    return this.ok(entity, `${this.resourceName} updated successfully`);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async _remove(
    @Param('id') id: string,
  ): Promise<BaseResponse<{ id: string }>> {
    const result = await this.service.remove(id);
    return this.ok(result, `${this.resourceName} removed successfully`);
  }
}
