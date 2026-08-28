'use client';

import { useCallback, useTransition } from 'react';
import {
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';

import { ProductGrid } from './ProductGrid';
import { ProductSearch } from './ProductSearch';
import {
  ProductFilters,
  type ProductFilterValues,
} from './ProductFilters';

import type {
  Product,
  ProductPagination,
} from '../../types/product';
import type { Category } from '../../types/category';
import type { ProductCardData } from './ProductCard';

interface ProductsClientProps {
  products: Product[];
  pagination: ProductPagination;
  categories: Category[];
}

export function ProductsClient({
  products,
  pagination,
  categories,
}: ProductsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search = searchParams.get('search') ?? '';

  const filters: ProductFilterValues = {
    categoryId:
      searchParams.get('categoryId') ?? undefined,

    availability: parseAvailability(
      searchParams.get('isAvailable'),
    ),

    minPrice: parseNumber(
      searchParams.get('minPrice'),
    ),

    maxPrice: parseNumber(
      searchParams.get('maxPrice'),
    ),

    sortBy: parseSortBy(searchParams.get('sortBy')),

    sortOrder: parseSortOrder(
      searchParams.get('sortOrder'),
    ),
  };

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(
        searchParams.toString(),
      );

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const query = params.toString();
      const nextUrl = query
        ? `${pathname}?${query}`
        : pathname;

      startTransition(() => {
        router.replace(nextUrl, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams],
  );

  const handleSearch = useCallback(
    (value: string) => {
      updateParams({
        search: value.trim() || undefined,
        page: undefined,
      });
    },
    [updateParams],
  );

  const handleFilters = useCallback(
    (values: ProductFilterValues) => {
      updateParams({
        categoryId: values.categoryId,

        isAvailable:
          values.availability === undefined
            ? undefined
            : String(values.availability),

        minPrice:
          values.minPrice === undefined
            ? undefined
            : String(values.minPrice),

        maxPrice:
          values.maxPrice === undefined
            ? undefined
            : String(values.maxPrice),

        sortBy:
          values.sortBy &&
          values.sortBy !== 'createdAt'
            ? values.sortBy
            : undefined,

        sortOrder:
          values.sortOrder &&
          values.sortOrder !== 'desc'
            ? values.sortOrder
            : undefined,

        page: undefined,
      });
    },
    [updateParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > pagination.totalPages) {
        return;
      }

      updateParams({
        page: page === 1 ? undefined : String(page),
      });
    },
    [pagination.totalPages, updateParams],
  );

  const mappedProducts = products.map(
    mapProductToCardData,
  );

  const productLabel =
    pagination.total === 1 ? 'product' : 'products';

  return (
    <div
      aria-busy={isPending}
      className={`space-y-7 transition-opacity ${
        isPending ? 'opacity-60' : 'opacity-100'
      }`}
    >
      <ProductSearch
        value={search}
        onChange={handleSearch}
      />

      <ProductFilters
        categories={categories}
        values={filters}
        onChange={handleFilters}
      />

      <div className="flex flex-col gap-4 border-b border-blue-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div
          aria-live="polite"
          className="text-sm text-slate-600"
        >
          <span className="font-bold text-slate-950">
            {pagination.total}
          </span>{' '}
          {productLabel}
          {search && (
            <>
              {' '}
              matching{' '}
              <span className="font-semibold text-blue-700">
                “{search}”
              </span>
            </>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <ProductGrid products={mappedProducts} />

      {pagination.totalPages > 1 && (
        <div className="flex justify-center border-t border-blue-100 pt-7">
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

interface PaginationProps {
  pagination: ProductPagination;
  onPageChange: (page: number) => void;
}

function Pagination({
  pagination,
  onPageChange,
}: PaginationProps) {
  const { page, totalPages } = pagination;

  return (
    <nav
      aria-label="Product pagination"
      className="flex items-center gap-2"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex min-h-10 items-center rounded-lg border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
      >
        <ArrowLeftIcon
          aria-hidden="true"
          className="mr-2"
        />
        Previous
      </button>

      <span
        aria-current="page"
        className="min-h-10 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-slate-900"
      >
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex min-h-10 items-center rounded-lg border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
      >
        Next
        <ArrowRightIcon
          aria-hidden="true"
          className="ml-2"
        />
      </button>
    </nav>
  );
}

function parseNumber(
  value: string | null,
): number | undefined {
  if (value === null || value.trim() === '') {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) && number >= 0
    ? number
    : undefined;
}

function parseAvailability(
  value: string | null,
): boolean | undefined {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}

function parseSortBy(
  value: string | null,
): ProductFilterValues['sortBy'] {
  if (
    value === 'name' ||
    value === 'price' ||
    value === 'createdAt'
  ) {
    return value;
  }

  return 'createdAt';
}

function parseSortOrder(
  value: string | null,
): ProductFilterValues['sortOrder'] {
  if (value === 'asc' || value === 'desc') {
    return value;
  }

  return 'desc';
}

function mapProductToCardData(
  product: Product,
): ProductCardData {
  const images = Array.isArray(product.images)
    ? product.images
    : [];

  const primaryImage = [...images]
    .filter((image) => image.secureUrl)
    .sort((a, b) => a.sortOrder - b.sortOrder)[0];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    image: primaryImage?.secureUrl,
    isAvailable: product.isAvailable,
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : undefined,
  };
}

function ArrowLeftIcon(
  props: React.SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

function ArrowRightIcon(
  props: React.SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}