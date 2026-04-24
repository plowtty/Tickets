import { api } from './api';
import { ApiResponse, User, Role } from '../types';

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: Role;
  active?: boolean;
  avatar?: string | null;
}

export interface UpdateUserPayload {
  role?: Role;
  active?: boolean;
  name?: string;
}

export const userService = {
  async create(payload: CreateUserPayload) {
    const { data } = await api.post<ApiResponse<User>>('/users', payload);
    return data.data;
  },
  async list() {
    const { data } = await api.get<ApiResponse<User[]>>('/users');
    return data.data;
  },
  async update(id: string, payload: UpdateUserPayload) {
    const { data } = await api.patch<ApiResponse<User>>(`/users/${id}`, payload);
    return data.data;
  },
  async remove(id: string) {
    await api.delete(`/users/${id}`);
  },
};
