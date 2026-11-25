import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getStudentInvoices, createFeeCheckoutOrder } from '../../api/portalService';
import { useInstitutionStore } from '../../store/useInstitutionStore';
import { toast } from 'sonner';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  ShieldCheck,
  RefreshCw,
  Search,
  Download,
  Printer,
  Building2,
  Receipt,
  X
} from 'lucide-react';

export default function FeeCenter() {
  const queryClient = useQueryClient();
  const { institution } = useInstitutionStore();
  const [payingInvoiceId, setPayingInvoiceId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [receiptInvoice, setReceiptInvoice] = useState(null);

  const { data: invoices = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['portal-invoices'],
    queryFn: getStudentInvoices,
    staleTime: 30000,
  });

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async (invoice) => {
    try {
      setPayingInvoiceId(invoice.id);
      toast.info(`Preparing secure checkout for Invoice #${invoice.invoiceNumber}...`);

      const checkoutData = await createFeeCheckoutOrder(invoice.id);

      const options = {
        key: checkoutData.keyId,
        amount: checkoutData.amount,
        currency: checkoutData.currency || 'INR',
        name: institution.name || 'Institutional Fee Gateway',
        description: checkoutData.description || `Fee Invoice #${invoice.invoiceNumber}`,
        order_id: checkoutData.orderId,
        prefill: {
          name: checkoutData.studentName,
          email: checkoutData.studentEmail,
        },
        theme: {
          color: '#4f46e5',
        },
        handler: function (response) {
          toast.success(`Payment verified successfully! Reference: ${response.razorpay_payment_id || response.razorpay_order_id}`);
          queryClient.invalidateQueries({ queryKey: ['portal-invoices'] });
          queryClient.invalidateQueries({ queryKey: ['portal-dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['studentLedger'] });
        },
        modal: {
          ondismiss: function () {
            toast.info('Checkout cancelled');
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const scriptLoaded = await loadRazorpayScript();
        if (scriptLoaded && window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          toast.success(`Payment settled for order: ${checkoutData.orderId}`);
          queryClient.invalidateQueries({ queryKey: ['portal-invoices'] });
          queryClient.invalidateQueries({ queryKey: ['portal-dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['studentLedger'] });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Payment initiation failed');
    } finally {
      setPayingInvoiceId(null);
    }
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.feeStructureName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PENDING' && inv.status !== 'PAID') ||
        (statusFilter === 'PAID' && inv.status === 'PAID');
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  // Compute summary metrics
  const totalInvoiced = invoices.reduce((acc, inv) => acc + (Number(inv.netAmount) || 0), 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + (Number(inv.amountPaid) || 0), 0);
  const totalOutstanding = invoices.reduce(
    (acc, inv) => acc + (Number(inv.outstandingBalance) || 0),
    0
  );

  const exportFeeStatementCsv = () => {
    const headers = ['Invoice #', 'Fee Structure', 'Due Date', 'Net Amount (INR)', 'Amount Paid (INR)', 'Balance Due (INR)', 'Status'];
    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      inv.feeStructureName || 'Semester Tuition',
      inv.dueDate || 'N/A',
      Number(inv.netAmount || 0).toFixed(2),
      Number(inv.amountPaid || 0).toFixed(2),
      Number(inv.outstandingBalance || 0).toFixed(2),
      inv.status,
    ]);

    const metaRows = [
      ['OFFICIAL STUDENT FEE ASSESSMENT & SETTLEMENT STATEMENT', '', '', '', '', '', ''],
      ['Institution', institution.name || 'Central University System', '', '', '', '', ''],
      ['Institution Code', institution.code || 'CUS-01', '', '', '', '', ''],
      ['Campus Node', institution.campus || 'Main Campus', '', '', '', '', ''],
      ['Total Invoiced', `INR ${totalInvoiced.toLocaleString('en-IN')}`, '', '', '', '', ''],
      ['Total Paid', `INR ${totalPaid.toLocaleString('en-IN')}`, '', '', '', '', ''],
      ['Outstanding Balance', `INR ${totalOutstanding.toLocaleString('en-IN')}`, '', '', '', '', ''],
      ['Exported On', new Date().toISOString(), '', '', '', '', ''],
      ['', '', '', '', '', '', '']
    ];

    const all = [...metaRows, headers, ...rows];
    const csvContent = 'data:text/csv;charset=utf-8,' + all.map((r) => r.map((c) => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fee_Statement_${institution.code || 'INST'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported fee assessment statement (CSV).');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Paid</span>
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Partial</span>
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Overdue</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            <span>Unpaid</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {institution.name || 'Institutional'} Student Finance
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                <ShieldCheck className="w-3 h-3" />
                <span>RBI Compliant Gateway</span>
              </span>
              {totalInvoiced > 0 && totalOutstanding === 0 && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>No-Dues Verified</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Student Fee Center</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Review institutional fee assessments, download fee receipts, and settle dues securely in INR.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Statement</span>
            </button>
            <button
              onClick={exportFeeStatementCsv}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500">Total Invoiced</span>
            <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
              ₹{totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
            <span className="text-xs font-semibold text-emerald-700">Total Settled</span>
            <div className="text-xl font-bold text-emerald-900 mt-1 font-mono">
              ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60">
            <span className="text-xs font-semibold text-amber-700">Total Outstanding Due</span>
            <div className="text-xl font-bold text-amber-900 mt-1 font-mono">
              ₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Fee Invoices</h2>
              <p className="text-xs text-slate-500">List of all historical and pending invoice assessments</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
              {['ALL', 'PENDING', 'PAID'].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    statusFilter === f ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f === 'ALL' ? 'All' : f === 'PENDING' ? 'Pending Dues' : 'Settled'}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search invoice number..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-medium text-slate-500">Loading student invoices...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-rose-600 text-sm">
            Failed to load fee invoices: {error?.message}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No invoices found</h4>
            <p className="text-xs text-slate-400 mt-1">There are no fee records matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-4 py-3.5">Fee Structure</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-4 py-3.5 text-right">Net Amount</th>
                  <th className="px-4 py-3.5 text-right">Amount Paid</th>
                  <th className="px-4 py-3.5 text-right">Balance Due</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredInvoices.map((invoice) => {
                  const isUnpaid = invoice.status !== 'PAID';
                  const isProcessing = payingInvoiceId === invoice.id;
                  const balance = Number(invoice.outstandingBalance || 0);

                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {invoice.feeStructureName || 'Semester Tuition'}
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {invoice.dueDate || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-semibold text-slate-800">
                        ₹{Number(invoice.netAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-emerald-700">
                        ₹{Number(invoice.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-bold text-slate-900">
                        ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {isUnpaid ? (
                            <button
                              type="button"
                              onClick={() => handlePayNow(invoice)}
                              disabled={isProcessing}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>{isProcessing ? 'Processing...' : 'Pay Now'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setReceiptInvoice(invoice)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Official Receipt</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Institutional Receipt Voucher Modal */}
      {receiptInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <Building2 className="w-5 h-5" />
                <span>{institution.name || 'Institutional'} Fee Receipt</span>
              </div>
              <button onClick={() => setReceiptInvoice(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-mono font-bold text-slate-900">{receiptInvoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Fee Structure / Head:</span>
                <span className="font-semibold text-slate-800">{receiptInvoice.feeStructureName || 'Semester Tuition'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Net Assessment:</span>
                <span className="font-mono text-slate-800">₹{Number(receiptInvoice.netAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Amount Settled:</span>
                <span className="font-mono font-black text-emerald-700 text-sm">
                  ₹{Number(receiptInvoice.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500">Account Standing:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> CLEARED &amp; RECONCILED
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReceiptInvoice(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}