import { api } from './api';
import { ApiResponse, AuthPayload, LoginInput, RegisterInput, User } from '../types';

export const authService = {
  async login(payload: LoginInput) {
    const { data } = await api.post<ApiResponse<AuthPayload>>('/auth/login', payload);
    return data.data;
  },

  async register(payload: RegisterInput) {
    const { data } = await api.post<ApiResponse<AuthPayload>>('/auth/register', payload);
    return data.data;
  },

  async me() {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },

  async refresh() {
    const { data } = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
    return data.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },
};
