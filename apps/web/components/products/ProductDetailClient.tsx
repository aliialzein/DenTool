'use client';

import {
  useMemo,
  useState,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';

import type { Product } from '@/types/product';
import { addItem } from '@/lib/store/cartSlice';
import { useAppDispatch } from '@/lib/store/hooks';
import { Button } from '@/components/ui/Button';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const dispatch = useAppDispatch();

  const galleryImages = useMemo(
    () =>
      [...(product.images ?? [])]
        .filter((image) => image.secureUrl)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .slice(0, 5),
    [product.images],
  );

  const [selectedImage, setSelectedImage] = useState(
    galleryImages[0]?.secureUrl ?? '',
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // useEffect(() => {
  //   setSelectedImage(
  //     galleryImages[0]?.secureUrl ?? '',
  //   );
  //   setQuantity(1);
  //   setIsAdded(false);
  // }, [galleryImages]);

  const useCases = normalizeEntries(product.useCases);
  const specifications = normalizeEntries(
    product.specifications,
  );

  function handleAddToCart() {
    if (!product.isAvailable) {
      return;
    }

    for (let index = 0; index < quantity; index += 1) {
      dispatch(
        addItem({
          productId: product.id,
        }),
      );
    }

    setIsAdded(true);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
      <div className="min-w-0">
        <Link
          href="/products"
          className="inline-flex items-center text-sm font-bold text-blue-700 transition hover:text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          <ArrowLeftIcon
            aria-hidden="true"
            className="mr-2"
          />
          Back to products
        </Link>

        <div className="mt-5 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/50">
          <div className="relative aspect-[4/3]">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={product.name}
                fill
                priority
                className="object-contain p-8 sm:p-12"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            ) : (
              <ProductPlaceholder />
            )}
          </div>
        </div>

        {galleryImages.length > 1 && (
          <div
            aria-label="Product images"
            className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5"
          >
            {galleryImages.map((image, index) => {
              const isSelected =
                selectedImage === image.secureUrl;

              return (
                <button
                  key={`${image.id ?? index}-${image.secureUrl}`}
                  type="button"
                  aria-label={`View ${product.name} image ${
                    index + 1
                  }`}
                  aria-pressed={isSelected}
                  onClick={() =>
                    setSelectedImage(image.secureUrl)
                  }
                  className={`relative aspect-square overflow-hidden rounded-xl border bg-blue-50/40 transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                    isSelected
                      ? 'border-blue-700 ring-2 ring-blue-200'
                      : 'border-blue-100 hover:border-blue-300'
                  }`}
                >
                  <Image
                    src={image.secureUrl}
                    alt=""
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 640px) 22vw, 12vw"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="lg:pt-10">
        {product.category && (
          <Link
            href={`/products?categoryId=${product.category.id}`}
            className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700 transition hover:text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            {product.category.name}
          </Link>
        )}

        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.035em] text-slate-950 sm:text-4xl">
          {product.name}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-3xl font-bold tracking-tight text-slate-950">
            {formatPrice(Number(product.price))}
          </span>

          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ${
              product.isAvailable
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <span
              aria-hidden="true"
              className={`mr-2 h-1.5 w-1.5 rounded-full ${
                product.isAvailable
                  ? 'bg-emerald-600'
                  : 'bg-slate-400'
              }`}
            />
            {product.isAvailable
              ? 'Available'
              : 'Unavailable'}
          </span>
        </div>

        {product.description && (
          <p className="mt-6 text-base leading-7 text-slate-600">
            {product.description}
          </p>
        )}

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div
              className="inline-flex w-fit items-center overflow-hidden rounded-lg border border-blue-200 bg-white"
              aria-label="Product quantity"
            >
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={quantity === 1}
                onClick={() =>
                  setQuantity((current) =>
                    Math.max(1, current - 1),
                  )
                }
                className="flex h-11 w-11 items-center justify-center text-xl text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                −
              </button>

              <span
                aria-live="polite"
                className="flex h-11 w-12 items-center justify-center border-x border-blue-100 text-sm font-bold text-slate-950"
              >
                {quantity}
              </span>

              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() =>
                  setQuantity((current) => current + 1)
                }
                className="flex h-11 w-11 items-center justify-center text-xl text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                +
              </button>
            </div>

            <Button
              type="button"
              size="lg"
              variant="primary"
              className="flex-1"
              disabled={!product.isAvailable}
              onClick={handleAddToCart}
            >
              {isAdded ? 'Added to cart' : 'Add to cart'}
            </Button>
          </div>

          <p
            aria-live="polite"
            className={`mt-3 text-xs font-semibold ${
              isAdded ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            {isAdded
              ? `${quantity} ${
                  quantity === 1 ? 'item' : 'items'
                } added to your cart.`
              : product.isAvailable
                ? 'You can adjust the quantity before adding.'
                : 'This product is currently unavailable.'}
          </p>
        </div>

        {(useCases.length > 0 ||
          specifications.length > 0) && (
          <div className="mt-10 divide-y divide-blue-100 border-t border-blue-100">
            {useCases.length > 0 && (
              <DetailSection
                title="Common uses"
                entries={useCases}
              />
            )}

            {specifications.length > 0 && (
              <DetailSection
                title="Specifications"
                entries={specifications}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailSection({
  title,
  entries,
}: {
  title: string;
  entries: Array<[string, unknown]>;
}) {
  return (
    <section className="py-6">
      <h2 className="text-lg font-bold text-slate-950">
        {title}
      </h2>

      <dl className="mt-4 space-y-3">
        {entries.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-1 sm:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] sm:gap-4"
          >
            <dt className="text-sm font-semibold capitalize text-slate-800">
              {label}
            </dt>

            <dd className="text-sm leading-6 text-slate-600">
              {formatDetailValue(value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ProductPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-blue-300">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
        <ProductIcon aria-hidden="true" />
      </div>

      <span className="text-sm font-semibold text-slate-500">
        Product image unavailable
      </span>
    </div>
  );
}

function normalizeEntries(
  value: unknown,
): Array<[string, unknown]> {
  if (!value || typeof value !== 'object') {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (item && typeof item === 'object') {
        return Object.entries(
          item as Record<string, unknown>,
        );
      }

      return [];
    });
  }

  return Object.entries(value as Record<string, unknown>);
}

function formatDetailValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(', ');
  }

  if (value && typeof value === 'object') {
    return Object.entries(
      value as Record<string, unknown>,
    )
      .map(([key, item]) => `${key}: ${String(item)}`)
      .join(', ');
  }

  return String(value ?? '');
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

function ArrowLeftIcon(
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
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

function ProductIcon(
  props: React.SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      width="30"
      height="30"
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
