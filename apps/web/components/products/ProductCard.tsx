'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { addItem } from '@/lib/store/cartSlice';
import { useAppDispatch } from '@/lib/store/hooks';
import { Button } from '../ui/Button';

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  image?: string;
  isAvailable: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
}

export function ProductCard({
  product,
}: ProductCardProps) {
  const dispatch = useAppDispatch();
  const [isAdded, setIsAdded] = useState(false);

  function handleAddToCart() {
    if (!product.isAvailable) {
      return;
    }

    dispatch(
      addItem({
        productId: product.id,
      }),
    );

    setIsAdded(true);
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/60">
      <Link
        href={`/products/${product.slug}`}
        className="block focus:outline-none focus:ring-4 focus:ring-blue-100 focus:ring-inset"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-blue-50/60">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-6 transition duration-300 group-hover:scale-105 sm:p-8"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <ProductPlaceholder />
          )}

          <div className="absolute left-4 top-4">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                product.isAvailable
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {product.isAvailable
                ? 'Available'
                : 'Unavailable'}
            </span>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          {product.category && (
            <Link
              href={`/products?categoryId=${product.category.id}`}
              className="text-xs font-bold uppercase tracking-[0.12em] text-blue-700 transition hover:text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              {product.category.name}
            </Link>
          )}

          <Link
            href={`/products/${product.slug}`}
            className="mt-2 block rounded-sm focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <h2 className="line-clamp-2 text-base font-bold leading-6 text-slate-950 transition group-hover:text-blue-700">
              {product.name}
            </h2>
          </Link>
        </div>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Price
            </p>

            <p className="mt-1 text-xl font-bold tracking-tight text-slate-950">
              {formatPrice(product.price)}
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            variant="primary"
            disabled={!product.isAvailable}
            aria-label={
              product.isAvailable
                ? `Add ${product.name} to cart`
                : `${product.name} is unavailable`
            }
            onClick={handleAddToCart}
          >
            {isAdded ? 'Added' : 'Add to cart'}
          </Button>
        </div>

        <p
          aria-live="polite"
          className={`mt-3 min-h-5 text-xs font-semibold ${
            isAdded ? 'text-emerald-700' : 'text-transparent'
          }`}
        >
          {isAdded ? 'Product added to your cart.' : '\u00a0'}
        </p>
      </div>
    </article>
  );
}

function ProductPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-blue-300">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
        <ProductIcon aria-hidden="true" />
      </div>

      <span className="text-xs font-semibold text-slate-500">
        Product image unavailable
      </span>
    </div>
  );
}

function ProductIcon(
  props: React.SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      width="27"
      height="27"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 4h10" />
      <path d="M9 4v4.5a3 3 0 0 1-.9 2.1L7 11.7a4 4 0 0 0-1.2 2.8V19a2 2 0 0 0 2 2h8.4a2 2 0 0 0 2-2v-4.5a4 4 0 0 0-1.2-2.8l-1.1-1.1a3 3 0 0 1-.9-2.1V4" />
      <path d="M8 16h8" />
    </svg>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}