import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * Checks whether the application is running inside the Tauri desktop shell.
 */
export const isTauriDesktop = (): boolean => {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
};

/**
 * Safe invoke abstraction complying with P6.1 runtime adapter rules.
 * Leverages window.__TAURI__.core.invoke (enabled via withGlobalTauri) or dynamic loading,
 * preventing browser builds from failing module resolution when @tauri-apps/api is absent.
 */
export const invoke = async <T = unknown>(cmd: string, args?: Record<string, unknown>): Promise<T | null> => {
  const win = typeof window !== 'undefined' ? (window as any) : undefined;
  if (win?.__TAURI__?.core?.invoke) {
    return win.__TAURI__.core.invoke(cmd, args);
  }
  if (isTauriDesktop()) {
    try {
      // @ts-ignore
      const tauri = await import(/* @vite-ignore */ '@tauri-apps/api/core');
      return tauri.invoke(cmd, args);
    } catch {
      // desktop fallback
    }
  }
  return null;
};

/**
 * Resolves and strictly validates the API Base URL based on environment.
 * Complies with P4.1: Production desktop builds reject insecure HTTP or localhost fallbacks.
 */
export const resolveBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/$/, '');
    if (import.meta.env.PROD && isTauriDesktop()) {
      if (!cleanUrl.startsWith('https://')) {
        console.error('[axiosClient] Insecure HTTP base URL rejected in production desktop:', cleanUrl);
        throw new Error('Insecure HTTP base URL rejected in production desktop edition');
      }
    }
    return cleanUrl;
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:8081';
  }

  // Web production default (served behind reverse proxy)
  return '';
};

/**
 * Axios instance for EduPulse ERP Desktop.
 * Base URL is strictly driven by Vite environment variable VITE_API_BASE_URL.
 */
export const axiosClient: AxiosInstance = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Asynchronously retrieves the JWT from the native Rust DPAPI vault via Tauri IPC (get_secure_token)
 * instead of reading from insecure browser localStorage.
 * Injects request correlation ID (X-Correlation-Id) for distributed traceability (P4.2).
 */
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      let token: string | null = null;

      if (isTauriDesktop()) {
        // Query Rust-native DPAPI credential vault via Tauri IPC
        token = await invoke<string>('get_secure_token');
      } else {
        // Fallback for non-Tauri web development environment
        token = localStorage.getItem('auth_token');
      }

      if (config.headers) {
        if (!config.headers['X-Correlation-Id']) {
          const correlationId = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          config.headers['X-Correlation-Id'] = correlationId;
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('[axiosClient] Failed to retrieve secure token from native vault:', error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Concurrency mutex queue to prevent parallel 401 refresh token-family races (P3.3)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response Interceptor:
 * Serializes concurrent 401 token refresh attempts to prevent refresh-token family reuse detection.
 */
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        let refreshToken: string | null = null;
        if (isTauriDesktop()) {
          const tokens = await invoke<{ access_token: string; refresh_token?: string }>('get_account_tokens');
          refreshToken = tokens?.refresh_token || null;
        } else {
          refreshToken = localStorage.getItem('refresh_token');
        }

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await axios.post(`${axiosClient.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = data.accessToken || data.token;
        const newRefreshToken = data.refreshToken;

        // Persist rotated credentials into native Windows Credential Manager
        if (isTauriDesktop()) {
          await invoke('store_account_tokens', {
            account: data.username || 'default_user',
            tokens: {
              access_token: newAccessToken,
              refresh_token: newRefreshToken,
            },
          });
        } else {
          localStorage.setItem('auth_token', newAccessToken);
          if (newRefreshToken) localStorage.setItem('refresh_token', newRefreshToken);
        }

        processQueue(null, newAccessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        if (isTauriDesktop()) {
          await invoke('clear_account_tokens');
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
