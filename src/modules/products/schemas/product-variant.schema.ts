import { Schema } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class ProductVariant {
  sku: string;

  skuName: string;

  barcode?: string;
}
