import { IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends CreateCategoryDto {
  @ApiProperty({ example: 'Writing', required: false })
  @IsString()
  @IsOptional()
  declare readonly name: string;
}
