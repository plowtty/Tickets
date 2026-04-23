import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const initialized = useAuthStore((state) => state.initialized);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    user,
    isLoading,
    initialized,
    error,
    login,
    register,
    logout,
    bootstrap,
    clearError,
    isAuthenticated: Boolean(user),
  };
};
