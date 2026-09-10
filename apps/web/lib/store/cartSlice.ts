import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { CartState } from '@/types/cart';

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (
      state,
      action: PayloadAction<{
        productId: string;
        selectedOptionValueIds?: string[];
      }>,
    ) => {
      const existingItem = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.selectedOptionValueIds.join(',') ===
            [...(action.payload.selectedOptionValueIds ?? [])].sort().join(','),
      );

      if (existingItem) {
        existingItem.quantity += 1;
        return;
      }

      state.items.push({
        productId: action.payload.productId,
        quantity: 1,
        selectedOptionValueIds: [...(action.payload.selectedOptionValueIds ?? [])].sort(),
      });
    },

    removeItem: (
      state,
      action: PayloadAction<{ productId: string; selectedOptionValueIds?: string[] }>,
    ) => {
      state.items = state.items.filter(
        (item) =>
          !sameCartConfiguration(item, action.payload.productId, action.payload.selectedOptionValueIds),
      );
    },

    updateQuantity: (
      state,
      action: PayloadAction<{
        productId: string;
        selectedOptionValueIds?: string[];
        quantity: number;
      }>,
    ) => {
      const item = state.items.find(
        (item) => sameCartConfiguration(item, action.payload.productId, action.payload.selectedOptionValueIds),
      );

      if (!item) {
        return;
      }

      const quantity = Number.isFinite(action.payload.quantity)
        ? Math.floor(action.payload.quantity)
        : 1;

      item.quantity = Math.max(1, quantity);
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

function sameCartConfiguration(
  item: { productId: string; selectedOptionValueIds?: string[] },
  productId: string,
  selectedOptionValueIds: string[] = [],
) {
  return item.productId === productId &&
    (item.selectedOptionValueIds ?? []).join(',') === [...selectedOptionValueIds].sort().join(',');
}

export const {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;