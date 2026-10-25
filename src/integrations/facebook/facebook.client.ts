import axios from 'axios';
import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';

// Create pre-configured Axios instance for Meta Graph API calls
export const fbClient = axios.create({
  baseURL: 'https://graph.facebook.com/v18.0',
  params: {
    access_token: env.FACEBOOK_PAGE_ACCESS_TOKEN,
  },
});

fbClient.interceptors.response.use(
  (response) => response,
  (error) => {
    logger.error('Meta Graph API request failure:', {
      status: error.response?.status,
      data: error.response?.data || error.message,
    });
    return Promise.reject(error);
  }
);
