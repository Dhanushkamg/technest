import { create } from 'zustand';

interface CartState {
  cartItemCount: number;
  updateCount: (count: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartItemCount: 0,
  updateCount: (count: number) => set({ cartItemCount: Math.max(0, count) }),
  clearCart: () => set({ cartItemCount: 0 }),
}));

export default useCartStore;
