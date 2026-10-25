import { axiosClient } from '../../../core/api/axiosClient';

export interface FacebookPageItem {
  id: string;
  name: string;
  access_token: string;
  category?: string;
}

export interface FacebookStatusResponse {
  isConnected: boolean;
  page: {
    id: string;
    name: string;
    connectedAt: string;
    verified: boolean;
  } | null;
}

export const facebookPageApi = {
  getPages: async (userAccessToken: string): Promise<any> => {
    return axiosClient.post('/auth/facebook/pages', { userAccessToken });
  },

  connectPage: async (page: { id: string; name: string; accessToken: string }): Promise<any> => {
    return axiosClient.post('/auth/facebook/connect', page);
  },

  getStatus: async (): Promise<any> => {
    return axiosClient.get('/auth/facebook/status');
  },

  disconnectPage: async (): Promise<any> => {
    return axiosClient.post('/auth/facebook/disconnect');
  },
};
