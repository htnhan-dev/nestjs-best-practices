import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Image } from '@/shared/interfaces';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Writing' })
  @IsString()
  readonly name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Description of Writing', required: false })
  readonly description?: string;

  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  image?: Image;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  readonly active?: boolean;

  @IsString()
  @IsOptional()
  slug?: string;
}
