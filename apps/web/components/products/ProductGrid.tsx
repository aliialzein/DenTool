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
      <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm">
          <SearchIcon aria-hidden="true" />
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-950">
          No products found
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          Try changing your search or filters to see more
          products.
        </p>
      </div>
    );
  }

  return (
    <div
      aria-label="Product results"
      className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}

function SearchIcon(
  props: React.SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      {...props}
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
      <path d="M8.5 11h5" />
    </svg>
  );
}