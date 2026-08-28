import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className = '',
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const errorId = `${inputId}-error`;

  const describedBy = [
    ariaDescribedBy,
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-semibold text-slate-950"
        >
          {label}
        </label>
      )}

      <input
        {...props}
        id={inputId}
        aria-invalid={error ? true : ariaInvalid}
        aria-describedby={describedBy}
        className={`min-h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? 'border-red-400 focus:border-red-600 focus:ring-red-100'
            : 'border-slate-200 focus:border-blue-600 focus:ring-blue-100'
        } ${className}`}
      />

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}