import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Image } from '@/shared/schemas/image.schema';
import { Type as TransformType } from 'class-transformer';

export class CreateTypeDto {
  @ApiProperty({ example: 'Shoe' })
  @IsString()
  readonly name: string;

  @ApiProperty({ example: 'Description of Shoe', required: false })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ValidateNested()
  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @TransformType(() => Image)
  image?: Image;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  readonly active?: boolean;
}
