import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, jest } from '@jest/globals';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { SessionGuard } from '../auth/guards/session.guard';

describe('ProductsController', () => {
  it('forwards the static by-ids query to the service', async () => {
    const products = [{ id: 'product-1' }];
    const productsService = {
      findMany: jest.fn(),
      findByIds: jest
        .fn<(query: { ids: string[] }) => Promise<typeof products>>()
        .mockResolvedValue(products),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: productsService }],
    })
      .overrideGuard(SessionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const controller = module.get<ProductsController>(ProductsController);

    await expect(controller.findByIds({ ids: ['product-1'] })).resolves.toEqual(
      products,
    );
    expect(productsService.findByIds).toHaveBeenCalledWith({
      ids: ['product-1'],
    });
  });
});
