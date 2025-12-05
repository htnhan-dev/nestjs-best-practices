import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  nickname: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Type', default: null })
  typeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Brand', default: null })
  brandId: Types.ObjectId;

  @Prop()
  bodyHtml?: string;

  @Prop()
  description?: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  variants: Array<{
    sku: string;
    price: number;
    stock: number;
    attributes: Record<string, unknown>;
  }>;

  @Prop({ default: true })
  active: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
