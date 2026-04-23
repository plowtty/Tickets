export type Role = 'ADMIN' | 'AGENT' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthPayload {
  user: User;
  accessToken: string;
}
