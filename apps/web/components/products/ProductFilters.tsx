'use client';

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
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="mb-1.5 block text-sm font-medium text-gray-900"
        >
          Category
        </label>

        <select
          id="category"
          value={values.categoryId ?? ''}
          onChange={(event) =>
            onChange({
              ...values,
              categoryId: event.target.value || undefined,
            })
          }
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        >
          <option value="">All categories</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Availability */}
      <div>
        <label
          htmlFor="availability"
          className="mb-1.5 block text-sm font-medium text-gray-900"
        >
          Availability
        </label>

        <select
          id="availability"
          value={
            values.availability === undefined
              ? ''
              : values.availability
                ? 'available'
                : 'unavailable'
          }
          onChange={(event) => {
            const value = event.target.value;

            onChange({
              ...values,
              availability:
                value === ''
                  ? undefined
                  : value === 'available',
            });
          }}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        >
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-900">
          Price range
        </label>

        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            value={values.minPrice ?? ''}
            onChange={(event) =>
              onChange({
                ...values,
                minPrice:
                  event.target.value === ''
                    ? undefined
                    : Number(event.target.value),
              })
            }
            placeholder="Min"
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />

          <input
            type="number"
            min="0"
            value={values.maxPrice ?? ''}
            onChange={(event) =>
              onChange({
                ...values,
                maxPrice:
                  event.target.value === ''
                    ? undefined
                    : Number(event.target.value),
              })
            }
            placeholder="Max"
            className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Sorting */}
      <div>
        <label
          htmlFor="sort"
          className="mb-1.5 block text-sm font-medium text-gray-900"
        >
          Sort by
        </label>

        <select
          id="sort"
          value={`${values.sortBy ?? 'createdAt'}:${values.sortOrder ?? 'desc'}`}
          onChange={(event) => {
            const [sortBy, sortOrder] = event.target.value.split(':') as [
              'name' | 'price' | 'createdAt',
              'asc' | 'desc',
            ];

            onChange({
              ...values,
              sortBy,
              sortOrder,
            });
          }}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        >
          <option value="createdAt:desc">Newest</option>
          <option value="name:asc">Name: A–Z</option>
          <option value="name:desc">Name: Z–A</option>
          <option value="price:asc">Price: Low to High</option>
          <option value="price:desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}