import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/Button';

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  category?: {
    name: string;
    slug: string;
  };
  image?: string;
  isAvailable: boolean;
}

interface ProductCardProps {
  product: ProductCardData;
  onAddToCart?: (product: ProductCardData) => void;
}

export function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-lg border border-gray-100 bg-white">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              No image
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        {product.category && (
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-xs font-medium text-blue-600"
          >
            {product.category.name}
          </Link>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium text-gray-900 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        <p className="mt-3 text-base font-semibold text-gray-900">
          {formatPrice(product.price)}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span
            className={`text-xs font-medium ${
              product.isAvailable ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            {product.isAvailable ? 'Available' : 'Unavailable'}
          </span>

          <Button
            size="sm"
            disabled={!product.isAvailable}
            onClick={() => onAddToCart?.(product)}
          >
            Add to cart
          </Button>
        </div>
      </div>
    </article>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}