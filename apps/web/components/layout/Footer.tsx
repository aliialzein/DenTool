import Link from 'next/link';
import type { ReactNode, SVGProps } from 'react';

interface FooterProps {
  categories?: {
    id: string;
    name: string;
    slug: string;
  }[];
}

const companyLinks = [
  {
    label: 'About DenTool',
    href: '/about',
  },
  {
    label: 'Contact support',
    href: '/contact',
  },
  {
    label: 'Browse products',
    href: '/products',
  },
];

export function Footer({ categories = [] }: FooterProps) {
  return (
    <footer className="border-t border-blue-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Trust information */}
        <div className="grid gap-8 border-b border-blue-100 py-8 sm:grid-cols-3">
          <TrustItem
            icon={<ShieldIcon aria-hidden="true" />}
            title="Reliable essentials"
            description="Products selected for everyday dental practice."
          />

          <TrustItem
            icon={<TruckIcon aria-hidden="true" />}
            title="Fast dispatch"
            description="Orders are prepared within 24–48 hours."
          />

          <TrustItem
            icon={<MessageIcon aria-hidden="true" />}
            title="Helpful support"
            description="Our team can help you find the right product."
          />
        </div>

        {/* Footer navigation */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <Link
              href="/"
              aria-label="DenTool home"
              className="inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-950"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-lg font-bold text-white">
                D
              </span>

              <span>
                Den<span className="text-blue-700">Tool</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-600">
              Professional dental tools and materials for dentists,
              dentistry students, dental laboratories, and clinical teams.
            </p>

            <Link
              href="/products"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              Explore the catalog
              <ArrowIcon aria-hidden="true" />
            </Link>
          </div>

          {/* Products */}
          <FooterColumn title="Products">
            <FooterLink href="/products">
              All products
            </FooterLink>

            <FooterLink href="/products?sortBy=createdAt">
              New arrivals
            </FooterLink>

            <FooterLink href="/cart">
              Shopping cart
            </FooterLink>
          </FooterColumn>

          {/* Categories */}
          <FooterColumn title="Categories">
            {categories.length > 0 ? (
              categories.slice(0, 5).map((category) => (
                <FooterLink
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                >
                  {category.name}
                </FooterLink>
              ))
            ) : (
              <FooterLink href="/products">
                Browse categories
              </FooterLink>
            )}
          </FooterColumn>

          {/* Company */}
          <FooterColumn title="Company">
            {companyLinks.map((link) => (
              <FooterLink
                key={link.href}
                href={link.href}
              >
                {link.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        {/* Bottom footer */}
        <div className="flex flex-col gap-4 border-t border-blue-100 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} DenTool. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link
              href="/contact"
              className="transition hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              Need help?
            </Link>

            <Link
              href="/about"
              className="transition hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              Our standards
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-bold text-slate-950">
        {title}
      </h2>

      <ul className="mt-5 space-y-3">
        {children}
      </ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-slate-600 transition hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
      >
        {children}
      </Link>
    </li>
  );
}

function TrustItem({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        {icon}
      </span>

      <div>
        <h2 className="text-sm font-bold text-slate-950">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-5 text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}

function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="16"
      height="16"
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

function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="19"
      height="19"
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

function TruckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h11v11H3z" />
      <path d="M14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="19" r="1.5" />
      <circle cx="18" cy="19" r="1.5" />
    </svg>
  );
}

function MessageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      width="19"
      height="19"
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