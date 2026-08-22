import {
  ProductCard,
  type ProductCardData,
} from './ProductCard';

interface ProductGridProps {
  products: ProductCardData[];
}

export function ProductGrid({
  products,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center">
        <h3 className="text-base font-medium text-gray-900">
          No products found
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}