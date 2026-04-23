import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { LoginInput, RegisterInput, User } from '../types';
import { tokenStorage } from '../services/api';
import { getErrorMessage } from '../utils/getErrorMessage';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  initialized: boolean;
  error: string | null;
  login: (payload: LoginInput) => Promise<void>;
  register: (payload: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
  clearError: () => void;
};

const normalizeError = (error: unknown) => getErrorMessage(error, 'Ocurrió un error inesperado');

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: tokenStorage.get(),
  isLoading: false,
  initialized: false,
  error: null,

  async login(payload) {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.login(payload);
      tokenStorage.set(result.accessToken);
      set({ user: result.user, accessToken: result.accessToken, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: normalizeError(error) });
      throw error;
    }
  },

  async register(payload) {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.register(payload);
      tokenStorage.set(result.accessToken);
      set({ user: result.user, accessToken: result.accessToken, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: normalizeError(error) });
      throw error;
    }
  },

  async logout() {
    try {
      await authService.logout();
    } finally {
      tokenStorage.clear();
      set({ user: null, accessToken: null, isLoading: false, error: null });
    }
  },

  async bootstrap() {
    set({ isLoading: true, initialized: true, error: null });
    try {
      const token = tokenStorage.get();
      if (!token) {
        set({ user: null, accessToken: null, isLoading: false });
        return;
      }

      const me = await authService.me();
      set({ user: me, accessToken: tokenStorage.get(), isLoading: false });
    } catch {
      tokenStorage.clear();
      set({ user: null, accessToken: null, isLoading: false, error: null });
    }
  },

  clearError() {
    set({ error: null });
  },
}));
