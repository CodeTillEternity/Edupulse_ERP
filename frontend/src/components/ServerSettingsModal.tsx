import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Cloud, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  RotateCcw, 
  X, 
  ShieldCheck,
  Building
} from 'lucide-react';
import { 
  resolveBaseUrl, 
  resolveTenantId, 
  setServerConfiguration, 
  resetServerConfiguration, 
  testServerConnection 
} from '../api/axiosClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (newUrl: string, tenantId: string) => void;
}

interface PresetOption {
  id: string;
  name: string;
  url: string;
  description: string;
  icon: React.ElementType;
  badge: string;
}

const PRESETS: PresetOption[] = [
  {
    id: 'aws-cloud',
    name: 'EduPulse AWS Cloud (SaaS)',
    url: 'https://api.edupulse.org',
    description: 'Central AWS Cloud production cluster & multi-tenant PostgreSQL database.',
    icon: Cloud,
    badge: 'Production Cloud',
  },
  {
    id: 'local-sidecar',
    name: 'Local Standalone Sidecar',
    url: 'http://localhost:8081',
    description: 'Local background Spring Boot process running on this workstation.',
    icon: Cpu,
    badge: 'Local Machine',
  },
  {
    id: 'campus-lan',
    name: 'Campus On-Premises LAN',
    url: 'http://192.168.1.100:8081',
    description: 'Private campus server hosted on the institutional intranet.',
    icon: Building,
    badge: 'Campus Intranet',
  },
];

export const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [serverUrl, setServerUrl] = useState<string>('');
  const [tenantId, setTenantId] = useState<string>('default');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    latencyMs: number;
    status?: number;
    message: string;
  } | null>(null);

  // Initialize form state when opened
  useEffect(() => {
    if (isOpen) {
      setServerUrl(resolveBaseUrl());
      setTenantId(resolveTenantId());
      setTestResult(null);
      setIsTesting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: PresetOption) => {
    setServerUrl(preset.url);
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!serverUrl || !serverUrl.trim()) {
      toast.error('Please enter a valid server URL before testing.');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await testServerConnection(serverUrl.trim());
      setTestResult(res);
      if (res.ok) {
        toast.success(`Server reachable! Response latency: ${res.latencyMs}ms`);
      } else {
        toast.error(`Connection check failed: ${res.message}`);
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        latencyMs: 0,
        message: err?.message || 'Failed to ping target host',
      });
      toast.error('Could not reach target server endpoint.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const cleanUrl = serverUrl.trim().replace(/\/$/, '');
    if (!cleanUrl) {
      toast.error('Server endpoint URL cannot be blank.');
      return;
    }

    const cleanTenant = tenantId.trim() || 'default';
    setServerConfiguration(cleanUrl, cleanTenant);
    toast.success(`Server connection applied: ${cleanUrl} (Tenant: ${cleanTenant})`);
    
    if (onSaved) {
      onSaved(cleanUrl, cleanTenant);
    }
    onClose();
  };

  const handleReset = () => {
    resetServerConfiguration();
    const defaultUrl = resolveBaseUrl();
    const defaultTenant = resolveTenantId();
    setServerUrl(defaultUrl);
    setTenantId(defaultTenant);
    setTestResult(null);
    toast.info('Reset server settings to default sidecar endpoint.');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Server & Cloud Connection Settings
              </h3>
              <p className="text-xs text-slate-400">
                Configure central SaaS cloud endpoint or campus network routing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Presets List */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Connection Presets
            </Label>
            <div className="grid grid-cols-1 gap-2.5">
              {PRESETS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = serverUrl.trim().replace(/\/$/, '') === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/60 ring-1 ring-blue-500/40'
                        : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg mt-0.5 ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-700/60 text-slate-300'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-white">{preset.name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono">{preset.url}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{preset.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Endpoint URL Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="custom-server-url" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                API Endpoint Base URL
              </Label>
              <span className="text-[11px] text-slate-400">Must include http:// or https://</span>
            </div>
            <Input
              id="custom-server-url"
              type="text"
              placeholder="https://api.edupulse.org or http://localhost:8081"
              value={serverUrl}
              onChange={(e) => {
                setServerUrl(e.target.value);
                setTestResult(null);
              }}
              className="h-10 bg-slate-950/80 border-slate-700 text-white placeholder-slate-500 font-mono text-xs rounded-xl focus:border-blue-500"
            />
          </div>

          {/* Tenant Identifier */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="custom-tenant-id" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Multi-Tenant Partition ID (<code className="text-blue-400">X-Tenant-Id</code>)
              </Label>
              <span className="text-[11px] text-slate-400">Default: default</span>
            </div>
            <Input
              id="custom-tenant-id"
              type="text"
              placeholder="default or campus identifier (e.g. arya-main)"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="h-10 bg-slate-950/80 border-slate-700 text-white placeholder-slate-500 text-xs rounded-xl focus:border-blue-500"
            />
          </div>

          {/* Connection Test Output */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                testResult.ok
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                {testResult.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <div>
                  <span className="font-bold">{testResult.ok ? 'Connection Verified' : 'Connection Failed'}: </span>
                  <span>{testResult.message}</span>
                </div>
              </div>
              {testResult.ok && (
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 font-semibold">
                  {testResult.latencyMs} ms
                </span>
              )}
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-slate-400 text-xs">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              Hardware-secured credentials (DPAPI) are strictly scoped per backend domain. Switching servers requires re-authenticating on that environment.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-9 px-3 border-slate-700 hover:bg-slate-800 text-slate-300 text-xs rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={isTesting || !serverUrl.trim()}
              className="h-9 px-3 border-blue-500/40 hover:bg-blue-900/30 text-blue-300 text-xs rounded-xl cursor-pointer"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Pinging...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 px-4 text-slate-400 hover:text-white hover:bg-slate-800 text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="h-9 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              Save & Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
