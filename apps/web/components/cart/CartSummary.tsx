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
  const isCartEmpty = itemCount === 0;
  const isButtonDisabled = isCartEmpty || isSubmitting;

  return (
    <aside
      aria-labelledby="cart-summary-heading"
      className="h-fit rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6 lg:sticky lg:top-28"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Your order
          </p>

          <h2
            id="cart-summary-heading"
            className="mt-2 text-xl font-bold tracking-tight text-slate-950"
          >
            Order summary
          </h2>
        </div>

        <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-white px-2 text-sm font-bold text-blue-700">
          {itemCount}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-slate-600">
            Products
          </span>

          <span className="font-semibold text-slate-950">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-slate-600">
            Subtotal
          </span>

          <span className="font-semibold text-slate-950">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="border-t border-blue-200 pt-4">
          <div className="flex items-center justify-between gap-4">
            <span className="font-bold text-slate-950">
              Order total
            </span>

            <span
              aria-live="polite"
              className="text-xl font-bold text-blue-700"
            >
              {formatPrice(subtotal)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-blue-100 bg-white p-4">
        <div className="flex gap-3">
          <InfoIcon
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-blue-700"
          />

          <p className="text-xs leading-5 text-slate-600">
            Delivery details and final order confirmation will be
            handled with our team through WhatsApp.
          </p>
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        disabled={isButtonDisabled}
        aria-busy={isSubmitting}
        aria-disabled={isButtonDisabled}
        onClick={onContinueToWhatsApp}
        className="mt-5 w-full rounded-lg bg-blue-700 font-bold text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-200"
      >
        {isSubmitting
          ? 'Preparing your order...'
          : 'Continue to WhatsApp'}
      </Button>

      {isCartEmpty && (
        <p className="mt-3 text-center text-xs text-slate-500">
          Add at least one product to continue.
        </p>
      )}
    </aside>
  );
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}