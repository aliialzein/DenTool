import Link from 'next/link';
import { Inter } from 'next/font/google';
import type { SVGProps } from 'react';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER;
const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function ContactPage() {
  return (
    <div className={`${inter.className} bg-white text-slate-950`}>
      <Header />

      <main id="main-content">
        {/* Hero */}
        <section
          aria-labelledby="contact-heading"
          className="border-b border-blue-100 bg-gradient-to-b from-blue-50/70 via-white to-white"
        >
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <nav
              aria-label="Breadcrumb"
              className="mb-10 flex items-center gap-2 text-sm text-slate-500"
            >
              <Link
                href="/"
                className="transition hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                Home
              </Link>

              <span aria-hidden="true">/</span>

              <span className="font-semibold text-slate-900">
                Contact
              </span>
            </nav>

            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                <span
                  aria-hidden="true"
                  className="h-px w-8 bg-blue-700"
                />
                Contact DenTool
              </p>

              <h1
                id="contact-heading"
                className="mt-6 text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl"
              >
                We are here to help you find the right product.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Have a question about a product, availability, or your
                purchase? Contact our team directly and we will help you
                move forward.
              </p>
            </div>
          </div>
        </section>

        {/* Contact options */}
        <section
          aria-labelledby="contact-options-heading"
          className="bg-white"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                Choose what works for you
              </p>

              <h2
                id="contact-options-heading"
                className="mt-4 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl"
              >
                Get answers without the back and forth.
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600">
                Start with the product catalog or speak directly with
                our team through WhatsApp.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {/* WhatsApp card */}
              <article className="rounded-2xl border border-blue-200 bg-blue-700 p-6 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-700">
                  <MessageIcon aria-hidden="true" />
                </div>

                <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                  Direct support
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
                  Talk to us on WhatsApp
                </h2>

                <p className="mt-4 max-w-md text-sm leading-6 text-blue-100 sm:text-base">
                  Ask about product details, availability, ordering,
                  or anything else you need before making a decision.
                </p>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open DenTool WhatsApp chat in a new tab"
                  className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-6 text-sm font-bold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  Chat on WhatsApp
                  <ExternalLinkIcon
                    aria-hidden="true"
                    className="ml-2"
                  />
                </a>
              </article>

              {/* Catalog card */}
              <article className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 sm:p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                  <CatalogIcon aria-hidden="true" />
                </div>

                <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                  Product catalog
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                  Browse before contacting us
                </h2>

                <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
                  Explore products and categories first. Add the items
                  you need to your cart, then continue your purchase
                  through WhatsApp.
                </p>

                <Link
                  href="/products"
                  className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg border border-blue-200 bg-white px-6 text-sm font-bold text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  Browse products
                  <ArrowIcon
                    aria-hidden="true"
                    className="ml-2"
                  />
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* Help guide */}
        <section
          aria-labelledby="help-heading"
          className="border-y border-blue-100 bg-blue-50/40"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-20">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                  How we can help
                </p>

                <h2
                  id="help-heading"
                  className="mt-4 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl"
                >
                  A simple next step.
                </h2>

                <p className="mt-4 text-base leading-7 text-slate-600">
                  You do not need to know exactly what to ask. Tell us
                  what you are looking for and our team will help you
                  identify the best next step.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <HelpStep
                  number="01"
                  title="Browse"
                  description="Explore the catalog and review available products."
                />

                <HelpStep
                  number="02"
                  title="Choose"
                  description="Add the products you need to your cart."
                />

                <HelpStep
                  number="03"
                  title="Connect"
                  description="Continue your order through WhatsApp."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          aria-labelledby="contact-cta-heading"
          className="bg-white"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="rounded-2xl border border-blue-200 bg-blue-700 px-6 py-10 text-center sm:px-10 lg:px-14 lg:py-14">
              <h2
                id="contact-cta-heading"
                className="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl"
              >
                Ready to find what you need?
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Explore our dental products and start building your
                cart today.
              </p>

              <Link
                href="/products"
                className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-6 text-sm font-bold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                Shop products
                <ArrowIcon
                  aria-hidden="true"
                  className="ml-2"
                />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function HelpStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white p-5">
      <p className="text-2xl font-bold text-blue-700">
        {number}
      </p>

      <h3 className="mt-4 text-base font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function ArrowIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function ExternalLinkIcon(
  props: SVGProps<SVGSVGElement>,
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
      <path d="M14 4h6v6" />
      <path d="m20 4-9 9" />
      <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

function MessageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 7.9 7.9 0 0 1-3.4-.8L4 20l1.8-4.3A7.3 7.3 0 0 1 5 11.5 7.5 7.5 0 0 1 12.5 4 7.5 7.5 0 0 1 20 11.5Z" />
      <path d="M9 11.5h.01M12.5 11.5h.01M16 11.5h.01" />
    </svg>
  );
}

function CatalogIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
      <path d="M4 5.5v16" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  );
}