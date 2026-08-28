import Image from 'next/image';
import type { SVGProps } from 'react';

export interface CartItemData {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartItemProps {
  item: CartItemData;
  onQuantityChange: (
    productId: string,
    quantity: number,
  ) => void;
  onRemove: (productId: string) => void;
}

export function CartItem({
  item,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const isMinimumQuantity = item.quantity <= 1;

  return (
    <article className="flex gap-4 border-b border-blue-100 py-6 last:border-b-0 sm:gap-5">
      {/* Product image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-blue-100 bg-blue-50 sm:h-28 sm:w-28">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="112px"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-2 text-center text-xs font-medium text-blue-600">
            <ProductIcon
              aria-hidden="true"
              className="text-blue-600"
            />
            No image
          </div>
        )}
      </div>

      {/* Product details */}
      <div className="min-w-0 flex-1">
        <h2 className="line-clamp-2 text-sm font-bold leading-5 text-slate-950 sm:text-base">
          {item.name}
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          {formatPrice(item.price)} each
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {/* Quantity control */}
          <div
            role="group"
            aria-label={`Quantity for ${item.name}`}
            className="inline-flex h-10 items-center overflow-hidden rounded-lg border border-blue-200 bg-white"
          >
            <button
              type="button"
              disabled={isMinimumQuantity}
              onClick={() =>
                onQuantityChange(
                  item.productId,
                  Math.max(1, item.quantity - 1),
                )
              }
              aria-label={`Decrease quantity of ${item.name}`}
              className="flex h-full w-10 items-center justify-center text-lg text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-slate-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
            >
              −
            </button>

            <span
              aria-live="polite"
              className="flex h-full min-w-10 items-center justify-center border-x border-blue-100 px-2 text-sm font-bold text-slate-950"
            >
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                onQuantityChange(
                  item.productId,
                  item.quantity + 1,
                )
              }
              aria-label={`Increase quantity of ${item.name}`}
              className="flex h-full w-10 items-center justify-center text-lg text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            aria-label={`Remove ${item.name} from cart`}
            className="inline-flex min-h-10 items-center rounded-lg px-2 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-100"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Item subtotal */}
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-slate-950 sm:text-base">
          {formatPrice(item.price * item.quantity)}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Item total
        </p>
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

function ProductIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.2 4.5c1.2-.8 2.3-.8 3.8 0 1.5-.8 2.6-.8 3.8 0 2.1 1.4 2.1 4.5 1.2 6.8-.8 2.1-1.7 3.8-2.5 5.4-.5 1-1.1 1.5-1.8 1.5-.8 0-1.1-1-1.2-2.2-.1-1.1-.2-2.4-1.5-2.4s-1.4 1.3-1.5 2.4c-.1 1.2-.4 2.2-1.2 2.2-.7 0-1.3-.5-1.8-1.5C4.7 15.1 3.8 13.4 3 11.3c-.9-2.3-.9-5.4 1.2-6.8 1.2-.8 2.5-.8 4 0Z" />
      <path d="M12 4.5v3" />
    </svg>
  );
}