import Link from 'next/link';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <main>
      <Header />

      {/* Hero */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">
              About DenTool
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Dental tools made easier to find.
            </h1>

            <p className="mt-6 text-base leading-7 text-slate-600 sm:text-lg">
              DenTool is a dental products store focused on making it easier
              for dental professionals and students to find reliable tools,
              instruments, and materials for their everyday needs.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">
                Our Mission
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Simple product discovery. Reliable dental supplies.
              </h2>

              <p className="mt-5 leading-7 text-slate-600">
                We believe purchasing dental supplies should be straightforward.
                DenTool brings dental products together in one organized catalog
                so customers can quickly discover what they need and move
                directly toward purchasing.
              </p>

              <p className="mt-4 leading-7 text-slate-600">
                Our focus is on a practical shopping experience for dentists,
                dentistry students, dental laboratory students, and other
                customers looking for dental-related products.
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-8">
              <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
                <div>
                  <p className="text-2xl font-bold text-sky-700">01</p>
                  <h3 className="mt-2 font-semibold text-slate-900">
                    Easy Discovery
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Search, filter, and browse products by category.
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold text-sky-700">02</p>
                  <h3 className="mt-2 font-semibold text-slate-900">
                    Quality Focus
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    A focused catalog of dental tools and materials.
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-bold text-sky-700">03</p>
                  <h3 className="mt-2 font-semibold text-slate-900">
                    Simple Purchasing
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Add products to your cart and continue your purchase
                    through WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">
              Who We Serve
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Built around dental professionals and students.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              'Dentists',
              'Dentistry Students',
              'Dental Laboratory Students',
              'Dental Professionals',
            ].map((audience) => (
              <div
                key={audience}
                className="rounded-lg border border-slate-200 bg-white p-6"
              >
                <h3 className="font-semibold text-slate-900">
                  {audience}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Explore dental products selected for practical everyday use.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sky-700">
        <div className="mx-auto max-w-7xl px-5 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Looking for dental supplies?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-sky-100 sm:text-base">
            Browse our catalog and find the tools and materials you need.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-slate-100"
            >
              Browse Products
            </Link>

            <Link
              href="/contact"
              className="rounded-md border border-white px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}