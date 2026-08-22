import Link from 'next/link';

interface FooterProps {
  categories?: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export function Footer({ categories = [] }: FooterProps) {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* About DenTool */}
          <div>
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-gray-900"
            >
              Den<span className="text-blue-600">Tool</span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-gray-500">
              Dental tools and materials for dentists, dentistry students,
              laboratory students, and dental professionals.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Products</h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Categories
            </h3>

            <ul className="mt-4 space-y-3">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/products?category=${category.slug}`}
                      className="text-sm text-gray-500 hover:text-blue-600"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link
                    href="/products"
                    className="text-sm text-gray-500 hover:text-blue-600"
                  >
                    Browse Categories
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* About / Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>

            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} DenTool. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}