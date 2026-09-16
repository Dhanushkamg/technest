import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (user: User) => {
        // Also sync separate localStorage keys for direct access compatibility
        try {
          localStorage.setItem('user', JSON.stringify(user));
        } catch {
          // ignore storage error
        }

        set({
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        try {
          localStorage.removeItem('user');
        } catch {
          // ignore storage error
        }

        set({
          user: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        try {
          localStorage.setItem('user', JSON.stringify(user));
        } catch {
          // ignore
        }
        set({ user });
      },

      initializeAuth: () => {
        const state = get();
        if (state.user) {
          set({ isAuthenticated: true });
        } else {
          // Try restoring from fallback localStorage keys if needed
          const fallbackUser = localStorage.getItem('user');
          if (fallbackUser) {
            try {
              const parsedUser = JSON.parse(fallbackUser);
              set({
                user: parsedUser,
                isAuthenticated: true,
              });
            } catch {
              set({ user: null, isAuthenticated: false });
            }
          } else {
            set({ isAuthenticated: false });
          }
        }
      },
    }),
    {
      name: 'technest_auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
