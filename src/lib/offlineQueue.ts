import { axiosClient } from '../api/axiosClient';

export interface QueuedMutation {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
  description: string;
  timestamp: number;
  retryCount: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  lastError?: string;
}

const STORAGE_KEY = 'edupulse_offline_queue';
const EVENT_NAME = 'edupulse-offline-queue-changed';

/**
 * Retrieves all mutations currently waiting in the offline sync queue.
 */
export const getOfflineQueue = (): QueuedMutation[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[OfflineQueue] Failed to parse offline queue:', err);
    return [];
  }
};

/**
 * Persists the queue array to local storage and dispatches a change event.
 */
const saveQueue = (queue: QueuedMutation[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { count: queue.length } }));
  } catch (err) {
    console.error('[OfflineQueue] Failed to save offline queue:', err);
  }
};

/**
 * Enqueues a new mutation to be synced when cloud connectivity is available.
 */
export const enqueueMutation = (
  mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount' | 'status'>
): QueuedMutation => {
  const queue = getOfflineQueue();
  const newEntry: QueuedMutation = {
    ...mutation,
    id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    retryCount: 0,
    status: 'PENDING',
  };

  queue.push(newEntry);
  saveQueue(queue);
  console.log(`[OfflineQueue] Enqueued operation: "${newEntry.description}" (Queue size: ${queue.length})`);
  return newEntry;
};

/**
 * Removes a mutation from the queue after successful synchronization.
 */
export const dequeueMutation = (id: string): void => {
  const queue = getOfflineQueue().filter((item) => item.id !== id);
  saveQueue(queue);
};

/**
 * Updates the sync status of an existing queued item.
 */
export const updateMutationStatus = (
  id: string,
  status: 'PENDING' | 'SYNCING' | 'FAILED',
  lastError?: string
): void => {
  const queue = getOfflineQueue().map((item) => {
    if (item.id === id) {
      return {
        ...item,
        status,
        retryCount: status === 'FAILED' ? item.retryCount + 1 : item.retryCount,
        lastError: lastError || item.lastError,
      };
    }
    return item;
  });
  saveQueue(queue);
};

/**
 * Clears all operations from the offline queue.
 */
export const clearOfflineQueue = (): void => {
  saveQueue([]);
};

let isSyncInProgress = false;

/**
 * Synchronizes all pending queued mutations with the cloud backend in FIFO sequence.
 */
export const syncOfflineQueue = async (
  onProgress?: (synced: number, total: number) => void
): Promise<{ successful: number; failed: number }> => {
  if (isSyncInProgress) {
    console.log('[OfflineQueue] Synchronization is already in progress.');
    return { successful: 0, failed: 0 };
  }

  const queue = getOfflineQueue().filter((item) => item.status !== 'SYNCING');
  if (queue.length === 0) {
    return { successful: 0, failed: 0 };
  }

  isSyncInProgress = true;
  let successful = 0;
  let failed = 0;
  const total = queue.length;

  console.log(`[OfflineQueue] Starting batch sync for ${total} pending operation(s)...`);

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    updateMutationStatus(item.id, 'SYNCING');

    try {
      await axiosClient.request({
        url: item.url,
        method: item.method,
        data: item.data,
        headers: {
          ...item.headers,
          'X-Offline-Sync': 'true',
          'X-Offline-Queued-At': String(item.timestamp),
        },
        timeout: 10000,
      });

      // Successfully synced: dequeue immediately
      dequeueMutation(item.id);
      successful++;
      console.log(`[OfflineQueue] Synced (${successful}/${total}): ${item.description}`);
      if (onProgress) onProgress(successful, total);
    } catch (err: any) {
      const isNetworkError =
        !err.response ||
        err.code === 'ECONNABORTED' ||
        err.message?.includes('Network Error') ||
        err.message?.includes('refused');

      updateMutationStatus(
        item.id,
        'FAILED',
        err.response?.data?.message || err.message || 'Network sync error'
      );
      failed++;
      console.warn(`[OfflineQueue] Failed to sync ${item.id}:`, err);

      // If backend network is unreachable, abort rest of queue to avoid repeated timeouts
      if (isNetworkError) {
        console.warn('[OfflineQueue] Backend unreachable during queue sync. Pausing remaining items.');
        break;
      }
    }
  }

  isSyncInProgress = false;
  return { successful, failed };
};
