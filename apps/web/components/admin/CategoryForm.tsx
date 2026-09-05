"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, uploadToImageKit } from "@/lib/api/admin";
import { ImageUploader } from "./ImageUploader";
import type { Category } from "@/types/admin";
import Image from "next/image";
export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [isActive, setActive] = useState(category?.isActive ?? true);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const saved = category
        ? await adminApi.updateCategory(category.id, {
            name: name.trim(),
            description: description.trim() || undefined,
            isActive,
          })
        : await adminApi.createCategory({
            name: name.trim(),
            description: description.trim() || undefined,
            isActive,
          });
      if (files[0]) {
        const auth = await adminApi.categoryUploadAuth(saved.id, files[0]);
        const uploaded = await uploadToImageKit(auth, files[0]);
        await adminApi.attachCategoryImage(saved.id, uploaded.fileId);
      }
      router.replace(`/admin/categories/${saved.id}`);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to save category.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <label className="block text-sm font-semibold text-slate-950">
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm font-normal outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <label className="block text-sm font-semibold text-slate-950">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          className="mt-2 min-h-28 w-full rounded-lg border border-slate-200 p-3.5 text-sm font-normal outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setActive(e.target.checked)}
        />
        Active / publicly visible
      </label>
      <p className="-mt-3 text-sm leading-6 text-slate-500">
        Inactive categories stay in the admin catalog but are hidden from customers.
      </p>
      {category?.imageUrl && (
        <div>
          <p className="mb-2 text-sm font-medium">Current image</p>
          <Image
            src={category.imageUrl}
            alt={category.name}
            className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
          />
          <button
            type="button"
            onClick={async () => {
              try {
                await adminApi.deleteCategoryImage(category.id);
                router.refresh();
              } catch {
                setError("Unable to remove category image.");
              }
            }}
            className="ml-3 inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
          >
            Remove image
          </button>
        </div>
      )}
      <ImageUploader files={files} onChange={setFiles} max={1} />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
        >
          Cancel
        </button>
        <button
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save category"}
        </button>
      </div>
    </form>
  );
}
