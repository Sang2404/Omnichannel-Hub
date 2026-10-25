import axios from 'axios';
import { env } from '../../config/env';
import { logger } from '../../shared/utils/logger';

// Create pre-configured Axios instance for GHN API
export const ghnClient = axios.create({
  baseURL: env.GHN_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Token: env.GHN_API_TOKEN,
  },
});

ghnClient.interceptors.response.use(
  (response) => response,
  (error) => {
    logger.error('GHN API request failure:', {
      status: error.response?.status,
      data: error.response?.data || error.message,
    });
    return Promise.reject(error);
  }
);
