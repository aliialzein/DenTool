export const PRODUCT_CACHE_TTL_SECONDS = 300;

export const getProductBySlugCacheKey = (slug: string): string =>
  `products:slug:${slug}`;
