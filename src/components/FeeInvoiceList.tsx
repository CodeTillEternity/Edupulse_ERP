import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInvoices } from '../api/financeService';
import { Input } from './ui/input';
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Printer,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export interface FeeInvoiceItem {
  id: number;
  invoiceNumber: string;
  studentId: number;
  studentName: string;
  studentEnrollmentNumber: string;
  feeStructureId: number;
  feeStructureName: string;
  grossAmount: number | string;
  discount: number | string;
  netAmount: number | string;
  amountPaid: number | string;
  outstandingBalance: number | string;
  dueDate: string;
  status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE';
  createdAt: string;
}

function formatINR(val: any): string {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(val: any): string {
  if (!val) return '—';
  if (Array.isArray(val) && val.length >= 3) {
    const [y, m, d] = val;
    return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString();
}

function InvoiceStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'PAID':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Paid
        </span>
      );
    case 'PARTIAL':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
          <Clock className="w-3 h-3 mr-1 text-amber-600" /> Partial
        </span>
      );
    case 'OVERDUE':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
          <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" /> Overdue
        </span>
      );
    case 'UNPAID':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          <XCircle className="w-3 h-3 mr-1 text-slate-500" /> Unpaid
        </span>
      );
  }
}

export function FeeInvoiceList() {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [serverSearch, setServerSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(serverSearch);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [serverSearch]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['fee-invoices', page, size, debouncedSearch, statusFilter, sortBy, sortDir],
    queryFn: () =>
      getInvoices({
        page,
        size,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortDir,
      }),
  });

  const invoices = useMemo<FeeInvoiceItem[]>(() => {
    const raw = data as any;
    if (Array.isArray(raw)) return raw;
    if (raw?.content && Array.isArray(raw.content)) return raw.content;
    return [];
  }, [data]);

  const rawData = data as any;
  const totalPages = rawData?.totalPages ?? 1;
  const totalElements = rawData?.totalElements ?? invoices.length;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-indigo-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-indigo-600" />
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by student or invoice #..."
            className="pl-9 bg-white border-slate-200 text-xs h-9"
            value={serverSearch}
            onChange={(e) => setServerSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-1 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            <select
              className="bg-transparent border-0 text-xs text-slate-700 font-medium focus:ring-0 cursor-pointer pr-4"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="UNPAID">Unpaid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" /> Print
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th
                className="px-3.5 py-3 cursor-pointer group hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('invoiceNumber')}
              >
                <div className="flex items-center space-x-1.5">
                  <span>Invoice #</span>
                  {getSortIcon('invoiceNumber')}
                </div>
              </th>
              <th
                className="px-3.5 py-3 cursor-pointer group hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('studentName')}
              >
                <div className="flex items-center space-x-1.5">
                  <span>Student</span>
                  {getSortIcon('studentName')}
                </div>
              </th>
              <th className="px-3.5 py-3">Fee Structure</th>
              <th
                className="px-3.5 py-3 text-right cursor-pointer group hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('grossAmount')}
              >
                <div className="flex items-center justify-end space-x-1.5">
                  <span>Gross</span>
                  {getSortIcon('grossAmount')}
                </div>
              </th>
              <th className="px-3.5 py-3 text-right">Discount</th>
              <th
                className="px-3.5 py-3 text-right cursor-pointer group hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('netAmount')}
              >
                <div className="flex items-center justify-end space-x-1.5">
                  <span>Net Due</span>
                  {getSortIcon('netAmount')}
                </div>
              </th>
              <th className="px-3.5 py-3 text-right">Paid</th>
              <th className="px-3.5 py-3 text-right">Outstanding</th>
              <th
                className="px-3.5 py-3 cursor-pointer group hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center space-x-1.5">
                  <span>Due Date</span>
                  {getSortIcon('dueDate')}
                </div>
              </th>
              <th className="px-3.5 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[13px]">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-4 py-16 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs font-medium">Loading fee invoices...</p>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={10} className="px-4 py-16 text-center text-red-500 text-xs font-medium">
                  Failed to load fee invoices from server.
                </td>
              </tr>
            ) : invoices.length > 0 ? (
              invoices.map((inv) => (
                <tr key={inv.id} className="even:bg-slate-50/50 hover:bg-indigo-50/40 transition-colors">
                  <td className="px-3.5 py-2.5 font-mono text-xs font-bold text-slate-800">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <div className="font-semibold text-slate-900">{inv.studentName || 'Student #' + inv.studentId}</div>
                    {inv.studentEnrollmentNumber && (
                      <div className="text-[11px] font-mono text-slate-500">{inv.studentEnrollmentNumber}</div>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 text-xs text-slate-700">{inv.feeStructureName || '—'}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-xs text-slate-600">{formatINR(inv.grossAmount)}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-xs text-emerald-600">
                    {Number(inv.discount) > 0 ? `-${formatINR(inv.discount)}` : '—'}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-xs font-bold text-slate-900">
                    {formatINR(inv.netAmount)}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-xs text-emerald-700 font-semibold">
                    {formatINR(inv.amountPaid)}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-xs font-bold text-rose-700">
                    {formatINR(inv.outstandingBalance)}
                  </td>
                  <td className="px-3.5 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                    {formatDate(inv.dueDate)}
                  </td>
                  <td className="px-3.5 py-2.5 text-center">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-4 py-16 text-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-slate-900 font-semibold text-sm">No invoices found</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Try adjusting your search criteria or invoice status filter.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          <p className="text-[11px] text-slate-600 uppercase tracking-wide">
            Showing <span className="font-bold text-slate-900">{invoices.length > 0 ? page * size + 1 : 0}</span> to{' '}
            <span className="font-bold text-slate-900">{Math.min((page + 1) * size, totalElements)}</span> of{' '}
            <span className="font-bold text-slate-900">{totalElements}</span> results
          </p>
          {isFetching && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />}
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            className="p-1.5 text-xs font-semibold border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            onClick={() => setPage(0)}
            disabled={page === 0 || isLoading}
            title="First Page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="px-2.5 py-1 text-xs font-semibold border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center shadow-2xs"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
          </button>
          <div className="text-xs font-semibold text-slate-700 px-2.5">
            Page {page + 1} of {Math.max(1, totalPages)}
          </div>
          <button
            type="button"
            className="px-2.5 py-1 text-xs font-semibold border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center shadow-2xs"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || isLoading}
          >
            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </button>
          <button
            type="button"
            className="p-1.5 text-xs font-semibold border border-slate-300 rounded bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            onClick={() => setPage(Math.max(0, totalPages - 1))}
            disabled={page >= totalPages - 1 || isLoading}
            title="Last Page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeeInvoiceList;
