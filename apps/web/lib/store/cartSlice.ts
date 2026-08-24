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
      action: PayloadAction<{ productId: string }>,
    ) => {
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId,
      );

      if (existingItem) {
        existingItem.quantity += 1;
        return;
      }

      state.items.push({
        productId: action.payload.productId,
        quantity: 1,
      });
    },

    removeItem: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload,
      );
    },

    updateQuantity: (
      state,
      action: PayloadAction<{
        productId: string;
        quantity: number;
      }>,
    ) => {
      const item = state.items.find(
        (item) => item.productId === action.payload.productId,
      );

      if (!item) {
        return;
      }

      item.quantity = Math.max(1, Math.floor(action.payload.quantity));
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;