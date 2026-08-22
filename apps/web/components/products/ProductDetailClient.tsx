'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/Button';
import { addItem } from '@/lib/store/cartSlice';
import { useAppDispatch } from '@/lib/store/hooks';

import type { Product } from '@/types/product';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const dispatch = useAppDispatch();
  const [selectedImage, setSelectedImage] = useState(
    product.images[0]?.secureUrl ?? '',
  );
  const [quantity, setQuantity] = useState(1);

  const galleryImages = useMemo(
    () =>
      [...(product.images ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      ),
    [product.images],
  );

  function handleAddToCart() {
    for (let index = 0; index < quantity; index += 1) {
      dispatch(addItem({ productId: product.id }));
    }
  }

  const useCases = normalizeEntries(product.useCases);
  const specifications = normalizeEntries(product.specifications);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          {selectedImage ? (
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No image available
            </div>
          )}
        </div>

        {galleryImages.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {galleryImages.map((image, index) => (
              <button
                key={`${image.id ?? index}-${image.secureUrl}`}
                type="button"
                onClick={() => setSelectedImage(image.secureUrl)}
                className={`relative aspect-square overflow-hidden rounded-lg border transition ${
                  selectedImage === image.secureUrl
                    ? 'border-sky-600 ring-2 ring-sky-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Image
                  src={image.secureUrl}
                  alt={`${product.name} gallery ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 25vw, 15vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {product.category && (
          <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">
            {product.category.name}
          </p>
        )}

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {product.name}
        </h1>

        <div className="mt-5 flex items-center gap-3">
          <span className="text-3xl font-bold text-slate-900">
            {formatPrice(Number(product.price))}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              product.isAvailable
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {product.isAvailable ? 'In stock' : 'Unavailable'}
          </span>
        </div>

        <p className="mt-6 text-base leading-7 text-slate-600">
          {product.description}
        </p>

        <div className="mt-8 flex items-center gap-3">
          <div className="flex items-center overflow-hidden rounded-md border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="h-10 w-10 text-lg text-slate-600 hover:bg-slate-50"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-12 text-center text-sm font-medium text-slate-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((current) => current + 1)}
              className="h-10 w-10 text-lg text-slate-600 hover:bg-slate-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <Button
            type="button"
            size="lg"
            className="flex-1"
            disabled={!product.isAvailable}
            onClick={handleAddToCart}
          >
            Add to cart
          </Button>
        </div>

        <div className="mt-10 space-y-6 border-t border-slate-200 pt-6">
          {useCases.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Common Uses
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {useCases.map(([label, value]) => (
                  <li key={label} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-600" />
                    <span>
                      <span className="font-medium text-slate-800">{label}:</span>{' '}
                      {String(value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {specifications.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Specifications
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {specifications.map(([label, value]) => (
                  <li key={label} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-600" />
                    <span>
                      <span className="font-medium text-slate-800">{label}:</span>{' '}
                      {String(value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
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
        return Object.entries(item as Record<string, unknown>);
      }

      return [];
    });
  }

  return Object.entries(value as Record<string, unknown>);
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}
