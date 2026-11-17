import React, { useState } from 'react';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Trash2, 
  Clock, 
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from './ui/button';

export const OfflineSyncBadge: React.FC = () => {
  const { queue, queueCount, isSyncing, syncNow, clearQueue } = useOfflineQueue();
  const [isOpen, setIsOpen] = useState(false);

  if (queueCount === 0) {
    return (
      <div 
        className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-50 text-slate-500 border border-slate-200"
        title="Offline Sync: All changes synchronized with AWS cloud."
      >
        <Cloud className="w-3.5 h-3.5 text-emerald-500" />
        <span>Synced</span>
      </div>
    );
  }

  return (
    <>
      {/* Active Sync Pill in Desktop Header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer shadow-xs animate-in fade-in"
        title={`${queueCount} change(s) waiting for cloud synchronization.`}
      >
        {isSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
        ) : (
          <CloudOff className="w-3.5 h-3.5 text-amber-600" />
        )}
        <span>{queueCount} Queued</span>
        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 bg-amber-200/70 rounded text-amber-900 font-extrabold">
          Sync
        </span>
      </button>

      {/* Queue Details Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div 
            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <CloudOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Offline Mutation Queue
                  </h3>
                  <p className="text-xs text-slate-400">
                    Operations recorded locally while disconnected from cloud.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Queue Item List */}
            <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh]">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{item.description}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                        {item.method} {item.url}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                      {item.retryCount > 0 && (
                        <span className="text-rose-400 font-semibold">• Retried {item.retryCount}x</span>
                      )}
                    </div>
                    {item.lastError && (
                      <p className="text-[11px] text-rose-300/90 font-mono mt-1">
                        Error: {item.lastError}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 mt-0.5">
                    {item.status === 'SYNCING' ? (
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                    ) : item.status === 'FAILED' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block animate-pulse"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearQueue}
                className="h-9 px-3 border-slate-700 hover:bg-slate-800 text-slate-300 text-xs rounded-xl cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
                Clear Queue
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-9 px-4 text-slate-400 hover:text-white hover:bg-slate-800 text-xs rounded-xl cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={syncNow}
                  disabled={isSyncing}
                  className="h-9 px-5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/20 cursor-pointer"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Sync to AWS Cloud
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
