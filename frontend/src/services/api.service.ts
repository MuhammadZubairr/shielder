/**
 * Axios API Client
 * Configured Axios instance with interceptors
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS } from '@/utils/constants';
import type { ApiResponse, ApiError } from '@/types';

/**
 * Create Axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL.endsWith('/') ? API_CONFIG.BASE_URL : `${API_CONFIG.BASE_URL}/`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Adds auth token to all requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Debug log in development or if suspected URL issue
    console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    // Get token from localStorage
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add locale to headers
    const locale = localStorage.getItem(STORAGE_KEYS.LOCALE) || 'en';
    config.headers['Accept-Language'] = locale;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles errors and token refresh
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Response interceptor should handle 401s except for auth endpoints
    const url = originalRequest.url || '';
    const isAuthEndpoint = url.includes('auth/login') || 
                          url.includes('auth/signup') || 
                          url.includes('auth/refresh') ||
                          url.includes('auth/verify-email');

    // If error is 401 and we haven't retried yet and it's not an auth login/signup
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      try {
        // Get refresh token
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
          console.warn('[API] No refresh token found during 401 recovery');
          throw new Error('No refresh token');
        }

        // Refresh the token - ensure Slash between BASE_URL and endpoint
        const refreshUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.BASE_URL.endsWith('/') ? '' : '/'}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`;
        
        const response = await axios.post(
          refreshUrl,
          { refreshToken: refreshToken.replace(/"/g, '') }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Store new tokens
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        if (newRefreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
        }

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);

        // Only redirect if specifically a refresh failure, not a random 401 that couldn't refresh
        if (typeof window !== 'undefined' && !url.includes('auth/me')) {
          window.location.href = '/login?expired=true';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API Error Handler
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    if (axiosError.message) {
      return axiosError.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

export default apiClient;
