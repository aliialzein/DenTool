"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/admin";
import type { Category, Product } from "@/types/admin";
import { ProductForm } from "./ProductForm";
import { CategoryForm } from "./CategoryForm";
export function EditProductPage({ id }: { id: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product>();
  const [error, setError] = useState("");
  useEffect(() => {
    adminApi
      .product(id)
      .then(setProduct)
      .catch(() =>
        setError(
          "Unable to load this product. It may be inactive or unavailable.",
        ),
      );
  }, [id]);
  async function remove() {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await adminApi.deleteProduct(id);
      router.replace("/admin/products");
    } catch {
      setError("Unable to delete product.");
    }
  }
  if (error)
    return (
      <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>
    );
  if (!product)
    return <p className="text-sm text-slate-500">Loading product…</p>;
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit product</h1>
          <p className="mt-1 text-sm text-slate-500">{product.name}</p>
        </div>
        <button
          onClick={remove}
          className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700"
        >
          Delete product
        </button>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
export function EditCategoryPage({ id }: { id: string }) {
  const router = useRouter();
  const [category, setCategory] = useState<Category>();
  const [error, setError] = useState("");
  useEffect(() => {
    adminApi
      .categories()
      .then((items) => {
        const match = items.find((item) => item.id === id);
        if (!match) throw new Error();
        setCategory(match);
      })
      .catch(() =>
        setError(
          "Unable to load this category. Inactive categories are not available through the current backend listing API.",
        ),
      );
  }, [id]);
  async function remove() {
    if (!window.confirm("Delete this category permanently?")) return;
    try {
      await adminApi.deleteCategory(id);
      router.replace("/admin/categories");
    } catch {
      setError(
        "This category could not be deleted. If it contains products, deactivate it instead.",
      );
    }
  }
  if (error)
    return (
      <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>
    );
  if (!category)
    return <p className="text-sm text-slate-500">Loading category…</p>;
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit category</h1>
          <p className="mt-1 text-sm text-slate-500">{category.slug}</p>
        </div>
        <button
          onClick={remove}
          className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700"
        >
          Delete category
        </button>
      </div>
      <CategoryForm category={category} />
    </div>
  );
}
