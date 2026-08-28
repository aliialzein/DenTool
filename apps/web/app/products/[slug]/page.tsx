import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductDetailClient } from '@/components/products/ProductDetailClient';
import { getProductBySlug } from '@/lib/api/products';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  let product;

  try {
    product = await getProductBySlug(slug);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    const normalizedMessage = message.toLowerCase();

    if (
      normalizedMessage.includes('status 404') ||
      normalizedMessage.includes('404') ||
      normalizedMessage.includes('not found')
    ) {
      notFound();
    }

    throw error;
  }

  return (
    <div className={`${inter.className} min-h-screen bg-white text-slate-950`}>
      <Header />

      <main id="main-content">
        <section className="border-b border-blue-100 bg-gradient-to-b from-blue-50/70 via-white to-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
            >
              <Link
                href="/"
                className="transition hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                Home
              </Link>

              <span aria-hidden="true">/</span>

              <Link
                href="/products"
                className="transition hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                Products
              </Link>

              <span aria-hidden="true">/</span>

              <span className="font-semibold text-slate-900">
                Product details
              </span>
            </nav>
          </div>
        </section>

        <section
          aria-label="Product details"
          className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
        >
          <ProductDetailClient product={product} />
        </section>
      </main>

      <Footer />
    </div>
  );
}