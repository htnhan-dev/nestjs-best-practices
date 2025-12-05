import { Image, ImageSchema } from '@/shared/schemas/image.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export type TypeDocument = Type & Document;

@Schema({ timestamps: true })
export class Type {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: ImageSchema, _id: false })
  image?: Image;

  @Prop({ default: true })
  active: boolean;
}

export const TypeSchema = SchemaFactory.createForClass(Type);
