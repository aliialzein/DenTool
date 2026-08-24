import type { Category } from "./category";
import type { Product, ProductListParams, ProductsResponse } from "./product";

export interface AuthUser {
  id: string;
  email: string;
  role: "ADMIN";
}
export interface ApiErrorShape {
  statusCode?: number;
  code?: string;
  message?: string;
  details?: unknown;
}
export class ApiError extends Error {
  constructor(
    public status: number,
    public code?: string,
    message = "Request failed",
  ) {
    super(message);
  }
}
export interface ProductInput {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
  isActive: boolean;
  useCases: Record<string, unknown>;
  specifications: Record<string, unknown>;
}
export type ProductUpdateInput = Partial<ProductInput>;
export interface CategoryInput {
  name: string;
  description?: string;
  isActive?: boolean;
}
export type CategoryUpdateInput = Partial<CategoryInput>;
export interface ImageUploadAuth {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
  folder: string;
}
export interface ImageKitUploadResult {
  fileId: string;
  url: string;
}
export type { Category, Product, ProductListParams, ProductsResponse };
