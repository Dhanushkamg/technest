import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types/cart';

interface CartState {
  cartItemCount: number;
  isMiniCartOpen: boolean;
  guestCartItems: CartItem[];
  updateCount: (count: number) => void;
  clearCart: () => void;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  setGuestCartItems: (items: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cartItemCount: 0,
      isMiniCartOpen: false,
      guestCartItems: [],
      updateCount: (count: number) => set({ cartItemCount: Math.max(0, count) }),
      clearCart: () => set({ cartItemCount: 0, guestCartItems: [] }),
      openMiniCart: () => set({ isMiniCartOpen: true }),
      closeMiniCart: () => set({ isMiniCartOpen: false }),
      setGuestCartItems: (items) => set({ guestCartItems: items, cartItemCount: items.reduce((acc, i) => acc + i.quantity, 0) }),
    }),
    {
      name: 'technest-guest-cart',
      partialize: (state) => ({ guestCartItems: state.guestCartItems }),
    }
  )
);

export default useCartStore;
