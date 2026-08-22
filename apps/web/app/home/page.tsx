import Image from 'next/image';
import Link from 'next/link';

import { ProductCard, type ProductCardData } from '../../components/products/ProductCard';
import { getCategories } from '../../lib/api/categories';
import { getProducts } from '../../lib/api/products';

import type { Product } from '../../types/product';
import type { Category } from '../../types/category';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface HomePageProps {
  products: Product[];
  categories: Category[];
}

export function HomePage({
  products,
  categories,
}: HomePageProps) {
  const featuredProducts = products.slice(0, 4);

  const heroCategory = categories[0];
  const secondaryCategories = categories.slice(1, 3);

  return (
    <main>
        <Header />
      {/* Hero */}
      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-sky-700">
              Professional Dental Supplies
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Professional Dental Tools.
              <span className="block text-sky-700">
                Made Simple.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
              High-precision dental instruments and premium materials
              for dental professionals and students. Reliable,
              sterile, and ready for modern clinical demands.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-md bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
              >
                Shop Products
              </Link>

              <Link
                href="/products"
                className="rounded-md border border-sky-700 px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
              >
                Explore Categories
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
            {heroCategory?.imageUrl ? (
              <Image
                src={heroCategory.imageUrl}
                alt={heroCategory.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Dental instruments
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">
              Browse
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Shop by Category
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Find the dental tools and materials you need.
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="rounded-lg border border-slate-200 p-10 text-center text-sm text-slate-500">
              No categories available.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Main category */}
              {heroCategory && (
                <CategoryCard
                  category={heroCategory}
                  large
                />
              )}

              {/* Secondary categories */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {secondaryCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">
                Featured
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Featured Products
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Top-rated instruments and materials for dental professionals.
              </p>
            </div>

            <Link
              href="/products"
              className="hidden text-sm font-semibold text-sky-700 hover:text-sky-800 sm:block"
            >
              View Full Catalog →
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              No products available.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={mapProductToCardData(product)}
                />
              ))}
            </div>
          )}

          <div className="mt-8 sm:hidden">
            <Link
              href="/products"
              className="text-sm font-semibold text-sky-700"
            >
              View Full Catalog →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sky-700">
        <div className="mx-auto max-w-7xl px-5 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Need the right tools for your practice?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-sky-100 sm:text-base">
            Browse our catalog and find reliable dental instruments
            and materials for your everyday work.
          </p>

          <Link
            href="/products"
            className="mt-7 inline-flex rounded-md bg-white px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-slate-100"
          >
            Browse Products
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
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
      className={`group relative block overflow-hidden rounded-lg bg-slate-100 ${
        large ? 'min-h-[360px]' : 'min-h-[170px]'
      }`}
    >
      {category.imageUrl ? (
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes={
            large
              ? '(max-width: 1024px) 100vw, 50vw'
              : '(max-width: 1024px) 100vw, 50vw'
          }
        />
      ) : (
        <div className="absolute inset-0 bg-slate-200" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-lg font-semibold text-white">
          {category.name}
        </p>

        <p className="mt-1 text-sm text-white/80">
          Explore products →
        </p>
      </div>
    </Link>
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