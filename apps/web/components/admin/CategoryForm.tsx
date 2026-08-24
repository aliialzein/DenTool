"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, uploadToImageKit } from "@/lib/api/admin";
import { ImageUploader } from "./ImageUploader";
import type { Category } from "@/types/admin";
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
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      {error && (
        <p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <label className="block text-sm font-medium">
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          className="mt-1 w-full rounded-md border p-2.5"
        />
      </label>
      <label className="block text-sm font-medium">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          className="mt-1 min-h-28 w-full rounded-md border p-2.5"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setActive(e.target.checked)}
        />
        Active / publicly visible
      </label>
      {category?.imageUrl && (
        <div>
          <p className="mb-2 text-sm font-medium">Current image</p>
          <img
            src={category.imageUrl}
            alt={category.name}
            className="h-24 w-24 rounded border object-cover"
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
            className="ml-3 text-sm text-red-700"
          >
            Remove image
          </button>
        </div>
      )}
      <ImageUploader files={files} onChange={setFiles} max={1} />
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
          {saving ? "Saving…" : "Save category"}
        </button>
      </div>
    </form>
  );
}
