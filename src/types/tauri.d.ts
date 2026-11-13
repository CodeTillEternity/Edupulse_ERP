declare module '@tauri-apps/api/core' {
  export function invoke<T = unknown>(cmd: string, args?: Record<string, unknown>): Promise<T>;
}

export interface VaultSessionTokens {
  access_token: string;
  refresh_token?: string | null;
}

interface Window {
  __TAURI_INTERNALS__?: Record<string, unknown>;
  __TAURI__?: {
    core?: {
      invoke<T = unknown>(cmd: string, args?: Record<string, unknown>): Promise<T>;
    };
  };
}
