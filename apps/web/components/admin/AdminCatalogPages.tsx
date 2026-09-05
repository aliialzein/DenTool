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
import Image from "next/image";
function Message({ value }: { value: string }) {
  return <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{value}</p>;
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Catalog dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            A focused view of the active catalog.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
          >
            New product
          </Link>
          <Link
            href="/admin/categories/new"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
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
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
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
                className="block rounded-lg p-3 text-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage visible catalog products.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
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
        className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products"
          className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
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
          className="min-h-11 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        >
          <option value="">All availability</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
        <button className="min-h-11 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300">
          Filter
        </button>
      </form>
      {!data ? (
        <p role="status" className="text-sm text-slate-500">Loading products…</p>
      ) : data.items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          No products found.
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
            <table className="w-full min-w-[720px] text-left text-sm">
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
                          <Image
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
          <div className="space-y-3 md:hidden">
            {data.items.map((product) => (
              <article key={product.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  {product.images[0] ? <Image src={product.images[0].secureUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : <span className="h-12 w-12 shrink-0 rounded-lg bg-slate-100" />}
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-slate-950">{product.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{product.category?.name ?? "Uncategorized"}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${product.isAvailable ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{product.isAvailable ? "Available" : "Unavailable"}</span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-sm">
                  <div><dt className="text-slate-500">Price</dt><dd className="mt-1 font-semibold">${Number(product.price).toFixed(2)}</dd></div>
                  <div><dt className="text-slate-500">Stock</dt><dd className="mt-1 font-semibold">{product.stockQuantity}</dd></div>
                </dl>
                <div className="mt-4 flex gap-4 border-t border-slate-100 pt-3 text-sm font-semibold">
                  <Link href={`/admin/products/${product.id}`} className="text-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">Edit</Link>
                  <button onClick={() => remove(product)} className="text-red-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100">Delete</button>
                </div>
              </article>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span>{data.pagination.total} products</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="py-1">
                Page {page} of {data.pagination.totalPages}
              </span>
              <button
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage active and inactive catalog categories.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
        >
          New category
        </Link>
      </div>
      <label className="flex w-full flex-col gap-2 text-sm font-semibold text-slate-900 sm:w-fit sm:flex-row sm:items-center">
        Status
        <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>
      {!items ? (
        <p role="status" className="text-sm text-slate-500">Loading categories…</p>
      ) : filteredItems?.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          No categories found.
        </div>
      ) : (
        <>
        <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
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
                        <Image
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
        <div className="space-y-3 md:hidden">
          {filteredItems?.map((category) => (
            <article key={category.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {category.imageUrl ? <Image src={category.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : <span className="h-12 w-12 shrink-0 rounded-lg bg-slate-100" />}
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-slate-950">{category.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">/{category.slug}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${category.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{category.isActive ? "Active" : "Inactive"}</span>
              </div>
              {category.description && <p className="mt-4 border-t border-slate-100 pt-3 text-sm leading-6 text-slate-600">{category.description}</p>}
              <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-sm font-semibold">
                <Link href={`/admin/categories/${category.id}`} className="text-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100">Edit</Link>
                <button onClick={() => toggle(category)} className="text-amber-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-100">{category.isActive ? "Deactivate" : "Activate"}</button>
                <button onClick={() => remove(category)} className="text-red-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100">Delete</button>
              </div>
            </article>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
