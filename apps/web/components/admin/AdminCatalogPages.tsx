"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import {
  ApiError,
  type Category,
  type Product,
  type ProductsResponse,
} from "@/types/admin";
function Message({ value }: { value: string }) {
  return <p className="rounded bg-red-50 p-3 text-sm text-red-700">{value}</p>;
}
export function Dashboard() {
  const [products, setProducts] = useState<ProductsResponse>();
  const [categories, setCategories] = useState<Category[]>();
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([adminApi.products({ limit: 100 }), adminApi.categories()])
      .then(([productData, categoryData]) => {
        setProducts(productData);
        setCategories(categoryData);
      })
      .catch(() => setError("Unable to load catalog data."));
  }, []);
  if (error) return <Message value={error} />;
  if (!products || !categories)
    return <p className="text-sm text-slate-500">Loading dashboard…</p>;
  const visible = products.items;
  const stats = [
    ["Visible products", products.pagination.total],
    ["Available", visible.filter((product) => product.isAvailable).length],
    [
      "Out of stock",
      visible.filter((product) => product.stockQuantity === 0).length,
    ],
    ["Active categories", categories.length],
  ];
  return (
    <div className="space-y-7">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Catalog dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            A focused view of the active catalog.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products/new"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
          >
            New product
          </Link>
          <Link
            href="/admin/categories/new"
            className="rounded-md border px-3 py-2 text-sm font-semibold"
          >
            New category
          </Link>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">Unavailable or sold-out products</h2>
        <div className="mt-3 space-y-2">
          {visible
            .filter(
              (product) => !product.isAvailable || product.stockQuantity === 0,
            )
            .slice(0, 5)
            .map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="block rounded p-2 text-sm hover:bg-slate-50"
              >
                {product.name}{" "}
                <span className="text-slate-500">
                  — {!product.isAvailable ? "Unavailable" : "Out of stock"}
                </span>
              </Link>
            ))}
          {!visible.some(
            (product) => !product.isAvailable || product.stockQuantity === 0,
          ) && <p className="text-sm text-slate-500">None.</p>}
        </div>
      </section>
    </div>
  );
}
export function ProductsPageClient() {
  const [data, setData] = useState<ProductsResponse>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [availability, setAvailability] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const load = () => {
    adminApi
      .products({
        page,
        limit: 20,
        search: search || undefined,
        categoryId: categoryId || undefined,
        isAvailable: availability === "" ? undefined : availability === "true",
      })
      .then(setData)
      .catch(() => setError("Unable to load products."));
  };
  useEffect(() => {
    adminApi
      .categories()
      .then(setCategories)
      .catch(() => {});
  }, []);
  useEffect(() => {
    load();
  }, [page]);
  async function remove(product: Product) {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`))
      return;
    try {
      await adminApi.deleteProduct(product.id);
      load();
    } catch {
      setError("Unable to delete product.");
    }
  }
  if (error) return <Message value={error} />;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage visible catalog products.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
        >
          New product
        </Link>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          load();
        }}
        className="flex flex-wrap gap-2 rounded-xl border bg-white p-3"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products"
          className="rounded border p-2 text-sm"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded border p-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="rounded border p-2 text-sm"
        >
          <option value="">All availability</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
        <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
          Filter
        </button>
      </form>
      {!data ? (
        <p className="text-sm text-slate-500">Loading products…</p>
      ) : data.items.length === 0 ? (
        <div className="rounded border bg-white p-8 text-center text-sm text-slate-500">
          No products found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Status</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {data.items.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {product.images[0] ? (
                          <img
                            src={product.images[0].secureUrl}
                            alt=""
                            className="h-9 w-9 rounded object-cover"
                          />
                        ) : (
                          <span className="h-9 w-9 rounded bg-slate-100" />
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-3">{product.category?.name}</td>
                    <td className="p-3">${Number(product.price).toFixed(2)}</td>
                    <td className="p-3">{product.stockQuantity}</td>
                    <td className="p-3">
                      <span
                        className={`rounded px-2 py-1 text-xs ${product.isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                      >
                        {product.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="mr-3 text-blue-700"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => remove(product)}
                        className="text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between text-sm">
            <span>{data.pagination.total} products</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="py-1">
                Page {page} of {data.pagination.totalPages}
              </span>
              <button
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export function CategoriesPageClient() {
  const [items, setItems] = useState<Category[]>();
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [error, setError] = useState("");
  const load = () =>
    adminApi
      .categories()
      .then(setItems)
      .catch(() => setError("Unable to load categories."));
  useEffect(() => {
    void load();
  }, []);
  async function remove(category: Category) {
    if (!window.confirm(`Delete ${category.name}?`)) return;
    try {
      await adminApi.deleteCategory(category.id);
      load();
    } catch (caught) {
      setError(
        caught instanceof ApiError && caught.code === "CATEGORY_NOT_EMPTY"
          ? "This category has products and cannot be deleted. Deactivate it instead."
          : "Unable to delete category.",
      );
    }
  }
  async function toggle(category: Category) {
    try {
      await adminApi.updateCategory(category.id, {
        isActive: !category.isActive,
      });
      load();
    } catch {
      setError("Unable to update category.");
    }
  }
  if (error) return <Message value={error} />;
  const filteredItems = items?.filter((category) =>
    status === "all" || (status === "active" ? category.isActive : !category.isActive),
  );
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage active and inactive catalog categories.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
        >
          New category
        </Link>
      </div>
      <label className="flex items-center gap-2 text-sm">
        Status
        <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="rounded border p-2">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>
      {!items ? (
        <p className="text-sm text-slate-500">Loading categories…</p>
      ) : filteredItems?.length === 0 ? (
        <div className="rounded border bg-white p-8 text-center text-sm text-slate-500">
          No categories found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Description</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
                {filteredItems?.map((category) => (
                <tr key={category.id} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt=""
                          className="h-9 w-9 rounded object-cover"
                        />
                      ) : (
                        <span className="h-9 w-9 rounded bg-slate-100" />
                      )}
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </td>
                  <td className="p-3">{category.slug}</td>
                  <td className="max-w-xs truncate p-3">
                    {category.description}
                  </td>
                  <td className="p-3">
                    <span className={`rounded px-2 py-1 text-xs ${category.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="mr-3 text-blue-700"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => toggle(category)}
                      className="mr-3 text-amber-700"
                    >
                      {category.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => remove(category)}
                      className="text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
