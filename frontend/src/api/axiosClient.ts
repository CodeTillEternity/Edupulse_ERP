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
  return null;
};

/**
 * Safely launches a URL in the user's default system browser (Chrome/Edge/etc.).
 * Uses Tauri native command in desktop mode, falling back to window.open.
 */
export const openExternalUrl = async (url: string): Promise<void> => {
  if (isTauriDesktop()) {
    try {
      const res = await invoke('open_external_url', { url });
      if (res !== null) return;
    } catch (err) {
      console.warn('[Desktop Shell] Failed to invoke open_external_url, falling back to window.open:', err);
    }
  }
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Resolves the API Base URL based on environment.
 * In desktop mode, checks for administrator configured server endpoint in localStorage first,
 * then falls back to VITE_API_BASE_URL, and finally defaults to local sidecar http://localhost:8081.
 */
export const resolveBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('edupulse_server_url');
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/$/, '');
    }
  }
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }
  return isTauriDesktop() || import.meta.env.DEV ? 'http://localhost:8081' : '/api';
};

export const getBaseURL = resolveBaseUrl;

/**
 * Resolves the multi-tenant identifier (e.g., 'arya-main', 'default', 'campus-01').
 */
export const resolveTenantId = (): string => {
  if (typeof window !== 'undefined') {
    const tenant = localStorage.getItem('edupulse_tenant_id');
    if (tenant && tenant.trim()) {
      return tenant.trim();
    }
  }
  return 'default';
};

/**
 * Updates the active server endpoint and multi-tenant identifier at runtime.
 */
export const setServerConfiguration = (url: string, tenantId?: string) => {
  const cleanUrl = url.trim().replace(/\/$/, '');
  localStorage.setItem('edupulse_server_url', cleanUrl);
  axiosClient.defaults.baseURL = cleanUrl;
  if (tenantId !== undefined) {
    localStorage.setItem('edupulse_tenant_id', tenantId.trim());
  }
};

/**
 * Clears custom server configuration and resets to default endpoint.
 */
export const resetServerConfiguration = () => {
  localStorage.removeItem('edupulse_server_url');
  localStorage.removeItem('edupulse_tenant_id');
  axiosClient.defaults.baseURL = resolveBaseUrl();
};

/**
 * Tests reachability and measures response latency to a target backend endpoint.
 */
export const testServerConnection = async (
  targetUrl: string,
  timeoutMs = 5000
): Promise<{ ok: boolean; status?: number; latencyMs: number; message: string }> => {
  const cleanUrl = targetUrl.trim().replace(/\/$/, '');
  const startTime = performance.now();

  try {
    const res = await axios.get(`${cleanUrl}/api/health`, {
      timeout: timeoutMs,
      validateStatus: () => true,
      headers: { 'Cache-Control': 'no-cache' },
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (res.status >= 200 && res.status < 400) {
      return {
        ok: true,
        status: res.status,
        latencyMs,
        message: `Connected successfully (${latencyMs}ms)`,
      };
    } else if (res.status === 401 || res.status === 403 || res.status === 404) {
      return {
        ok: true,
        status: res.status,
        latencyMs,
        message: `Endpoint reached (HTTP ${res.status} • ${latencyMs}ms)`,
      };
    } else {
      return {
        ok: false,
        status: res.status,
        latencyMs,
        message: `Server returned HTTP ${res.status}`,
      };
    }
  } catch (err: any) {
    try {
      const fallback = await axios.get(`${cleanUrl}/auth/session`, {
        timeout: Math.max(1500, timeoutMs - 1500),
        validateStatus: () => true,
      });
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        ok: true,
        status: fallback.status,
        latencyMs,
        message: `Endpoint reached (HTTP ${fallback.status} • ${latencyMs}ms)`,
      };
    } catch {
      const latencyMs = Math.round(performance.now() - startTime);
      const isTimeout = err?.code === 'ECONNABORTED' || err?.message?.toLowerCase().includes('timeout');
      return {
        ok: false,
        latencyMs,
        message: isTimeout ? 'Connection timed out' : 'Server endpoint unreachable',
      };
    }
  }
};

/**
 * Axios instance for EduPulse ERP Desktop.
 * Base URL dynamically checks runtime config, Vite env, or local sidecar.
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
 * Injects multi-tenant partition header (X-Tenant-Id) for SaaS routing.
 */
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Synchronize baseURL dynamically with current configuration
      const activeBase = resolveBaseUrl();
      if (!config.baseURL || config.baseURL === 'http://localhost:8081' || config.baseURL === '') {
        config.baseURL = activeBase;
      }

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

        const tenantId = resolveTenantId();
        if (tenantId && !config.headers['X-Tenant-Id']) {
          config.headers['X-Tenant-Id'] = tenantId;
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
