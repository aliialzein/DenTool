'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/Button';

import {
  useAppDispatch,
  useAppSelector,
} from '@/lib/store/hooks';

import {
  removeItem,
  updateQuantity,
} from '@/lib/store/cartSlice';

import { getProductsByIds } from '@/lib/api/products';
import {
  createWhatsAppPurchaseRequest,
  WhatsAppPurchaseError,
} from '@/lib/api/whatsapp';

import type { Product } from '@/types/product';
import type { CartItemData } from '@/components/cart/CartItem';

export default function CartPage() {
  const dispatch = useAppDispatch();

  const cartItems = useAppSelector(
    (state) => state.cart.items,
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [missingProductIds, setMissingProductIds] = useState<
    string[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [whatsappError, setWhatsappError] = useState<string | null>(
    null,
  );

  const productIdsKey = useMemo(
    () =>
      cartItems
        .map((item) => item.productId)
        .sort()
        .join(','),
    [cartItems],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      if (cartItems.length === 0) {
        if (!cancelled) {
          setProducts([]);
          setMissingProductIds([]);
          setIsLoading(false);
          setError(null);
        }

        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const loadedProducts = await getProductsByIds(
          cartItems.map((cartItem) => cartItem.productId),
        );

        if (cancelled) {
          return;
        }

        const availableProducts = loadedProducts.filter(
          (product): product is Product => product !== null,
        );

        setProducts(availableProducts);

        setMissingProductIds(
          cartItems
            .map((cartItem) => cartItem.productId)
            .filter(
              (productId) =>
                !loadedProducts.some(
                  (product) => product?.id === productId,
                ),
            ),
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'We could not load your cart.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [cartItems, productIdsKey, loadAttempt]);

  const cartItemsData = useMemo(() => {
    return cartItems.flatMap((cartItem) => {
      const product = products.find(
        (item) => item.id === cartItem.productId,
      );

      if (!product) {
        return [];
      }

      const images = Array.isArray(product.images)
        ? product.images
        : [];

      const primaryImage = [...images].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      )[0];

      return [
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          image: primaryImage?.secureUrl,
          quantity: cartItem.quantity,
        } satisfies CartItemData,
      ];
    });
  }, [cartItems, products]);

  const subtotal = useMemo(() => {
    return cartItemsData.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0,
    );
  }, [cartItemsData]);

  const itemCount = useMemo(() => {
    return cartItemsData.reduce(
      (total, item) => total + item.quantity,
      0,
    );
  }, [cartItemsData]);

  function handleQuantityChange(
    productId: string,
    quantity: number,
  ) {
    dispatch(
      updateQuantity({
        productId,
        quantity,
      }),
    );
  }

  function handleRemove(productId: string) {
    dispatch(removeItem(productId));
  }

  async function handleContinueToWhatsApp() {
    setWhatsappError(null);
    setIsSubmitting(true);

    try {
      const items = cartItems.map((cartItem) => ({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
      }));

      const { whatsappUrl } =
        await createWhatsAppPurchaseRequest(items);

      window.location.href = whatsappUrl;
    } catch (err) {
      if (err instanceof WhatsAppPurchaseError) {
        setWhatsappError(err.message);
      } else {
        setWhatsappError(
          'Something went wrong. Please try again.',
        );
      }

      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <Header />

      <section
        aria-labelledby="cart-heading"
        className="border-b border-blue-100 bg-gradient-to-b from-blue-50/70 via-white to-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center gap-2 text-sm text-slate-500"
          >
            <Link
              href="/"
              className="transition hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              Home
            </Link>

            <span aria-hidden="true">/</span>

            <span className="font-semibold text-slate-900">
              Cart
            </span>
          </nav>

          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              Your selection
            </p>

            <h1
              id="cart-heading"
              className="mt-3 text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl"
            >
              Shopping cart
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Review your selected dental products before
              continuing with your order.
            </p>
          </div>

          {isLoading ? (
            <CartLoadingState />
          ) : error ? (
            <CartErrorState
              message={error}
              onRetry={() => setLoadAttempt((attempt) => attempt + 1)}
            />
          ) : cartItems.length === 0 ? (
            <EmptyCartState />
          ) : (
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-slate-950">
                    Selected products
                  </h2>

                  <span className="text-sm text-slate-500">
                    {itemCount}{' '}
                    {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-white px-5 shadow-sm sm:px-6">
                  {missingProductIds.length > 0 && (
                    <div
                      role="status"
                      className="mx-0 border-b border-amber-200 bg-amber-50 px-1 py-4 text-sm leading-6 text-amber-900"
                    >
                      {missingProductIds.length === 1
                        ? 'One item in your cart is no longer available and has been removed from the total.'
                        : `${missingProductIds.length} items in your cart are no longer available and have been removed from the total.`}
                    </div>
                  )}

                  {cartItemsData.length > 0 ? (
                    cartItemsData.map((item) => (
                      <CartItem
                        key={item.productId}
                        item={item}
                        onQuantityChange={
                          handleQuantityChange
                        }
                        onRemove={handleRemove}
                      />
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-sm text-slate-600">
                        The products in your cart are no longer
                        available.
                      </p>

                      <Link
                        href="/products"
                        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                      >
                        Browse products
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/products"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <ArrowLeftIcon aria-hidden="true" />
                  Continue shopping
                </Link>
              </div>

              <div>
                {whatsappError && (
                  <div
                    role="alert"
                    className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
                  >
                    {whatsappError}
                  </div>
                )}

                <CartSummary
                  subtotal={subtotal}
                  itemCount={itemCount}
                  onContinueToWhatsApp={
                    handleContinueToWhatsApp
                  }
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function CartLoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"
    >
      <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-6">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="flex gap-4 border-b border-blue-100 pb-6 last:border-b-0 last:pb-0"
            >
              <div className="h-24 w-24 rounded-xl bg-blue-50" />

              <div className="flex-1 space-y-3">
                <div className="h-4 w-2/3 rounded bg-blue-50" />
                <div className="h-4 w-1/3 rounded bg-blue-50" />
                <div className="h-9 w-28 rounded-lg bg-blue-50" />
              </div>
            </div>
          ))}
        </div>

        <span className="sr-only">Loading your cart...</span>
      </div>

      <div className="h-72 animate-pulse rounded-2xl bg-blue-50" />
    </div>
  );
}

function CartErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-6 sm:p-8"
    >
      <h2 className="text-lg font-bold text-red-950">
        We could not load your cart
      </h2>

      <p className="mt-2 text-sm leading-6 text-red-800">
        {message}
      </p>

      <Button
        type="button"
        variant="outline"
        onClick={onRetry}
        className="mt-5 border-red-300 bg-white text-red-800 hover:border-red-500 hover:bg-red-100"
      >
        Try again
      </Button>
    </div>
  );
}

function EmptyCartState() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-6 py-14 text-center sm:px-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
        <CartIcon aria-hidden="true" />
      </div>

      <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
        Your cart is empty
      </h2>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
        Explore our dental products and add the tools and
        materials you need for your practice.
      </p>

      <Link
        href="/products"
        className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-blue-700 px-6 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
      >
        Browse products
      </Link>
    </div>
  );
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

function CartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1" />
      <circle cx="19" cy="20" r="1" />
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 8H6" />
    </svg>
  );
}