import Link from 'next/link';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const WHATSAPP_NUMBER = 'YOUR_WHATSAPP_NUMBER';

export default function ContactPage() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <main>
      <Header />

      {/* Hero */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">
              Contact Us
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Need help finding the right product?
            </h1>

            <p className="mt-6 text-base leading-7 text-slate-600 sm:text-lg">
              Have a question about a product or your purchase? Get in touch
              with us directly and we will be happy to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* WhatsApp */}
            <div className="rounded-lg border border-slate-200 p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">
                WhatsApp
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Talk to us directly
              </h2>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                For product questions, availability, or purchasing assistance,
                contact us through WhatsApp.
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex rounded-md bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
              >
                Chat on WhatsApp
              </a>
            </div>

            {/* Products */}
            <div className="rounded-lg border border-slate-200 p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">
                Product Catalog
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                Browse before contacting us
              </h2>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Explore our products and categories first. You can add the
                products you need to your cart and continue your purchase
                through WhatsApp.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex rounded-md border border-sky-700 px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Ready to find what you need?
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Explore our dental products and start building your cart.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex rounded-md bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
          >
            Shop Products
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}