import { api } from './api';
import { ApiResponse, User, Role } from '../types';

export interface UpdateUserPayload {
  role?: Role;
  active?: boolean;
  name?: string;
}

export const userService = {
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
