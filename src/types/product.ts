
export interface Product {
  id: string;
  name: string;
  description: string | null;
  ingredients: string[] | null;
  category: 'comida_rapida' | 'especial' | 'extra' | 'bebida';
  price: number;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type ProductCategory = 'comida_rapida' | 'especial' | 'extra' | 'bebida';

export interface CreateProductData {
  name: string;
  description?: string;
  ingredients?: string[];
  category: ProductCategory;
  price: number;
  image_url?: string;
  is_featured?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  is_active?: boolean;
  rating?: number;
}
