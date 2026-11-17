import { useState, useEffect, useCallback } from 'react';
import {
  getOfflineQueue,
  enqueueMutation,
  clearOfflineQueue,
  syncOfflineQueue,
  type QueuedMutation,
} from '../lib/offlineQueue';
import { useConnectivity } from './useConnectivity';
import { toast } from 'sonner';

export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedMutation[]>(() => getOfflineQueue());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const { isOnline, isBackendReachable } = useConnectivity();

  // Keep state synchronized with queue changes across tabs and operations
  useEffect(() => {
    const handleQueueChange = () => {
      setQueue(getOfflineQueue());
    };

    window.addEventListener('edupulse-offline-queue-changed', handleQueueChange);
    return () => {
      window.removeEventListener('edupulse-offline-queue-changed', handleQueueChange);
    };
  }, []);

  const syncNow = useCallback(async () => {
    if (queue.length === 0 || isSyncing) return;
    setIsSyncing(true);

    try {
      const result = await syncOfflineQueue((_synced, _total) => {
        setQueue(getOfflineQueue());
      });

      if (result.successful > 0) {
        toast.success(`Synced ${result.successful} offline change(s) with cloud server.`);
      }
      if (result.failed > 0) {
        toast.warning(`${result.failed} change(s) could not sync. Will retry on next reconnect.`);
      }
    } catch (err: any) {
      toast.error(`Queue sync error: ${err?.message || 'Sync failed'}`);
    } finally {
      setIsSyncing(false);
      setQueue(getOfflineQueue());
    }
  }, [queue.length, isSyncing]);

  // Automatic background reconciliation when client regains cloud connectivity
  useEffect(() => {
    if (isOnline && isBackendReachable && queue.length > 0 && !isSyncing) {
      console.log('[useOfflineQueue] Cloud connectivity detected. Triggering auto-sync...');
      syncNow();
    }
  }, [isOnline, isBackendReachable, queue.length, isSyncing, syncNow]);

  const enqueue = useCallback(
    (mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount' | 'status'>) => {
      const res = enqueueMutation(mutation);
      setQueue(getOfflineQueue());
      toast.info(`Offline: "${mutation.description}" queued for auto-sync.`);
      return res;
    },
    []
  );

  const clearQueue = useCallback(() => {
    clearOfflineQueue();
    setQueue([]);
    toast.info('Offline queue cleared.');
  }, []);

  return {
    queue,
    queueCount: queue.length,
    isSyncing,
    syncNow,
    enqueue,
    clearQueue,
  };
}
