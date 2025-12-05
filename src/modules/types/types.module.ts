import { Module } from '@nestjs/common';
import { TypesController } from './types.controller';
import { TypesRepository } from '@/modules/types/types.repository';
import { TypesService } from './types.service';

@Module({
  controllers: [TypesController],
  providers: [TypesService, TypesRepository],
})
export class TypesModule {}
