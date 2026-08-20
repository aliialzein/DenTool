import type {
  Product,
  ProductListParams,
  ProductsResponse,
} from '../../types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not configured');
}

function buildQueryString(params: ProductListParams = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set('search', params.search);
  }

  if (params.categoryId) {
    searchParams.set('category', params.categoryId);
  }

  if (params.isAvailable !== undefined) {
    searchParams.set('availability', String(params.isAvailable));
  }

  if (params.minPrice !== undefined) {
    searchParams.set('minPrice', String(params.minPrice));
  }

  if (params.maxPrice !== undefined) {
    searchParams.set('maxPrice', String(params.maxPrice));
  }

  if (params.sortBy) {
    searchParams.set('sortBy', params.sortBy);
  }

  if (params.sortOrder) {
    searchParams.set('sortOrder', params.sortOrder);
  }

  if (params.page !== undefined) {
    searchParams.set('page', String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set('limit', String(params.limit));
  }

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getProducts(
  params?: ProductListParams,
): Promise<ProductsResponse> {
  const query = buildQueryString(params);

  const response = await fetch(`${API_URL}/products${query}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<ProductsResponse>(response);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product> {
  const response = await fetch(
    `${API_URL}/products/${encodeURIComponent(slug)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  return handleResponse<Product>(response);
}