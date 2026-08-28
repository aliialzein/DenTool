import Link from 'next/link';
import { Inter } from 'next/font/google';
import type { SVGProps } from 'react';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

const audiences = [
  {
    title: 'Dentists',
    description:
      'Find dependable instruments and materials for everyday clinical work.',
  },
  {
    title: 'Dentistry students',
    description:
      'Build your essential toolkit with products that are easy to find and understand.',
  },
  {
    title: 'Dental laboratories',
    description:
      'Browse practical supplies that support accurate and efficient lab work.',
  },
  {
    title: 'Dental professionals',
    description:
      'Access a focused catalog designed around real professional needs.',
  },
];

export default function AboutPage() {
  return (
    <div className={`${inter.className} bg-white text-slate-950`}>
      <Header />

      <main id="main-content">
        {/* Hero */}
        <section
          aria-labelledby="about-heading"
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
                About DenTool
              </span>
            </nav>

            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                <span
                  aria-hidden="true"
                  className="h-px w-8 bg-blue-700"
                />
                About DenTool
              </p>

              <h1
                id="about-heading"
                className="mt-6 text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl"
              >
                Dental tools made easier to find.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                DenTool is a dental products store focused on helping
                professionals and students find reliable tools,
                instruments, and materials without unnecessary friction.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg bg-blue-700 px-6 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  Explore products
                  <ArrowIcon
                    aria-hidden="true"
                    className="ml-2"
                  />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-blue-200 bg-white px-6 text-sm font-bold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  Talk to our team
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section
          aria-labelledby="mission-heading"
          className="bg-white"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-20">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                  Our mission
                </p>

                <h2
                  id="mission-heading"
                  className="mt-4 text-3xl font-bold leading-tight tracking-[-0.03em] text-slate-950 sm:text-4xl"
                >
                  Simple product discovery. Reliable dental supplies.
                </h2>

                <div className="mt-6 space-y-4 text-base leading-7 text-slate-600">
                  <p>
                    Purchasing dental supplies should be straightforward.
                    DenTool brings dental products together in one
                    organized catalog so you can quickly understand your
                    options and move confidently toward purchase.
                  </p>

                  <p>
                    We focus on a practical shopping experience for
                    dentists, dentistry students, dental laboratory
                    students, and professionals who need dependable
                    dental-related products.
                  </p>
                </div>

                <Link
                  href="/products"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  Browse the catalog
                  <ArrowIcon aria-hidden="true" />
                </Link>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 sm:p-8">
                <div className="space-y-7">
                  <MissionPoint
                    number="01"
                    title="Easy discovery"
                    description="Search, filter, and browse products by category without getting lost."
                  />

                  <MissionPoint
                    number="02"
                    title="Focused selection"
                    description="A clear catalog of dental tools and materials for practical everyday use."
                  />

                  <MissionPoint
                    number="03"
                    title="Simple purchasing"
                    description="Add products to your cart and continue your purchase through WhatsApp."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Principles */}
        <section
          aria-labelledby="principles-heading"
          className="border-y border-blue-100 bg-blue-50/40"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                What matters to us
              </p>

              <h2
                id="principles-heading"
                className="mt-4 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl"
              >
                Built around your way of working.
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600">
                Every part of DenTool is designed to help you spend less
                time searching and more time focused on your patients,
                studies, and practice.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <PrincipleCard
                icon={<SearchIcon aria-hidden="true" />}
                title="Clear choices"
                description="Organized categories and straightforward product information make decisions easier."
              />

              <PrincipleCard
                icon={<ShieldIcon aria-hidden="true" />}
                title="Professional focus"
                description="We keep the catalog centered on the supplies dental teams actually need."
              />

              <PrincipleCard
                icon={<HeartIcon aria-hidden="true" />}
                title="Human support"
                description="When you need guidance, our team is available to help you find the right direction."
              />
            </div>
          </div>
        </section>

        {/* Who we serve */}
        <section
          aria-labelledby="audience-heading"
          className="bg-white"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                Who we serve
              </p>

              <h2
                id="audience-heading"
                className="mt-4 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl"
              >
                Made for dental professionals and students.
              </h2>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {audiences.map((audience) => (
                <article
                  key={audience.title}
                  className="rounded-xl border border-blue-100 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <CheckIcon aria-hidden="true" />
                  </div>

                  <h3 className="mt-5 text-base font-bold text-slate-950">
                    {audience.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {audience.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          aria-labelledby="about-cta-heading"
          className="bg-white"
        >
          <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
            <div className="flex flex-col items-start justify-between gap-8 rounded-2xl border border-blue-200 bg-blue-700 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:px-14">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                  Start with DenTool
                </p>

                <h2
                  id="about-cta-heading"
                  className="mt-3 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl"
                >
                  Looking for dental supplies?
                </h2>

                <p className="mt-4 text-sm leading-6 text-blue-100 sm:text-base">
                  Browse our catalog and find the tools and materials
                  you need for your practice.
                </p>
              </div>

              <Link
                href="/products"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-white px-6 text-sm font-bold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-200 sm:w-auto"
              >
                Browse products
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function MissionPoint({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="text-2xl font-bold text-blue-700">
        {number}
      </span>

      <div>
        <h3 className="text-base font-bold text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}

function PrincipleCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-xl border border-blue-100 bg-white p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        {icon}
      </div>

      <h3 className="mt-5 text-base font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </article>
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

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function ShieldIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 3 5 6v5c0 4.5 2.9 8.5 7 10 4.1-1.5 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function HeartIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.6 4.6 0 0 1 12 6.3a4.6 4.6 0 0 1 8.8 2.5Z" />
    </svg>
  );
}