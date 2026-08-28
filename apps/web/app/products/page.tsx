import Link from 'next/link';
import { Inter } from 'next/font/google';

import { getCategories } from '../../lib/api/categories';
import { getProducts } from '../../lib/api/products';
import { ProductsClient } from '../../components/products/ProductsClient';
import type { ProductListParams } from '../../types/product';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

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
    <div className={`${inter.className} min-h-screen bg-white text-slate-950`}>
      <Header />

      <main id="main-content">
        <section className="border-b border-blue-100 bg-gradient-to-b from-blue-50/70 via-white to-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
            <nav
              aria-label="Breadcrumb"
              className="mb-8 flex items-center gap-2 text-sm text-slate-500"
            >
              <Link
                href="/"
                className="transition hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                Home
              </Link>

              <span aria-hidden="true">/</span>

              <span className="font-semibold text-slate-900">
                Products
              </span>
            </nav>

            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                  <span
                    aria-hidden="true"
                    className="h-px w-8 bg-blue-700"
                  />
                  DenTool catalog
                </p>

                <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl">
                  Dental products for your everyday work.
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Browse instruments, materials, and dental supplies
                  selected for dentists, students, laboratories, and
                  dental professionals.
                </p>
              </div>

              <div className="hidden shrink-0 items-center gap-3 rounded-xl border border-blue-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm lg:flex">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700"
                >
                  <SearchIcon />
                </span>

                <span>
                  Use search and filters
                  <br />
                  <strong className="font-semibold text-slate-950">
                    to find products faster
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="catalog-heading"
          className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
        >
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="catalog-heading"
                className="text-2xl font-bold tracking-[-0.025em] text-slate-950"
              >
                Explore the catalog
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Refine the list by category, availability, price, or
                search term.
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex w-fit items-center text-sm font-bold text-blue-700 transition hover:text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              Need help choosing?
              <ArrowIcon
                aria-hidden="true"
                className="ml-2"
              />
            </Link>
          </div>

          <ProductsClient
            products={productsResponse.items}
            pagination={productsResponse.pagination}
            categories={categories}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}

function parseNumber(value?: string): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

function parsePositiveInteger(value?: string): number | undefined {
  if (!value?.trim()) {
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

function SearchIcon() {
  return (
    <svg
      width="19"
      height="19"
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

function ArrowIcon(
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
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}