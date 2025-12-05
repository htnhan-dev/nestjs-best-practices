import { IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { CreateBrandDto } from './create-brand.dto';

export class UpdateBrandDto extends CreateBrandDto {
  @ApiProperty({ example: 'Adidas', required: false })
  @IsString()
  @IsOptional()
  declare readonly name: string;
}
