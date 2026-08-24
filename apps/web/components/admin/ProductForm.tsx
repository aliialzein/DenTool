"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, uploadToImageKit } from "@/lib/api/admin";
import { ImageUploader } from "./ImageUploader";
import type { Category, Product } from "@/types/admin";
type Values = {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  stockQuantity: string;
  isAvailable: boolean;
  isActive: boolean;
  useCases: string[];
  specifications: Array<{ key: string; value: string }>;
};
const empty: Values = {
  categoryId: "",
  name: "",
  slug: "",
  description: "",
  price: "0",
  stockQuantity: "0",
  isAvailable: true,
  isActive: true,
  useCases: [],
  specifications: [],
};
export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState(product?.images ?? []);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [values, setValues] = useState<Values>(() =>
    product
      ? {
          categoryId: product.categoryId,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: String(product.price),
          stockQuantity: String(product.stockQuantity),
          isAvailable: product.isAvailable,
          isActive: product.isActive,
          useCases: parseUseCases(product.useCases),
          specifications: parseSpecifications(product.specifications),
        }
      : empty,
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    adminApi
      .categories()
      .then(setCategories)
      .catch(() => setError("Unable to load categories."));
  }, []);
  const change = (key: keyof Values, value: string | boolean | Values["useCases"] | Values["specifications"]) =>
    setValues((state) => ({ ...state, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const useCases = values.useCases.map((item) => item.trim()).filter(Boolean);
    const specifications: Record<string, string> = {};
    for (const row of values.specifications) {
      const key = row.key.trim();
      const value = row.value.trim();
      if (!key) {
        setError("Every specification needs a key.");
        return;
      }
      if (specifications[key]) {
        setError("Specification keys must be unique.");
        return;
      }
      specifications[key] = value;
    }
    if (values.useCases.some((item) => !item.trim())) {
      setError("Use cases cannot be empty.");
      return;
    }
    const price = Number(values.price),
      stockQuantity = Number(values.stockQuantity);
    if (
      !values.categoryId ||
      !values.name.trim() ||
      !values.slug.trim() ||
      !values.description.trim() ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      setError(
        "Complete all required fields with a non-negative price and whole stock quantity.",
      );
      return;
    }
    setSaving(true);
    try {
      const input = {
        categoryId: values.categoryId,
        name: values.name.trim(),
        slug: values.slug.trim(),
        description: values.description.trim(),
        price,
        stockQuantity,
        isAvailable: values.isAvailable,
        isActive: values.isActive,
        useCases: { useCases },
        specifications,
      };
      const saved = product
        ? await adminApi.updateProduct(product.id, input)
        : await adminApi.createProduct(input);
      for (const file of files) {
        const auth = await adminApi.productUploadAuth(saved.id, file);
        const uploaded = await uploadToImageKit(auth, file);
        await adminApi.attachProductImage(saved.id, uploaded.fileId);
      }
      router.replace(`/admin/products/${saved.id}`);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to save product.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      {error && (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Name"
          value={values.name}
          onChange={(value) => change("name", value)}
        />
        <Field
          label="Slug"
          value={values.slug}
          onChange={(value) => change("slug", value)}
        />
        <label className="text-sm font-medium">
          Category
          <select
            value={values.categoryId}
            onChange={(e) => change("categoryId", e.target.value)}
            className="mt-1 w-full rounded-md border p-2.5"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <Field
          label="Price"
          type="number"
          min="0"
          step="0.01"
          value={values.price}
          onChange={(value) => change("price", value)}
        />
        <Field
          label="Stock quantity"
          type="number"
          min="0"
          step="1"
          value={values.stockQuantity}
          onChange={(value) => change("stockQuantity", value)}
        />
      </div>
      <label className="block text-sm font-medium">
        Description
        <textarea
          value={values.description}
          onChange={(e) => change("description", e.target.value)}
          className="mt-1 min-h-28 w-full rounded-md border p-2.5"
        />
      </label>
      <UseCasesEditor
        values={values.useCases}
        onChange={(next) => change("useCases", next)}
      />
      <SpecificationsEditor
        values={values.specifications}
        onChange={(next) => change("specifications", next)}
      />
      <div className="flex flex-wrap gap-5">
        <Check
          label="Available for purchase"
          checked={values.isAvailable}
          onChange={(checked) => change("isAvailable", checked)}
        />
        <Check
          label="Active / publicly visible"
          checked={values.isActive}
          onChange={(checked) => change("isActive", checked)}
        />
      </div>
      {images.length ? (
        <div>
          <p className="mb-2 text-sm font-medium">Current images</p>
          <div className="flex flex-wrap gap-3">
            {images.map((image, index) => (
              <div key={image.id} className="flex flex-col gap-1">
                <img src={image.secureUrl} alt={`Product image ${index + 1}`} className="h-20 w-20 rounded border object-cover" />
                <div className="flex gap-1 text-xs">
                  <button type="button" disabled={index === 0} onClick={() => moveImage(index, -1)} className="rounded border px-1 disabled:opacity-40">Left</button>
                  <button type="button" disabled={index === images.length - 1} onClick={() => moveImage(index, 1)} className="rounded border px-1 disabled:opacity-40">Right</button>
                  <button
                    type="button"
                    disabled={deletingImage === image.id}
                    onClick={() => deleteImage(image.id)}
                    className="rounded border border-red-200 px-1 text-red-700 disabled:opacity-50"
                  >
                    {deletingImage === image.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <ImageUploader
        files={files}
        onChange={setFiles}
        max={Math.max(0, 5 - images.length)}
      />
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Cancel
        </button>
        <button
          disabled={saving}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save product"}
        </button>
      </div>
    </form>
  );
  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const next = [...current];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return next;
    });
  }

  async function deleteImage(imageId: string) {
    if (!product || !window.confirm("Delete this product image?")) return;
    setDeletingImage(imageId);
    try {
      await adminApi.deleteProductImage(product.id, imageId);
      setImages((current) => current.filter((image) => image.id !== imageId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete image.");
    } finally {
      setDeletingImage(null);
    }
  }
}

function parseUseCases(value: unknown): string[] {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    const entries = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray((parsed as Record<string, unknown>).useCases)
        ? (parsed as Record<string, unknown>).useCases
        : [];
    return (entries as unknown[]).filter(
      (item): item is string => typeof item === "string",
    );
  } catch {
    return [];
  }
}

function parseSpecifications(value: unknown): Array<{ key: string; value: string }> {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];
    return Object.entries(parsed as Record<string, unknown>).map(([key, item]) => ({
      key,
      value: typeof item === "string" ? item : String(item ?? ""),
    }));
  } catch {
    return [];
  }
}

function UseCasesEditor({ values, onChange }: { values: string[]; onChange: (values: string[]) => void }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">Use cases</h2>
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <input value={value} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} className="w-full rounded-md border p-2.5 text-sm" placeholder="Describe a use case" />
          <button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} className="rounded-md border px-3 text-sm text-red-700">Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...values, ""])} className="text-sm font-semibold text-blue-700">+ Add use case</button>
    </section>
  );
}

function SpecificationsEditor({ values, onChange }: { values: Array<{ key: string; value: string }>; onChange: (values: Array<{ key: string; value: string }>) => void }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">Specifications</h2>
      {values.map((row, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1.5fr_auto]">
          <input value={row.key} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? { ...item, key: event.target.value } : item))} className="rounded-md border p-2.5 text-sm" placeholder="Key" />
          <input value={row.value} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} className="rounded-md border p-2.5 text-sm" placeholder="Value" />
          <button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} className="rounded-md border px-3 text-sm text-red-700">Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...values, { key: "", value: "" }])} className="text-sm font-semibold text-blue-700">+ Add specification</button>
    </section>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  ...props
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  step?: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
        className="mt-1 w-full rounded-md border p-2.5"
      />
    </label>
  );
}
function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
