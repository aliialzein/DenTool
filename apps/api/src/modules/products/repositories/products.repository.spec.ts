import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { ProductsRepository } from './products.repositories';

describe('ProductsRepository', () => {
  let repository: ProductsRepository;

  const productFindMany: any = jest.fn();
  const productCount: any = jest.fn();
  const transaction: any = jest.fn();

  const prisma = {
    product: {
      findMany: productFindMany,
      count: productCount,
    },
    $transaction: transaction,
  } as const;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new ProductsRepository(prisma as never);
  });

  it('fetches products and total count without opening a database transaction', async () => {
    const items = [{ id: 'product-1', name: 'Dental Mirror' }];

    productFindMany.mockResolvedValue(items);
    productCount.mockResolvedValue(1);

    const result = await repository.findMany({
      page: 1,
      limit: 20,
    });

    expect(productFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
        include: expect.objectContaining({
          category: expect.objectContaining({
            select: { id: true, name: true, slug: true },
          }),
          images: expect.objectContaining({
            orderBy: { sortOrder: 'asc' },
          }),
        }),
      }),
    );
    expect(productCount).toHaveBeenCalledWith({
      where: {},
    });
    expect(transaction).not.toHaveBeenCalled();
    expect(result).toEqual({ items, total: 1 });
  });
});
