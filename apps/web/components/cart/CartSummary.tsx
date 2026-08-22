import { Button } from '../ui/Button';

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  onContinueToWhatsApp?: () => void;
  isSubmitting?: boolean;
}

export function CartSummary({
  subtotal,
  itemCount,
  onContinueToWhatsApp,
  isSubmitting = false,
}: CartSummaryProps) {
  return (
    <aside className="rounded-lg border border-gray-100 bg-gray-50 p-5">
      <h2 className="text-base font-semibold text-gray-900">
        Order Summary
      </h2>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Items ({itemCount})
          </span>

          <span className="font-medium text-gray-900">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">
              Total
            </span>

            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(subtotal)}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-gray-500">
        Review your items and continue your purchase through WhatsApp.
      </p>

      <Button
        type="button"
        size="lg"
        className="mt-5 w-full"
        disabled={itemCount === 0 || isSubmitting}
        onClick={onContinueToWhatsApp}
      >
        {isSubmitting ? 'Preparing...' : 'Continue to WhatsApp'}
      </Button>
    </aside>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}