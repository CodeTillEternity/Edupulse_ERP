import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { invoke } from '@tauri-apps/api/core';

/**
 * Checks whether the application is running inside the Tauri desktop shell.
 */
export const isTauriDesktop = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

/**
 * Axios instance for EduPulse ERP Desktop.
 * Base URL is strictly driven by Vite environment variable VITE_API_BASE_URL.
 */
export const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8081/api' : '/api'),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Asynchronously retrieves the JWT from the native Rust DPAPI vault via Tauri IPC (get_secure_token)
 * instead of reading from insecure browser localStorage.
 */
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      let token: string | null = null;

      if (isTauriDesktop()) {
        // Query Rust-native DPAPI credential vault via Tauri IPC
        token = await invoke<string | null>('get_secure_token');
      } else {
        // Fallback for non-Tauri web development environment
        token = localStorage.getItem('auth_token');
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[axiosClient] Failed to retrieve secure token from native vault:', error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Standard error logging and propagation.
 */
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[axiosClient] 401 Unauthorized encountered. Vaulted token may be expired or revoked.');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
