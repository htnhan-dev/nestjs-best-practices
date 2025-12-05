import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { ToBoolean } from '@/common/decorators';
import { Image } from '@/shared/schemas/image.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTypeDto {
  @ApiProperty({ example: 'Writing' })
  @IsString()
  readonly name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Description of Writing', required: false })
  readonly description?: string;

  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  image?: Image | null;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  @ToBoolean()
  readonly active?: boolean;

  @IsString()
  @IsOptional()
  slug?: string;
}
