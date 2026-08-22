import Image from 'next/image';

export interface CartItemData {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartItemProps {
  item: CartItemData;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItem({
  item,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  return (
    <div className="flex gap-4 border-b border-gray-100 py-5">
      {/* Image */}
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-gray-50">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium text-gray-900">
          {item.name}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {formatPrice(item.price)}
        </p>

        <div className="mt-3 flex items-center justify-between gap-4">
          {/* Quantity */}
          <div className="flex items-center rounded-md border border-gray-200">
            <button
              type="button"
              onClick={() =>
                onQuantityChange(
                  item.productId,
                  Math.max(1, item.quantity - 1),
                )
              }
              className="px-3 py-1.5 text-gray-600 hover:text-blue-600"
              aria-label="Decrease quantity"
            >
              −
            </button>

            <span className="min-w-8 text-center text-sm">
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
              className="px-3 py-1.5 text-gray-600 hover:text-blue-600"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.productId)}
            className="text-sm text-gray-400 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold text-gray-900">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>
    </div>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}