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

import { getProductById } from '@/lib/api/products';

import type { Product } from '@/types/product';
import type { CartItemData } from '@/components/cart/CartItem';

export default function CartPage() {
  const dispatch = useAppDispatch();

  const cartItems = useAppSelector(
    (state) => state.cart.items,
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      if (cartItems.length === 0) {
        if (!cancelled) {
          setProducts([]);
          setIsLoading(false);
          setError(null);
        }

        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const loadedProducts = await Promise.all(
          cartItems.map(async (cartItem) => {
            try {
              return await getProductById(cartItem.productId);
            } catch (error) {
              if (
                error instanceof Error &&
                error.message.includes('status 404')
              ) {
                return null;
              }

              throw error;
            }
          }),
        );

        if (!cancelled) {
          setProducts(
            loadedProducts.filter(
              (product): product is Product => product !== null,
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
  }, [cartItems]);

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

  function handleContinueToWhatsApp() {
    // WhatsApp integration will be implemented next.
    console.log('Continue to WhatsApp', {
      items: cartItems,
    });
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

            <CartSummary
              subtotal={subtotal}
              itemCount={itemCount}
              onContinueToWhatsApp={
                handleContinueToWhatsApp
              }
            />
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}