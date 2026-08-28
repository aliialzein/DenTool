'use client';

import {
  useEffect,
  useId,
  useState,
} from 'react';

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProductSearch({
  value,
  onChange,
}: ProductSearchProps) {
  const inputId = useId();
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    if (inputValue === value) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onChange(inputValue);
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [inputValue, onChange, value]);

  function handleClear() {
    setInputValue('');
    onChange('');
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/30 sm:p-5">
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-bold text-slate-950"
      >
        Search products
      </label>

      <div className="relative">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"
        />

        <input
          id={inputId}
          type="search"
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
          }}
          placeholder="Search by product name..."
          autoComplete="off"
          className="min-h-12 w-full rounded-xl border border-blue-200 bg-blue-50/30 pl-11 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />

        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear product search"
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <CloseIcon aria-hidden="true" />
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Search updates automatically as you type.
      </p>
    </div>
  );
}

function SearchIcon(
  props: React.SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function CloseIcon(
  props: React.SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}