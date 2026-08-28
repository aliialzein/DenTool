'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { useAppSelector } from '@/lib/store/hooks';

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About DenTool', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const pathname = usePathname();
  const router = useRouter();

  const cartItemCount = useAppSelector(
    (state) => state.cart.items.length,
  );

  function isActiveLink(href: string) {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname?.startsWith(href);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchQuery.trim();

    router.push(
      query
        ? `/products?search=${encodeURIComponent(query)}`
        : '/products',
    );

    setIsMenuOpen(false);
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur">
        <div className="border-b border-blue-100 bg-blue-50">
          <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-center px-4 text-center text-xs font-medium text-blue-900 sm:px-6 lg:px-8">
            Professional dental supplies, made easier to find.
          </div>
        </div>

        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="DenTool home"
            className="flex shrink-0 items-center gap-2.5 text-xl font-bold tracking-tight text-slate-950"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-lg font-bold text-white shadow-sm">
              D
            </span>

            <span>
              Den<span className="text-blue-700">Tool</span>
            </span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-7 lg:flex"
          >
            {navigation.map((item) => {
              const active = isActiveLink(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'text-blue-700'
                      : 'text-slate-600 hover:text-blue-700'
                  }`}
                >
                  {item.label}

                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-blue-700"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <form
              onSubmit={handleSearchSubmit}
              role="search"
              className="relative"
            >
              <label htmlFor="desktop-product-search" className="sr-only">
                Search products
              </label>

              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="desktop-product-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products"
                className="h-11 w-52 rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 xl:w-64"
              />
            </form>

            <Link
              href="/cart"
              aria-label={`Shopping cart with ${cartItemCount} ${
                cartItemCount === 1 ? 'item' : 'items'
              }`}
              className="relative inline-flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              <CartIcon aria-hidden="true" />
              <span className="hidden xl:inline">Cart</span>

              {cartItemCount > 0 && (
                <span
                  aria-live="polite"
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-700 px-1.5 text-[11px] font-bold text-white"
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <Link
              href="/cart"
              aria-label={`Shopping cart with ${cartItemCount} ${
                cartItemCount === 1 ? 'item' : 'items'
              }`}
              className="relative flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              <CartIcon aria-hidden="true" />

              {cartItemCount > 0 && (
                <span
                  aria-live="polite"
                  className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-700 px-1 text-[11px] font-bold text-white"
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              {isMenuOpen ? (
                <CloseIcon aria-hidden="true" />
              ) : (
                <MenuIcon aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-blue-100 bg-white px-4 pb-5 pt-4 md:hidden">
            <form
              onSubmit={handleSearchSubmit}
              role="search"
              className="relative mb-4"
            >
              <label htmlFor="mobile-product-search" className="sr-only">
                Search products
              </label>

              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="mobile-product-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products"
                className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </form>

            <nav aria-label="Mobile navigation" className="grid gap-1">
              {navigation.map((item) => {
                const active = isActiveLink(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setIsMenuOpen(false)}
                    className={`rounded-lg px-3 py-3 text-sm font-semibold transition ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/cart"
                onClick={() => setIsMenuOpen(false)}
                className="mt-1 rounded-lg border border-blue-200 px-3 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                View cart
                {cartItemCount > 0 && ` · ${cartItemCount} ${
                  cartItemCount === 1 ? 'item' : 'items'
                }`}
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

function SearchIcon({
  className = '',
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function CartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="20" r="1" />
      <circle cx="19" cy="20" r="1" />
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 8H6" />
    </svg>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}