export interface ProductVariant {
  id: number;
  color: string;
  size: string;
  sku: string;
  stock: number;
  priceOverride: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  categoryName: string;
  averageRating: number;
  reviewCount: number;
  createdAt?: string;
  variants?: ProductVariant[];
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
}

export interface ProductQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export interface PagedProductResponse {
  content: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
