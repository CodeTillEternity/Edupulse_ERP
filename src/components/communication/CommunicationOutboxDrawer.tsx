import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Radio,
  FileText,
  CreditCard,
  UserCheck,
  ShieldAlert,
  Download
} from 'lucide-react';
import {
  communicationService,
  type CommunicationLog,
  type GatewayStatus,
  type TriggerType
} from '../../api/communicationService';
import { useInstitutionStore } from '../../store/useInstitutionStore';
import { toast } from 'sonner';

interface CommunicationOutboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFilter?: TriggerType | 'ALL';
}

export const CommunicationOutboxDrawer: React.FC<CommunicationOutboxDrawerProps> = ({
  isOpen,
  onClose,
  defaultFilter = 'ALL'
}) => {
  const { institution } = useInstitutionStore();
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TriggerType | 'ALL'>(defaultFilter);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const [logsRes, statusRes] = await Promise.all([
        communicationService.getOutboxLogs(100),
        communicationService.getGatewayStatus()
      ]);
      setLogs(logsRes);
      setGatewayStatus(statusRes);
    } catch (err) {
      console.error('Failed to load communication outbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (activeTab === 'ALL') return true;
    return log.triggerType === activeTab;
  });

  const handleCopyMessage = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAuditCsv = () => {
    if (filteredLogs.length === 0) {
      toast.error('No communication dispatch logs to export');
      return;
    }
    const headerLines = [
      `"${(institution.name || 'Institutional ERP').replace(/"/g, '""')} — Communication Outbox Audit Ledger"`,
      `"Filter","${activeTab}"`,
      `"Exported At","${new Date().toISOString()}"`,
      '',
      'Log ID,Sent At,Channel,Trigger Type,Delivery Status,Recipient Name,Recipient Phone,Student Enrollment,Student Name,Subject,Gateway Ref,Message Content'
    ];
    const rows = filteredLogs.map((l) =>
      [
        l.id,
        `"${(l.sentAt || '').replace(/"/g, '""')}"`,
        l.channel,
        l.triggerType,
        l.deliveryStatus,
        `"${(l.recipientName || '').replace(/"/g, '""')}"`,
        `"${(l.recipientPhone || '').replace(/"/g, '""')}"`,
        `"${(l.studentEnrollment || '').replace(/"/g, '""')}"`,
        `"${(l.studentName || '').replace(/"/g, '""')}"`,
        `"${(l.subject || '').replace(/"/g, '""')}"`,
        `"${(l.gatewayReferenceId || '').replace(/"/g, '""')}"`,
        `"${(l.messageContent || '').replace(/\r?\n/g, ' ').replace(/"/g, '""')}"`,
      ].join(',')
    );
    const blob = new Blob([[...headerLines, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communication-outbox-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredLogs.length} dispatch log(s)`);
  };

  const getTriggerBadge = (type: TriggerType) => {
    switch (type) {
      case 'ABSENCE_ALERT':
        return {
          label: 'Absence Alert',
          icon: ShieldAlert,
          bg: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      case 'FEE_DUE_NOTICE':
        return {
          label: 'Fee Due Notice',
          icon: CreditCard,
          bg: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case 'FEE_PAYMENT_RECEIPT':
        return {
          label: 'Fee Receipt',
          icon: FileText,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'EXAM_HALL_TICKET':
        return {
          label: 'Exam Hall Ticket',
          icon: UserCheck,
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        };
      default:
        return {
          label: type,
          icon: MessageSquare,
          bg: 'bg-slate-50 text-slate-700 border-slate-200'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Parent & Student Communication Rails
              </h2>
              <p className="text-xs text-slate-500">
                Automated WhatsApp Business & SMS Live Outbox
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gateway Status Banner */}
        <div className="px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="font-semibold text-slate-700">Dispatch Gateway:</span>
            {gatewayStatus?.mode === 'LIVE_META_CLOUD' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
                Meta WhatsApp Cloud API v21.0
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-300">
                Interactive Simulator (wa.me Direct Link)
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportAuditCsv}
              disabled={loading || filteredLogs.length === 0}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 disabled:opacity-40 font-medium transition-colors cursor-pointer"
              title="Export filtered dispatch logs as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit CSV</span>
            </button>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer"
              title="Refresh outbox logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="px-6 py-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto bg-white text-xs">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('ABSENCE_ALERT')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'ABSENCE_ALERT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Absence
          </button>
          <button
            onClick={() => setActiveTab('FEE_DUE_NOTICE')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'FEE_DUE_NOTICE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Fee Dues
          </button>
          <button
            onClick={() => setActiveTab('FEE_PAYMENT_RECEIPT')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'FEE_PAYMENT_RECEIPT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Receipts
          </button>
          <button
            onClick={() => setActiveTab('EXAM_HALL_TICKET')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'EXAM_HALL_TICKET'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Hall Tickets
          </button>
        </div>

        {/* Outbox Log Stream */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No communication logs found</p>
              <p className="text-xs text-slate-400 mt-1">
                Dispatches triggered from Attendance, Fee Ledger, or Exams will appear here.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badge = getTriggerBadge(log.triggerType);
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}
                      >
                        <BadgeIcon className="w-3.5 h-3.5" />
                        {badge.label}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        {log.channel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {log.deliveryStatus === 'DELIVERED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Delivered
                        </span>
                      ) : log.deliveryStatus === 'SIMULATED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          <Check className="w-3 h-3" /> Simulated
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recipient & Target Details */}
                  <div className="bg-slate-50 rounded-lg p-2.5 text-xs grid grid-cols-2 gap-2 border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Recipient (Guardian / Student)
                      </span>
                      <span className="font-semibold text-slate-800">
                        {log.recipientName || 'Guardian'}
                      </span>
                      <span className="text-slate-500 block font-mono text-[11px]">
                        {log.recipientPhone}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Student Ward
                      </span>
                      <span className="font-semibold text-slate-800">
                        {log.studentName || 'Aarav Sharma'}
                      </span>
                      <span className="text-slate-500 block font-mono text-[11px]">
                        {log.studentEnrollment || '23CSM001'}
                      </span>
                    </div>
                  </div>

                  {/* Message Content Bubble */}
                  <div className="relative rounded-lg bg-emerald-50/50 border border-emerald-100 p-3 text-xs text-slate-800 font-sans whitespace-pre-line leading-relaxed">
                    {log.messageContent}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-400 text-[11px] font-mono">
                      {new Date(log.sentAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyMessage(log.id, log.messageContent)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-colors cursor-pointer"
                        title="Copy message content"
                      >
                        {copiedId === log.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {log.directChatLink && (
                        <a
                          href={log.directChatLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xs transition-colors cursor-pointer"
                          title="Open direct WhatsApp conversation with prefilled text"
                        >
                          <Send className="w-3 h-3" />
                          <span>Open in WhatsApp</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationOutboxDrawer;
