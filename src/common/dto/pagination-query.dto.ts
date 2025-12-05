import { IsNumber, IsOptional } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @IsOptional()
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsNumber()
  page: number;

  @IsOptional()
  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsNumber()
  limit: number;
}
