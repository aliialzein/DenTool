'use client';

import { useId } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductFilterValues {
  categoryId?: string;
  availability?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface ProductFiltersProps {
  categories: Category[];
  values: ProductFilterValues;
  onChange: (values: ProductFilterValues) => void;
}

export function ProductFilters({
  categories,
  values,
  onChange,
}: ProductFiltersProps) {
  const idPrefix = useId();

  const categoryId = `${idPrefix}-category`;
  const availabilityId = `${idPrefix}-availability`;
  const sortId = `${idPrefix}-sort`;
  const minPriceId = `${idPrefix}-min-price`;
  const maxPriceId = `${idPrefix}-max-price`;

  const sortValue = `${values.sortBy ?? 'createdAt'}:${
    values.sortOrder ?? 'desc'
  }`;

  const hasActiveFilters =
    values.categoryId !== undefined ||
    values.availability !== undefined ||
    values.minPrice !== undefined ||
    values.maxPrice !== undefined ||
    values.sortBy !== undefined ||
    values.sortOrder !== undefined;

  function updateValues(
    nextValues: Partial<ProductFilterValues>,
  ) {
    onChange({
      ...values,
      ...nextValues,
    });
  }

  function handlePriceChange(
    key: 'minPrice' | 'maxPrice',
    value: string,
  ) {
    if (value === '') {
      updateValues({
        [key]: undefined,
      });

      return;
    }

    const parsedValue = Number(value);

    updateValues({
      [key]:
        Number.isFinite(parsedValue) && parsedValue >= 0
          ? parsedValue
          : undefined,
    });
  }

  function clearFilters() {
    onChange({});
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-950">
            Filter products
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Narrow the catalog to find what you need.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="w-fit text-sm font-bold text-blue-700 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label
            htmlFor={categoryId}
            className="mb-2 block text-sm font-bold text-slate-900"
          >
            Category
          </label>

          <select
            id={categoryId}
            value={values.categoryId ?? ''}
            onChange={(event) =>
              updateValues({
                categoryId:
                  event.target.value || undefined,
              })
            }
            className={selectClassName}
          >
            <option value="">All categories</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={availabilityId}
            className="mb-2 block text-sm font-bold text-slate-900"
          >
            Availability
          </label>

          <select
            id={availabilityId}
            value={
              values.availability === undefined
                ? ''
                : values.availability
                  ? 'available'
                  : 'unavailable'
            }
            onChange={(event) => {
              const value = event.target.value;

              updateValues({
                availability:
                  value === ''
                    ? undefined
                    : value === 'available',
              });
            }}
            className={selectClassName}
          >
            <option value="">All products</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        <fieldset>
          <legend className="mb-2 block text-sm font-bold text-slate-900">
            Price range
          </legend>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <label
                htmlFor={minPriceId}
                className="sr-only"
              >
                Minimum price
              </label>

              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"
              >
                $
              </span>

              <input
                id={minPriceId}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={values.minPrice ?? ''}
                onChange={(event) =>
                  handlePriceChange(
                    'minPrice',
                    event.target.value,
                  )
                }
                placeholder="Min"
                className={`${inputClassName} pl-7`}
              />
            </div>

            <div className="relative">
              <label
                htmlFor={maxPriceId}
                className="sr-only"
              >
                Maximum price
              </label>

              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"
              >
                $
              </span>

              <input
                id={maxPriceId}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={values.maxPrice ?? ''}
                onChange={(event) =>
                  handlePriceChange(
                    'maxPrice',
                    event.target.value,
                  )
                }
                placeholder="Max"
                className={`${inputClassName} pl-7`}
              />
            </div>
          </div>
        </fieldset>

        <div>
          <label
            htmlFor={sortId}
            className="mb-2 block text-sm font-bold text-slate-900"
          >
            Sort by
          </label>

          <select
            id={sortId}
            value={sortValue}
            onChange={(event) => {
              const [sortBy, sortOrder] =
                event.target.value.split(':') as [
                  'name' | 'price' | 'createdAt',
                  'asc' | 'desc',
                ];

              updateValues({
                sortBy,
                sortOrder,
              });
            }}
            className={selectClassName}
          >
            <option value="createdAt:desc">
              Newest
            </option>
            <option value="name:asc">
              Name: A–Z
            </option>
            <option value="name:desc">
              Name: Z–A
            </option>
            <option value="price:asc">
              Price: Low to High
            </option>
            <option value="price:desc">
              Price: High to Low
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}

const selectClassName =
  'min-h-11 w-full rounded-lg border border-blue-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition hover:border-blue-300 focus:border-blue-700 focus:ring-4 focus:ring-blue-100';

const inputClassName =
  'min-h-11 w-full rounded-lg border border-blue-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-700 focus:ring-4 focus:ring-blue-100';