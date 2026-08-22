import { HomePage } from './home/page';

import { getCategories } from '../lib/api/categories';
import { getProducts } from '../lib/api/products';

export default async function Page() {
  const [categories, productsResponse] = await Promise.all([
    getCategories(),
    getProducts({
      isAvailable: true,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 8,
    }),
  ]);

  return (
    <HomePage
      categories={categories}
      products={productsResponse.items}
    />
  );
}