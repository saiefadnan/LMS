/**
 * Auth Store — Zustand v5
 * 
 * WHY ZUSTAND OVER CONTEXT:
 * 1. No <Provider> wrapper needed — any component can just call useAuthStore()
 * 2. Only re-renders components that use the specific slice of state that changed
 *    (Context re-renders EVERYTHING under the Provider)
 * 3. Built-in persist middleware — JWT survives page refreshes automatically
 * 4. Works perfectly with Next.js App Router + SSR
 * 5. Tiny footprint (~1KB) vs Redux (~7KB)
 * 
 * HOW THE AUTH FLOW WORKS:
 * ┌──────────────────────────────────────────────────────────────┐
 * │  1. User opens app                                          │
 * │  2. Zustand checks localStorage for 'jwt' (via persist)     │
 * │  3. If JWT exists → call /api/users/me to validate it       │
 * │  4. If valid → store user in state, app renders dashboard   │
 * │  5. If invalid/expired → clear JWT, redirect to /login      │
 * │                                                              │
 * │  On Login:                                                   │
 * │  1. POST /api/auth/local with credentials                   │
 * │  2. Strapi returns { jwt, user }                             │
 * │  3. JWT is saved to localStorage (persist middleware)        │
 * │  4. User object is stored in Zustand state                  │
 * │  5. All subscribed components re-render with new user        │
 * │                                                              │
 * │  On Logout:                                                  │
 * │  1. Clear JWT from localStorage                              │
 * │  2. Set user to null in Zustand state                       │
 * │  3. Redirect to /login                                       │
 * └──────────────────────────────────────────────────────────────┘
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { getMe, logout as apiLogout } from '@/lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  hydrated: boolean; // true once Zustand has loaded from localStorage

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      hydrated: false,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setHydrated: (hydrated) => set({ hydrated }),

      refreshUser: async () => {
        try {
          const token =
            typeof window !== 'undefined'
              ? localStorage.getItem('jwt')
              : null;

          if (!token) {
            set({ user: null, loading: false });
            return;
          }

          const userData = await getMe();
          set({ user: userData, loading: false });
        } catch {
          // Token is invalid or expired — clear everything
          apiLogout();
          set({ user: null, loading: false });
        }
      },

      logout: () => {
        apiLogout();
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      // Only persist the user, not loading/hydrated flags
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        // Called after Zustand finishes loading from localStorage
        state?.setHydrated(true);
        // Validate the token against the server
        state?.refreshUser();
      },
    }
  )
);
