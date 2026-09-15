import axiosClient from './axiosClient';
import type {
  Address,
  AddressRequest,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  User,
} from '../types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout');
  },

  verifyEmail: async (token: string): Promise<void> => {
    await axiosClient.get(`/auth/verify-email?token=${token}`);
  },

  forgotPassword: async (email: string): Promise<void> => {
    await axiosClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await axiosClient.post('/auth/reset-password', { token, newPassword });
  },

  getProfile: async (): Promise<User> => {
    const response = await axiosClient.get<User>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await axiosClient.put<User>('/users/profile', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await axiosClient.put('/users/security/password', data);
  },

  getAddresses: async (): Promise<Address[]> => {
    const response = await axiosClient.get<Address[]>('/addresses');
    return response.data;
  },

  addAddress: async (data: AddressRequest): Promise<Address> => {
    const response = await axiosClient.post<Address>('/addresses', data);
    return response.data;
  },

  updateAddress: async (id: number, data: AddressRequest): Promise<Address> => {
    const response = await axiosClient.put<Address>(`/addresses/${id}`, data);
    return response.data;
  },

  deleteAddress: async (id: number): Promise<void> => {
    await axiosClient.delete(`/addresses/${id}`);
  },
};

export default authApi;
