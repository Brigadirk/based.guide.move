/**
 * Product-related type definitions
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  features: string[];
  isPopular?: boolean;
  isRecommended?: boolean;
  type?: string;
  bananaAmount?: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  products: Product[];
}

export interface ProductFilter {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  features?: string[];
}
