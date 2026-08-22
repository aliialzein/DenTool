import type { Category } from '../../types/category';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not configured');
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();

    console.error('API request failed:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      body,
    });

    throw new Error(
      `API request failed with status ${response.status}: ${body}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'GET',
    cache: 'no-store',
  });

  return handleResponse<Category[]>(response);
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category> {
  const response = await fetch(
    `${API_URL}/categories/${encodeURIComponent(slug)}`,
    {
      method: 'GET',
      cache: 'no-store',
    },
  );

  return handleResponse<Category>(response);
}