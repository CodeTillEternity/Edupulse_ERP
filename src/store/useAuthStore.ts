import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isTauriDesktop, invoke, axiosClient } from '../api/axiosClient';

export interface User {
  username: string;
  role: string;
  permissions: string[];
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => Promise<void>;
  bootstrapSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isInitializing: isTauriDesktop(), // Desktop starts in initializing state to query DPAPI vault

      login: (token, refreshToken, user) => {
        set({ token, refreshToken, user, isAuthenticated: true, isInitializing: false });
      },

      logout: async () => {
        const state = get();
        try {
          // 1. Notify backend server to invalidate active session
          if (state.token) {
            await axiosClient.post('/auth/logout', {}).catch(() => {});
          }
        } catch {
          // Offline logout fallback: continue local teardown
        }

        // 2. Clear credentials from Windows Credential Manager in desktop mode
        if (isTauriDesktop()) {
          try {
            await invoke('clear_account_tokens');
          } catch (err) {
            console.error('[useAuthStore] Failed to clear native vault tokens:', err);
          }
        } else {
          // Clear web fallback storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        }

        // 3. Clear in-memory state
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isInitializing: false,
        });
      },

      bootstrapSession: async () => {
        if (!isTauriDesktop()) {
          // In web mode, zustand persist already restored from localStorage
          set({ isInitializing: false });
          return;
        }

        try {
          // Asynchronously query the Windows DPAPI vault on startup
          const tokens = await invoke<{ access_token: string; refresh_token?: string | null }>('get_account_tokens');
          
          if (tokens?.access_token) {
            const accessToken = tokens.access_token;
            const refreshToken = tokens.refresh_token || '';

            // Attempt to validate session against backend
            try {
              const res = await axiosClient.get('/auth/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              const userData: User = {
                username: res.data.username,
                role: res.data.role,
                permissions: res.data.permissions || [],
              };
              set({
                token: accessToken,
                refreshToken: refreshToken,
                user: userData,
                isAuthenticated: true,
                isInitializing: false,
              });
              return;
            } catch (apiErr: any) {
              // If access token is expired (401), attempt refresh token rotation
              if (apiErr.response?.status === 401 && refreshToken) {
                try {
                  const refreshRes = await axiosClient.post('/auth/refresh', {
                    refreshToken,
                  });
                  const newAccess = refreshRes.data.accessToken || refreshRes.data.token;
                  const newRefresh = refreshRes.data.refreshToken || refreshToken;
                  
                  // Vault rotated tokens back to DPAPI
                  await invoke('store_account_tokens', {
                    account: refreshRes.data.username || 'default_user',
                    tokens: {
                      access_token: newAccess,
                      refresh_token: newRefresh,
                    },
                  });

                  set({
                    token: newAccess,
                    refreshToken: newRefresh,
                    user: {
                      username: refreshRes.data.username,
                      role: refreshRes.data.role,
                      permissions: refreshRes.data.permissions || [],
                    },
                    isAuthenticated: true,
                    isInitializing: false,
                  });
                  return;
                } catch {
                  // Refresh token expired or revoked on server
                  await invoke('clear_account_tokens').catch(() => {});
                }
              }
            }
          }
        } catch (vaultErr) {
          console.error('[useAuthStore] Startup DPAPI session bootstrap failed:', vaultErr);
        }

        // Vault empty or invalid -> require explicit login
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          isInitializing: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => {
        // Enforce Rule: Zero token persistence in browser localStorage when in desktop mode (P2.1)
        if (isTauriDesktop()) {
          return {
            user: state.user,
          };
        }
        return {
          token: state.token,
          refreshToken: state.refreshToken,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        };
      },
    }
  )
);
