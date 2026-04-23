import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types';

const ACCESS_TOKEN_KEY = 'tickets_access_token';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<string> | null = null;

const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

const isAuthRequest = (url?: string) => {
  if (!url) {
    return false;
  }

  return authEndpoints.some((endpoint) => url.includes(endpoint));
};

const getDefaultApiErrorMessage = (status?: number) => {
  if (!status) {
    return 'No hay conexión con el servidor';
  }

  if (status >= 500) {
    return 'Error interno del servidor';
  }

  if (status === 401) {
    return 'No autorizado';
  }

  if (status === 403) {
    return 'No tienes permisos para esta acción';
  }

  if (status === 404) {
    return 'Recurso no encontrado';
  }

  if (status === 422) {
    return 'Datos inválidos';
  }

  return 'Ocurrió un error inesperado';
};

const handleSessionExpired = () => {
  tokenStorage.clear();

  if (window.location.pathname !== '/login') {
    window.location.assign('/login?reason=session-expired');
  }
};

const getFreshToken = async () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post<ApiResponse<{ accessToken: string }>>('/auth/refresh')
      .then(({ data }) => {
        const nextToken = data.data.accessToken;
        tokenStorage.set(nextToken);
        return nextToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const config = error.config as RetryableRequestConfig | undefined;

    if (!error.response) {
      error.message = getDefaultApiErrorMessage();
      return Promise.reject(error);
    }

    if (status === 401 && config && !config._retry && !isAuthRequest(config.url)) {
      config._retry = true;

      try {
        const token = await getFreshToken();
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
        return api(config);
      } catch {
        handleSessionExpired();
        error.message = 'Tu sesión expiró. Inicia sesión nuevamente.';
        return Promise.reject(error);
      }
    }

    if (status === 401 && isAuthRequest(config?.url)) {
      tokenStorage.clear();
    }

    error.message = error.response.data?.message ?? error.message ?? getDefaultApiErrorMessage(status);
    return Promise.reject(error);
  }
);

export const tokenStorage = {
  key: ACCESS_TOKEN_KEY,
  set(token: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  get() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
