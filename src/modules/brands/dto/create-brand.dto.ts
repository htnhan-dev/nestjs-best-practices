import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Image } from '@/shared/interfaces';

export class CreateBrandDto {
  @ApiProperty({ example: 'Adidas' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'Sports brand', required: false })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  image?: Image;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  readonly active?: boolean;

  @IsOptional()
  slug?: string;
}
