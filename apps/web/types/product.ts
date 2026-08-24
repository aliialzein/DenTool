export interface ProductImage {
  id: string;
  publicId?: string;
  secureUrl: string;
  sortOrder: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
  isActive: boolean;
  useCases: unknown;
  specifications: unknown;
  category?: ProductCategory;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductListParams {
  search?: string;
  categoryId?: string;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductsResponse {
  items: Product[];
  pagination: ProductPagination;
}
