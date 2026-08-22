import { notFound } from 'next/navigation';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductDetailClient } from '@/components/products/ProductDetailClient';
import { getProductBySlug } from '@/lib/api/products';

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

    if (message.includes('status 404')) {
      notFound();
    }

    throw error;
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <ProductDetailClient product={product} />
      </section>

      <Footer />
    </main>
  );
}
