import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user: User, token: string) => {
        // Also sync separate localStorage keys for direct access compatibility
        try {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        } catch {
          // ignore storage error
        }

        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch {
          // ignore storage error
        }

        set({
          user: null,
          token: null,
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
        if (state.token && state.user) {
          set({ isAuthenticated: true });
        } else {
          // Try restoring from fallback localStorage keys if needed
          const fallbackToken = localStorage.getItem('token');
          const fallbackUser = localStorage.getItem('user');
          if (fallbackToken && fallbackUser) {
            try {
              const parsedUser = JSON.parse(fallbackUser);
              set({
                token: fallbackToken,
                user: parsedUser,
                isAuthenticated: true,
              });
            } catch {
              set({ user: null, token: null, isAuthenticated: false });
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
