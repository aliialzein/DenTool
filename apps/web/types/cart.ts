export interface CartItem {
  productId: string;
  quantity: number;
  selectedOptionValueIds: string[];
}

export interface CartState {
  items: CartItem[];
}