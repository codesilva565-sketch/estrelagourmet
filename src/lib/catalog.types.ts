export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  display_order: number;
};

export type ProductImage = {
  id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
};

export type ProductVariation = {
  id: string;
  name: string;
  price: number | null;
  is_available: boolean;
  display_order: number;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: number | null;
  features: string[];
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
  product_images: ProductImage[];
  product_variations: ProductVariation[];
};

export type SiteSettings = {
  business_name: string;
  whatsapp_number: string;
  instagram_url: string;
  contact_info: string;
  order_info: string;
  logo_url: string | null;
  hero_images: string[];
};

export type CatalogData = {
  categories: Category[];
  products: Product[];
  settings: SiteSettings;
};

export type InterestItem = {
  key: string;
  productId: string;
  productName: string;
  quantity: number;
  variationId: string | null;
  variationName: string | null;
  desiredDate: string;
  notes: string;
  imageUrl: string | null;
};
