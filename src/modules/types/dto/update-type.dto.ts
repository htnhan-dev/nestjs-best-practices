import { IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { CreateTypeDto } from '@/modules/types/dto/create-type.dto';

export class UpdateTypeDto extends CreateTypeDto {
  @ApiProperty({ example: 'Shoe', required: false })
  @IsString()
  @IsOptional()
  declare readonly name: string;
}
