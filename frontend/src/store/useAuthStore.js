// src/store/useAuthStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,

      // Actions
      setAuth: (userData, accessToken) =>
        set({
          user: userData,
          token: accessToken,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'dfs-auth-storage', // This saves our state to localStorage automatically
    }
  )
);
