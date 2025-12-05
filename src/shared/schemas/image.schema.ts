import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: false, _id: false })
export class Image {
  @Prop({ default: null })
  _id?: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  alt: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ default: 0 })
  position?: number;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
