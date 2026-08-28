import Image from 'next/image';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import type { SVGProps } from 'react';

import {
  ProductCard,
  type ProductCardData,
} from '@/components/products/ProductCard';
import { getCategories } from '@/lib/api/categories';
import { getProducts } from '@/lib/api/products';

import type { Category } from '@/types/category';
import type { Product } from '@/types/product';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

interface HomePageProps {
  products: Product[];
  categories: Category[];
}

export default async function Page() {
  const [categories, productsResponse] = await Promise.all([
    getCategories(),
    getProducts({
      isAvailable: true,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 8,
    }),
  ]);

  return (
    <HomePage
      categories={categories}
      products={productsResponse.items}
    />
  );
}

export function HomePage({
  products,
  categories,
}: HomePageProps) {
  const featuredProducts = products.slice(0, 4);
  const heroCategory = categories[0];
  const secondaryCategories = categories.slice(1, 4);

  return (
    <main
      id="main-content"
      className={`${inter.className} bg-white text-slate-950`}
    >
      <Header />
      {/* Hero */}
      <section
        aria-labelledby="hero-heading"
        className="border-b border-blue-100 bg-gradient-to-b from-blue-50/70 via-white to-white"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8 lg:py-24">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              <span
                aria-hidden="true"
                className="h-px w-8 bg-blue-700"
              />
              Professional dental supplies
            </p>

            <h1
              id="hero-heading"
              className="mt-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl"
            >
              The right tools for better care.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
              Find dependable instruments and clinical materials,
              selected for dentists, students, and modern dental teams.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-blue-700 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                Shop all products
                <ArrowIcon
                  aria-hidden="true"
                  className="ml-2"
                />
              </Link>

              <Link
                href="/products"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-blue-200 bg-white px-6 text-sm font-bold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                Browse by category
              </Link>
            </div>

            <ul className="mt-10 grid gap-3 border-t border-blue-100 pt-6 text-sm text-slate-600 sm:grid-cols-3 sm:gap-5">
              <li className="flex items-center gap-2">
                <CheckIcon
                  aria-hidden="true"
                  className="text-blue-700"
                />
                Verified essentials
              </li>

              <li className="flex items-center gap-2">
                <TruckIcon
                  aria-hidden="true"
                  className="text-blue-700"
                />
                Fast dispatch
              </li>

              <li className="flex items-center gap-2">
                <MessageIcon
                  aria-hidden="true"
                  className="text-blue-700"
                />
                Human support
              </li>
            </ul>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-blue-100 bg-blue-100 shadow-sm sm:min-h-[480px]">
            {heroCategory?.imageUrl ? (
              <Image
                src={heroCategory.imageUrl}
                alt={`${heroCategory.name} dental supplies`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-blue-50 p-8 text-center">
                <div>
                  <DentalIcon
                    aria-hidden="true"
                    className="mx-auto text-blue-700"
                  />

                  <p className="mt-4 text-sm font-semibold text-blue-900">
                    Professional dental instruments
                  </p>
                </div>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-6 pb-6 pt-20">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                Start with confidence
              </p>

              <p className="mt-2 text-lg font-bold text-white">
                Products that support the way you work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        aria-labelledby="category-heading"
        className="bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                Start with what you need
              </p>

              <h2
                id="category-heading"
                className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl"
              >
                Shop by category
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Go straight to the tools and materials most relevant
                to your practice.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              View all categories
              <ArrowIcon aria-hidden="true" />
            </Link>
          </div>

          {categories.length === 0 ? (
            <EmptyState
              title="Categories are being updated"
              description="Browse the full product catalog while we organize the latest products."
              href="/products"
              actionLabel="Browse products"
            />
          ) : (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {heroCategory && (
                <CategoryCard
                  category={heroCategory}
                  large
                />
              )}

              {secondaryCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section
        aria-labelledby="featured-heading"
        className="border-y border-blue-100 bg-blue-50/40"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                Selected for your practice
              </p>

              <h2
                id="featured-heading"
                className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl"
              >
                Featured products
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                A focused selection of dependable products to help
                you get started faster.
              </p>
            </div>

            <Link
              href="/products"
              className="hidden items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:inline-flex"
            >
              View full catalog
              <ArrowIcon aria-hidden="true" />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <EmptyState
              title="No products available yet"
              description="Please check back soon for new dental tools and materials."
              href="/products"
              actionLabel="Visit catalog"
            />
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={mapProductToCardData(product)}
                />
              ))}
            </div>
          )}

          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100 sm:hidden"
          >
            View full catalog
            <ArrowIcon aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Support CTA */}
      <section
        aria-labelledby="support-heading"
        className="bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col items-start justify-between gap-8 rounded-2xl border border-blue-200 bg-blue-700 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:px-14">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                Here when you need us
              </p>

              <h2
                id="support-heading"
                className="mt-3 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl"
              >
                Not sure where to start?
              </h2>

              <p className="mt-4 text-sm leading-6 text-blue-100 sm:text-base">
                Browse the catalog or contact our team for help
                finding the right product for your practice.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/products"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-6 text-sm font-bold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                Browse products
              </Link>

              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-blue-300 px-6 text-sm font-bold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                Contact support
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

interface CategoryCardProps {
  category: Category;
  large?: boolean;
}

function CategoryCard({
  category,
  large = false,
}: CategoryCardProps) {
  return (
    <Link
      href={`/products?categoryId=${category.id}`}
      aria-label={`Browse ${category.name}`}
      className={`group relative block overflow-hidden rounded-xl border border-blue-100 bg-blue-50 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100 ${
        large
          ? 'min-h-[280px] sm:min-h-[360px] lg:col-span-2'
          : 'min-h-[220px]'
      }`}
    >
      {category.imageUrl ? (
        <Image
          src={category.imageUrl}
          alt=""
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes={
            large
              ? '(max-width: 1024px) 100vw, 50vw'
              : '(max-width: 1024px) 50vw, 25vw'
          }
        />
      ) : (
        <div className="absolute inset-0 bg-blue-50" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <p className="text-lg font-bold text-white">
          {category.name}
        </p>

        <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-white/85">
          Explore products
          <ArrowIcon aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function EmptyState({
  title,
  description,
  href,
  actionLabel,
}: {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50/60 px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
        <InfoIcon aria-hidden="true" />
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-950">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>

      <Link
        href={href}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
      >
        {actionLabel}
      </Link>
    </div>
  );
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

function ArrowIcon(
  props: SVGProps<SVGSVGElement>,
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

function CheckIcon(
  props: SVGProps<SVGSVGElement>,
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
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function TruckIcon(
  props: SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h11v11H3z" />
      <path d="M14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="19" r="1.5" />
      <circle cx="18" cy="19" r="1.5" />
    </svg>
  );
}

function MessageIcon(
  props: SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 7.9 7.9 0 0 1-3.4-.8L4 20l1.8-4.3A7.3 7.3 0 0 1 5 11.5 7.5 7.5 0 0 1 12.5 4 7.5 7.5 0 0 1 20 11.5Z" />
      <path d="M9 11.5h.01M12.5 11.5h.01M16 11.5h.01" />
    </svg>
  );
}

function DentalIcon(
  props: SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      width="52"
      height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.2 4.5c1.2-.8 2.3-.8 3.8 0 1.5-.8 2.6-.8 3.8 0 2.1 1.4 2.1 4.5 1.2 6.8-.8 2.1-1.7 3.8-2.5 5.4-.5 1-1.1 1.5-1.8 1.5-.8 0-1.1-1-1.2-2.2-.1-1.1-.2-2.4-1.5-2.4s-1.4 1.3-1.5 2.4c-.1 1.2-.4 2.2-1.2 2.2-.7 0-1.3-.5-1.8-1.5C4.7 15.1 3.8 13.4 3 11.3c-.9-2.3-.9-5.4 1.2-6.8 1.2-.8 2.5-.8 4 0Z" />
      <path d="M12 4.5v3" />
    </svg>
  );
}

function InfoIcon(
  props: SVGProps<SVGSVGElement>,
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}