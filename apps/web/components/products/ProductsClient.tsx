'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

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

  const search = searchParams.get('search') ?? '';

  const filters: ProductFilterValues = {
    categoryId: searchParams.get('categoryId') ?? undefined,

    availability:
      searchParams.get('isAvailable') === null
        ? undefined
        : searchParams.get('isAvailable') === 'true',

    minPrice: parseNumber(searchParams.get('minPrice')),

    maxPrice: parseNumber(searchParams.get('maxPrice')),

    sortBy:
      (searchParams.get('sortBy') as ProductFilterValues['sortBy']) ??
      'createdAt',

    sortOrder:
      (searchParams.get('sortOrder') as ProductFilterValues['sortOrder']) ??
      'desc',
  };

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const query = params.toString();

      router.push(query ? `${pathname}?${query}` : pathname);
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

        sortBy: values.sortBy,

        sortOrder: values.sortOrder,

        page: undefined,
      });
    },
    [updateParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateParams({
        page: page === 1 ? undefined : String(page),
      });
    },
    [updateParams],
  );

  const mappedProducts = products.map(mapProductToCardData);

  return (
    <div className="space-y-8">
      {/* Search */}
      <ProductSearch
        value={search}
        onChange={handleSearch}
      />

      {/* Filters */}
      <ProductFilters
        categories={categories}
        values={filters}
        onChange={handleFilters}
      />

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {pagination.total} product
          {pagination.total === 1 ? '' : 's'}
        </p>

        {pagination.totalPages > 1 && (
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Products */}
      <ProductGrid products={mappedProducts} />

      {/* Bottom pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center pt-4">
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
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <span className="px-2 text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

function parseNumber(
  value: string | null,
): number | undefined {
  if (value === null || value === '') {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

function mapProductToCardData(
  product: Product,
): ProductCardData {
  const images = Array.isArray(product.images)
    ? product.images
    : [];

  const primaryImage = [...images].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  )[0];

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