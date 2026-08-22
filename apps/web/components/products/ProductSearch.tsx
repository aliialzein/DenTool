'use client';

import { useEffect, useState } from 'react';

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProductSearch({
  value,
  onChange,
}: ProductSearchProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [inputValue, value, onChange]);

  return (
    <div className="relative">
      <label
        htmlFor="product-search"
        className="sr-only"
      >
        Search products
      </label>

      <input
        id="product-search"
        type="search"
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.target.value);
        }}
        placeholder="Search products..."
        className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
      />
    </div>
  );
}