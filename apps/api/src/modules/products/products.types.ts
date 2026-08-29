import { ProductWithRelations } from './repositories/products.repositories';

export type ProductResponse = Omit<ProductWithRelations, 'price'> & {
  price: number;
};
