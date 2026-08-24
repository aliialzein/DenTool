"use client";

import { useEffect, useMemo, useState } from "react";
const allowed = ["image/jpeg", "image/png"];
const maxSize = 5 * 1024 * 1024;
export function ImageUploader({
  files,
  onChange,
  max,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  max: number;
}) {
  const [error, setError] = useState("");
  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );
  useEffect(() => {
    return () => previews.forEach(URL.revokeObjectURL);
  }, [previews]);
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        Images (JPG or PNG, max 5 MB)
      </label>
      <input
        type="file"
        accept="image/jpeg,image/png"
        multiple={max > 1}
        onChange={(event) => {
          const incoming = Array.from(event.target.files ?? []);
          if (
            incoming.some(
              (file) => !allowed.includes(file.type) || file.size > maxSize,
            )
          ) {
            setError("Use JPEG/PNG images no larger than 5 MB.");
            return;
          }
          if (files.length + incoming.length > max) {
            setError(
              `You can upload at most ${max} image${max === 1 ? "" : "s"}.`,
            );
            return;
          }
          setError("");
          onChange([...files, ...incoming]);
          event.currentTarget.value = "";
        }}
        className="block w-full text-sm"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-3">
        {previews.map((preview, index) => (
          <div key={preview} className="relative">
            <img
              src={preview}
              alt="Selected upload preview"
              className="h-20 w-20 rounded border object-cover"
            />
            <button
              type="button"
              onClick={() =>
                onChange(files.filter((_, itemIndex) => itemIndex !== index))
              }
              className="absolute -right-2 -top-2 rounded-full bg-red-600 px-1.5 text-xs text-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
