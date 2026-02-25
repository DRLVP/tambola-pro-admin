import { envConfig } from '@/lib/envConfig';
import axios, { type InternalAxiosRequestConfig } from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: envConfig.apiBaseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store for the getToken function from Clerk
let getTokenFn: (() => Promise<string | null>) | null = null;

/**
 * Set the getToken function from Clerk
 * This should be called once when the app initializes
 */
export const setAuthTokenGetter = (fn: () => Promise<string | null>) => {
  getTokenFn = fn;
};

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 1. Always send Admin Role header
    // 1. Removed X-Role header to fix CORS error (backend should verify role via token)
    // config.headers['X-Role'] = 'admin';


    // 2. Inject Clerk Token if available
    if (getTokenFn) {
      try {
        const token = await getTokenFn();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to get Clerk token:', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Simplified (let Router/UI handle 401s)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
