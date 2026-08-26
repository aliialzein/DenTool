'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const cartItems = useAppSelector(
    (state) => state.cart.items,
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [missingProductIds, setMissingProductIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const productIdsKey = useMemo(
    () => cartItems.map((item) => item.productId).sort().join(','),
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

        if (!cancelled) {
          setProducts(
            loadedProducts.filter(
              (product): product is Product => product !== null,
            ),
          );
          setMissingProductIds(
            cartItems
              .map((cartItem) => cartItem.productId)
              .filter(
                (productId) =>
                  !loadedProducts.some((product) => product?.id === productId),
              ),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load cart products.',
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
  }, [productIdsKey]);

  const cartItemsData = useMemo(() => {
    return cartItems.flatMap((cartItem) => {
      const product = products.find(
        (item) => item.id === cartItem.productId,
      );

      if (!product) {
        return [];
      }

      const primaryImage = [...product.images].sort(
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

      const { whatsappUrl } = await createWhatsAppPurchaseRequest(items);

      window.location.href = whatsappUrl;
    } catch (err) {
      if (err instanceof WhatsAppPurchaseError) {
        setWhatsappError(err.message);
      } else {
        setWhatsappError('Something went wrong. Please try again.');
      }

      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Your Cart
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Shopping Cart
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Review your selected dental products before continuing.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-gray-100 p-10 text-center text-sm text-gray-500">
            Loading cart...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm text-red-600">
            {error}
          </div>
        ) : cartItems.length === 0 ? (
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Your cart is empty
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Browse our products and add the items you need.
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-gray-100 bg-white">
              {missingProductIds.length > 0 && (
                <div className="border-b border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                  {missingProductIds.length === 1
                    ? 'One item in your cart is no longer available and is not included in the total.'
                    : `${missingProductIds.length} items in your cart are no longer available and are not included in the total.`}
                </div>
              )}
              <div className="px-5">
                {cartItemsData.map((item) => (
                  <CartItem
                    key={item.productId}
                    item={item}
                    onQuantityChange={
                      handleQuantityChange
                    }
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>

            {whatsappError && (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              {whatsappError}
            </div>
          )}

          <CartSummary
            subtotal={subtotal}
            itemCount={itemCount}
            onContinueToWhatsApp={handleContinueToWhatsApp}
            isSubmitting={isSubmitting}
          />
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
