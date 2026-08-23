export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN' | 'USER' | 'ADMIN' | string;

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
}

export interface AuthResponse {
  token: string;
  id?: number;
  userId?: number;
  type?: string;
  name?: string;
  email?: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
}
