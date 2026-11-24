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
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <ShieldAlert className="w-4 h-4" /> Security & Governance Audit
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Tamper-Evident System Audit Trail</h1>
          <p className="text-slate-500 text-sm mt-1">
            Immutable legal event ledger tracking all grade revisions, fee discounts, student onboarding, and payment reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={exportAuditCsv}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" /> Export Immutable Ledger (CSV)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by actor, entity ID, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all w-full sm:w-auto"
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
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 uppercase tracking-wider text-[11px] text-slate-600 border-b border-slate-200 sticky top-0 font-semibold">
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
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-sans">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isGrade = log.actionType.includes('GRADE');
                  const isPayment = log.actionType.includes('PAYMENT');
                  const isImport = log.actionType.includes('IMPORT');

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : '—'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                            isGrade
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : isPayment
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isImport
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {log.actionType}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-slate-900 font-bold block">{log.entityType}</span>
                        <span className="text-slate-400 text-[10px]">{log.entityId || '—'}</span>
                      </td>
                      <td className="p-3.5 text-slate-800">
                        <span className="font-sans font-semibold text-slate-900 block">{log.actorUsername}</span>
                        <span className="text-[10px] text-slate-500">{log.actorRole}</span>
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="p-3.5 font-sans text-slate-700 max-w-xs">{log.description}</td>
                      <td className="p-3.5 max-w-xs text-[10px]">
                        {log.oldValue && (
                          <div className="text-rose-600 line-through truncate bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60 mb-1">
                            Prev: {log.oldValue}
                          </div>
                        )}
                        {log.newValue && (
                          <div className="text-emerald-700 font-semibold truncate bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                            New: {log.newValue}
                          </div>
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
