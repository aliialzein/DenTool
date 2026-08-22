import { getCategories } from '../../lib/api/categories';
import { getProducts } from '../../lib/api/products';
import { ProductsClient } from '../../components/products/ProductsClient';
import type { ProductListParams } from '../../types/product';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    isAvailable?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: 'name' | 'price' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    page?: string;
    limit?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  const page = parsePositiveInteger(params.page) ?? 1;
  const limit = parsePositiveInteger(params.limit) ?? 20;

  const productParams: ProductListParams = {
    search: params.search,
    categoryId: params.categoryId,
    isAvailable: parseBoolean(params.isAvailable),
    minPrice: parseNumber(params.minPrice),
    maxPrice: parseNumber(params.maxPrice),
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    page,
    limit,
  };

  const [productsResponse, categories] = await Promise.all([
    getProducts(productParams),
    getCategories(),
  ]);

  return (
    <main className="flex-1">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Products
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Browse our dental products and find what you need.
          </p>
        </div>

        <ProductsClient
          products={productsResponse.items}
          pagination={productsResponse.pagination}
          categories={categories}
        />
      </div>
      <Footer />
    </main>
  );
}

function parseNumber(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

function parsePositiveInteger(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const number = Number(value);

  if (!Number.isInteger(number) || number < 1) {
    return undefined;
  }

  return number;
}

function parseBoolean(value?: string): boolean | undefined {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}