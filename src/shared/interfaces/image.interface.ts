export interface Image {
  _id?: string | null;
  url: string;
  alt: string;
  filename: string;
  position?: number;
  isFeatured?: boolean;
  productId?: string;
  variantId?: string;
}
