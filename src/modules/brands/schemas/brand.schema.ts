import { Image, ImageSchema } from '@/shared/schemas';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema({ timestamps: true })
export class Brand {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ type: ImageSchema, default: null })
  image?: Image;

  @Prop({ default: true })
  active: boolean;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
