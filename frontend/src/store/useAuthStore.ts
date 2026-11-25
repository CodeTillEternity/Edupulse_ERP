import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isTauriDesktop, invoke, axiosClient } from '../api/axiosClient';

export interface User {
  username: string;
  role: string;
  permissions: string[];
  tenantId?: string;
  tenantStatus?: string;
  email?: string;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  tenantId: string | null;
  tenantStatus: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (
    token: string,
    refreshToken: string,
    user: User,
    explicitTenantId?: string | null,
    explicitTenantStatus?: string | null
  ) => void;
  logout: () => Promise<void>;
  bootstrapSession: () => Promise<void>;
  setTenantStatus: (status: string | null) => void;
}

export function parseJwtClaims(token: string): Record<string, any> {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return {};
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      tenantId: null,
      tenantStatus: null,
      isAuthenticated: false,
      isInitializing: isTauriDesktop(), // Desktop starts in initializing state to query DPAPI vault

      setTenantStatus: (status) => set({ tenantStatus: status }),

      login: (token, refreshToken, user, explicitTenantId, explicitTenantStatus) => {
        const claims = parseJwtClaims(token);
        const tenantId =
          explicitTenantId ||
          user?.tenantId ||
          claims.tenant_id ||
          claims.tenantId ||
          null;
        const tenantStatus =
          explicitTenantStatus ||
          user?.tenantStatus ||
          claims.tenant_status ||
          claims.tenantStatus ||
          null;
        const sanitizedUser: User = {
          username: user.username || 'admin',
          role: (user.role || 'ADMIN').toUpperCase().replace(/^ROLE_/, ''),
          permissions: user.permissions || [],
          tenantId: tenantId || undefined,
          tenantStatus: tenantStatus || undefined,
          email: user.email,
        };
        set({
          token,
          refreshToken,
          user: sanitizedUser,
          tenantId,
          tenantStatus,
          isAuthenticated: true,
          isInitializing: false,
        });
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
              let res: any;
              try {
                // Primary: /auth/session endpoint returns SessionResponse { username, role, permissions, active }
                res = await axiosClient.get('/auth/session', {
                  headers: { Authorization: `Bearer ${accessToken}` },
                });
              } catch {
                // Secondary fallback: /auth/me returns { username, authorities: ["ROLE_..."] }
                res = await axiosClient.get('/auth/me', {
                  headers: { Authorization: `Bearer ${accessToken}` },
                });
              }

              const existingUser = get().user;
              let extractedRole = res.data.role;

              if (!extractedRole && Array.isArray(res.data.authorities)) {
                const roleAuth = res.data.authorities.find((a: string) => a.startsWith('ROLE_'));
                if (roleAuth) {
                  extractedRole = roleAuth.replace('ROLE_', '');
                }
              }

              if (!extractedRole) {
                extractedRole = existingUser?.role || 'ADMIN';
              }

              const extractedPermissions = res.data.permissions 
                || (Array.isArray(res.data.authorities) ? res.data.authorities.filter((a: string) => !a.startsWith('ROLE_')) : null)
                || existingUser?.permissions 
                || [];

              const userData: User = {
                username: res.data.username || existingUser?.username || 'User',
                role: extractedRole,
                permissions: extractedPermissions,
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

                  const existingUser = get().user;
                  let refRole = refreshRes.data.role;
                  if (!refRole && Array.isArray(refreshRes.data.authorities)) {
                    const roleAuth = refreshRes.data.authorities.find((a: string) => a.startsWith('ROLE_'));
                    if (roleAuth) refRole = roleAuth.replace('ROLE_', '');
                  }
                  if (!refRole) refRole = existingUser?.role || 'ADMIN';

                  set({
                    token: newAccess,
                    refreshToken: newRefresh,
                    user: {
                      username: refreshRes.data.username || existingUser?.username || 'User',
                      role: refRole,
                      permissions: refreshRes.data.permissions || existingUser?.permissions || [],
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
      onRehydrateStorage: () => (state) => {
        if (state?.user && !state.user.role) {
          state.user.role = 'ADMIN';
        }
      },
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
