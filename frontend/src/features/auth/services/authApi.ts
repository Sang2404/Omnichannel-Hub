import { axiosClient } from '../../../core/api/axiosClient';
import type { User } from '../authSlice';

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    return axiosClient.post('/auth/login', credentials);
  },
  getProfile: async () => {
    return axiosClient.get('/auth/profile');
  },
};
