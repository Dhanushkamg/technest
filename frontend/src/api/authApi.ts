import axiosClient from './axiosClient';
import type {
  Address,
  AddressRequest,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
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

  getProfile: async (): Promise<User> => {
    const response = await axiosClient.get<User>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await axiosClient.put<User>('/users/profile', data);
    return response.data;
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
