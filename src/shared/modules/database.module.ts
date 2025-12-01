import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Global() // - Makes the module global, so its exports are available everywhere
@Module({
  imports: [
    MongooseModule.forFeature([]),
  ],
  exports: [MongooseModule]
})
export class DatabaseModule {}
