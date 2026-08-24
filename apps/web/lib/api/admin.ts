import type {
  ApiErrorShape,
  AuthUser,
  Category,
  CategoryInput,
  CategoryUpdateInput,
  ImageKitUploadResult,
  ImageUploadAuth,
  Product,
  ProductInput,
  ProductListParams,
  ProductsResponse,
  ProductUpdateInput,
} from "@/types/admin";
import { ApiError } from "@/types/admin";

const API_ROOT = "/api/admin";

function csrfToken(): string | undefined {
  return document.cookie
    .split("; ")
    .find((item) => item.startsWith("x-csrf-token="))
    ?.split("=")
    .slice(1)
    .join("=");
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("content-type", "application/json");
  if (!["GET", "HEAD"].includes(init.method ?? "GET")) {
    const token = csrfToken();
    if (token) headers.set("x-csrf-token", decodeURIComponent(token));
  }
  const response = await fetch(`${API_ROOT}${path}`, {
    ...init,
    headers,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    let body: ApiErrorShape = {};
    try {
      body = (await response.json()) as ApiErrorShape;
    } catch {
      /* network/proxy error */
    }
    throw new ApiError(
      response.status,
      body.code,
      body.message ?? `Request failed (${response.status})`,
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function query(params: ProductListParams = {}) {
  const values = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") values.set(key, String(value));
  });
  const value = values.toString();
  return value ? `?${value}` : "";
}

export const adminApi = {
  login: (email: string, password: string) =>
    request<AuthUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<AuthUser>("/auth/me"),
  logout: () =>
    request<{ success: boolean }>("/auth/logout", { method: "POST" }),
  products: (params?: ProductListParams) =>
    request<ProductsResponse>(`/products/admin${query(params)}`),
  product: (id: string) =>
    request<Product>(`/products/admin/id/${encodeURIComponent(id)}`),
  createProduct: (input: ProductInput) =>
    request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateProduct: (id: string, input: ProductUpdateInput) =>
    request<Product>(`/products/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteProduct: (id: string) =>
    request<void>(`/products/${encodeURIComponent(id)}`, { method: "DELETE" }),
  productUploadAuth: (id: string, file: File) =>
    request<ImageUploadAuth>(`/products/${id}/images/signature`, {
      method: "POST",
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      }),
    }),
  attachProductImage: (id: string, fileId: string) =>
    request(`/products/${id}/images`, {
      method: "POST",
      body: JSON.stringify({ fileId }),
    }),
  deleteProductImage: (productId: string, imageId: string) =>
    request<void>(`/products/${productId}/images/${imageId}`, {
      method: "DELETE",
    }),
  categories: () => request<Category[]>("/categories/admin"),
  createCategory: (input: CategoryInput) =>
    request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateCategory: (id: string, input: CategoryUpdateInput) =>
    request<Category>(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteCategory: (id: string) =>
    request<void>(`/categories/${id}`, { method: "DELETE" }),
  categoryUploadAuth: (id: string, file: File) =>
    request<ImageUploadAuth>(`/categories/${id}/image/signature`, {
      method: "POST",
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      }),
    }),
  attachCategoryImage: (id: string, fileId: string) =>
    request<Category>(`/categories/${id}/image`, {
      method: "POST",
      body: JSON.stringify({ fileId }),
    }),
  deleteCategoryImage: (id: string) =>
    request<void>(`/categories/${id}/image`, { method: "DELETE" }),
};

export async function uploadToImageKit(
  auth: ImageUploadAuth,
  file: File,
): Promise<ImageKitUploadResult> {
  const form = new FormData();
  form.set("file", file);
  form.set("fileName", file.name);
  form.set("publicKey", auth.publicKey);
  form.set("token", auth.token);
  form.set("expire", String(auth.expire));
  form.set("signature", auth.signature);
  form.set("folder", auth.folder);
  const response = await fetch(
    "https://upload.imagekit.io/api/v1/files/upload",
    { method: "POST", body: form },
  );
  if (!response.ok)
    throw new ApiError(response.status, undefined, "ImageKit upload failed.");
  return response.json() as Promise<ImageKitUploadResult>;
}
