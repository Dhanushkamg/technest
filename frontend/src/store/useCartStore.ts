import { create } from 'zustand';

interface CartState {
  cartItemCount: number;
  isMiniCartOpen: boolean;
  updateCount: (count: number) => void;
  clearCart: () => void;
  openMiniCart: () => void;
  closeMiniCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartItemCount: 0,
  isMiniCartOpen: false,
  updateCount: (count: number) => set({ cartItemCount: Math.max(0, count) }),
  clearCart: () => set({ cartItemCount: 0 }),
  openMiniCart: () => set({ isMiniCartOpen: true }),
  closeMiniCart: () => set({ isMiniCartOpen: false }),
}));

export default useCartStore;
