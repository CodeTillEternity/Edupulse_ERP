import { useState, useEffect, useCallback, useRef } from 'react';
import { axiosClient } from '../api/axiosClient';

export type ConnectivityStatus = 'connected' | 'disconnected' | 'unstable' | 'checking';

export interface ConnectivityState {
  status: ConnectivityStatus;
  isOnline: boolean;
  isBackendReachable: boolean;
  lastChecked: number | null;
  checkNow: () => Promise<boolean>;
}

/**
 * P4.3 Connectivity Detection & Recovery:
 * Tracks backend reachable, unreachable, and unstable states using /api/health probes
 * rather than relying solely on OS navigator.onLine.
 */
export function useConnectivity(checkIntervalMs = 30000): ConnectivityState {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isBackendReachable, setIsBackendReachable] = useState(true);
  const [status, setStatus] = useState<ConnectivityStatus>('checking');
  const [lastChecked, setLastChecked] = useState<number | null>(null);

  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const consecutiveFailuresRef = useRef<number>(0);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      setIsBackendReachable(false);
      setStatus('disconnected');
      setLastChecked(Date.now());
      return false;
    }

    try {
      // Probes backend /api/health with strict 5-second timeout
      await axiosClient.get('/api/health', {
        timeout: 5000,
        headers: { 'Cache-Control': 'no-cache' },
      });

      setIsOnline(true);
      setIsBackendReachable(true);
      setStatus('connected');
      consecutiveFailuresRef.current = 0;
      setLastChecked(Date.now());
      return true;
    } catch {
      consecutiveFailuresRef.current += 1;
      setIsBackendReachable(false);
      setStatus(consecutiveFailuresRef.current > 1 ? 'disconnected' : 'unstable');
      setLastChecked(Date.now());
      return false;
    }
  }, []);

  useEffect(() => {
    checkHealth();

    const handleOnline = () => {
      setIsOnline(true);
      checkHealth();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsBackendReachable(false);
      setStatus('disconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      checkHealth();
    }, checkIntervalMs);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [checkHealth, checkIntervalMs]);

  return {
    status,
    isOnline: isOnline && isBackendReachable,
    isBackendReachable,
    lastChecked,
    checkNow: checkHealth,
  };
}

export default useConnectivity;
