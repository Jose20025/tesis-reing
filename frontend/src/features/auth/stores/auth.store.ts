import type { UsuarioApp } from '@/features/usuarios/interfaces/usuario.interface';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface StoreState {
  // State
  user: UsuarioApp | null;
  isAuthenticated: boolean;

  // Methods
  login: (userData: UsuarioApp) => void;
  logout: () => void;
}

export const useAuthStore = create<StoreState>()(
  persist(
    (set) => ({
      // State
      user: null,
      isAuthenticated: false,

      // Methods
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
