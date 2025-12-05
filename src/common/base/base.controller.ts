import { BaseResponse, PaginationMeta } from '@/common/base';
import { ApiEndpoint } from '@/common/decorators';
import { PaginationQueryDto } from '@/common/dto';
import {
  BadRequestException,
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
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import type { BaseService } from './base.service';

export abstract class BaseController<TEntity> {
  protected constructor(
    protected readonly service: BaseService<TEntity>,
    private readonly resourceName: string = 'Entity',
  ) {}

  // - Helper methods for derived services to use
  protected cleanData<T>(dto: T): Partial<T> {
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
  @ApiExcludeEndpoint()
  async _create<T>(@Body() dto: T): Promise<BaseResponse<TEntity>> {
    const entity = await this.service._create(dto);
    return this.ok(entity, `${this.resourceName} created successfully`);
  }

  @Get()
  @ApiEndpoint({
    title: `Find`,
    success: `List of entities`,
    method: 'GET',
    query: {
      page: { required: false, default: 1, example: 1 },
      limit: { required: false, default: 10, example: 10 },
    },
  })
  async _find(
    @Query() query?: PaginationQueryDto,
  ): Promise<BaseResponse<TEntity[]>> {
    const safeQuery = query ?? { page: 1, limit: 20 };

    const result = await this.service._find(safeQuery);

    const meta: PaginationMeta = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
    };

    return this.okWithMeta(
      result.items,
      meta,
      `Data ${this.resourceName} retrieved successfully`,
    );
  }

  @Get(':id')
  @ApiEndpoint({
    title: 'Find One',
    success: 'Entity retrieved successfully',
    method: 'GET',
  })
  async _findOne(@Param('id') id: string): Promise<BaseResponse<TEntity>> {
    const entity = await this.service._findOne(id);
    return this.ok(entity, `${this.resourceName} retrieved successfully`);
  }

  @Patch(':id')
  @ApiExcludeEndpoint()
  async _update<T>(
    @Param('id') id: string,
    @Body() dto: T,
  ): Promise<BaseResponse<TEntity>> {
    // Validate that update data is provided
    if (!dto || typeof dto !== 'object' || Object.keys(dto).length === 0) {
      throw new BadRequestException('Update data must be provided');
    }

    const entity = await this.service._update(id, dto);
    return this.ok(entity, `${this.resourceName} updated successfully`);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiEndpoint({
    title: 'Remove',
    success: 'Entity removed successfully',
    method: 'DELETE',
  })
  async _remove(
    @Param('id') id: string,
  ): Promise<BaseResponse<{ id: string }>> {
    const result = await this.service._remove(id);
    return this.ok(result, `${this.resourceName} removed successfully`);
  }
}
