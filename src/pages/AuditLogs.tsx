import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import { getAuditLogs, type AuditRecord } from '../api/auditService';
import { toast } from 'sonner';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs(100);
      setLogs(data);
    } catch (err: any) {
      toast.error('Failed to load system audit records.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.actorUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.entityId && l.entityId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.description && l.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = filterAction === 'ALL' || l.actionType === filterAction;
    return matchesSearch && matchesAction;
  });

  const exportAuditCsv = () => {
    const headers = ['Timestamp', 'Action', 'Entity', 'Entity ID', 'Actor', 'Role', 'IP Address', 'Description', 'Old Value', 'New Value'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.actionType}"`,
      `"${l.entityType}"`,
      `"${l.entityId || ''}"`,
      `"${l.actorUsername}"`,
      `"${l.actorRole || ''}"`,
      `"${l.ipAddress || ''}"`,
      `"${(l.description || '').replace(/"/g, '""')}"`,
      `"${(l.oldValue || '').replace(/"/g, '""')}"`,
      `"${(l.newValue || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded tamper-evident audit ledger.');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <ShieldAlert className="w-4 h-4" /> Security & Governance Audit
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Tamper-Evident System Audit Trail</h1>
          <p className="text-slate-400 text-sm mt-1">
            Immutable legal event ledger tracking all grade revisions, fee discounts, student onboarding, and payment reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={exportAuditCsv}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition-all"
          >
            <Download className="w-4 h-4" /> Export Immutable Ledger (CSV)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by actor, entity ID, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 transition-all w-full sm:w-auto"
          >
            <option value="ALL">All Event Actions</option>
            <option value="GRADE_CHANGE">Grade Changes</option>
            <option value="PAYMENT_RECONCILE">Payment Reconciliations</option>
            <option value="STUDENT_IMPORT">Student Imports</option>
            <option value="UPDATE">Entity Updates</option>
            <option value="DELETE">Deletions</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-800 sticky top-0 backdrop-blur-md">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity Target</th>
                <th className="p-3.5">Actor & Role</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5">Description & Reason</th>
                <th className="p-3.5">Audit Delta (Before &rarr; After)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isGrade = log.actionType.includes('GRADE');
                  const isPayment = log.actionType.includes('PAYMENT');
                  const isImport = log.actionType.includes('IMPORT');

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : '—'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                            isGrade
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : isPayment
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isImport
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {log.actionType}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-white font-bold block">{log.entityType}</span>
                        <span className="text-slate-500 text-[10px]">{log.entityId || '—'}</span>
                      </td>
                      <td className="p-3.5 text-slate-200">
                        <span className="font-sans font-semibold text-white block">{log.actorUsername}</span>
                        <span className="text-[10px] text-slate-400">{log.actorRole}</span>
                      </td>
                      <td className="p-3.5 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="p-3.5 font-sans text-slate-300 max-w-xs">{log.description}</td>
                      <td className="p-3.5 max-w-xs text-[10px]">
                        {log.oldValue && (
                          <div className="text-rose-400 line-through truncate">Prev: {log.oldValue}</div>
                        )}
                        {log.newValue && (
                          <div className="text-emerald-400 font-semibold truncate">New: {log.newValue}</div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
