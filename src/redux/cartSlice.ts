import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type CartItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string; // Add image field for cart items
  category?: string; // Add category for laundry/unstitched distinction
  size?: string; // Add size for unstitched items
  laundryType?: string; // Add laundry type for subcategory (Normal, Dry Clean, etc.)
};

type CartState = {
  cart: CartItem[];
};

const initialState: CartState = {
  cart: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.cart.find((item) => item._id === action.payload._id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.cart.push(action.payload);
      }
    },
    updateQuantity: (state, action: PayloadAction<{ itemId: string; newQuantity: number }>) => {
      const item = state.cart.find((item) => item._id === action.payload.itemId);
      if (item) {
        item.quantity = action.payload.newQuantity;
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter((item) => item._id !== action.payload);
    },
    clearCart: (state) => {
      state.cart = [];
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// Selector for calculating total
export const selectTotal = (state: { cart: CartState }) => 
  state.cart.cart.reduce((total, item) => total + item.price * item.quantity, 0);
