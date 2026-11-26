import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  CreditCard,
  Receipt,
  AlertCircle,
  CheckCircle2,
  User,
  X,
  MessageSquare,
  Printer,
  Download,
  Filter,
  Award,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { getStudentLedger, recordPayment } from '../../api/financeService';
import { communicationService } from '../../api/communicationService';
import { CommunicationOutboxDrawer } from '../../components/communication/CommunicationOutboxDrawer';
import { useInstitutionStore } from '../../store/useInstitutionStore';

const STATUS_BADGES = {
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PARTIAL: 'bg-amber-50 text-amber-700 border-amber-200',
  PARTIALLY_PAID: 'bg-amber-50 text-amber-700 border-amber-200',
  UNPAID: 'bg-rose-50 text-rose-700 border-rose-200',
  PENDING: 'bg-slate-100 text-slate-700 border-slate-200',
  OVERDUE: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function StudentLedger() {
  const queryClient = useQueryClient();
  const { institution } = useInstitutionStore();

  // Search state
  const [searchInput, setSearchInput] = useState('');
  const [activeEnrollment, setActiveEnrollment] = useState('');

  // Active view tab: 'invoices' | 'payments'
  const [activeTab, setActiveTab] = useState('invoices');
  const [defaulterFilterOnly, setDefaulterFilterOnly] = useState(false);

  // Collect Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState(null);
  const [autoSendReceiptWhatsApp, setAutoSendReceiptWhatsApp] = useState(true);
  const [isOutboxOpen, setIsOutboxOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'UPI',
    referenceNumber: '',
    notes: '',
  });

  const handleDispatchFeeNotice = async (inv) => {
    const phone = ledger?.student?.phone || ledger?.student?.guardianPhone || '';
    if (!phone) {
      toast.error('No registered student or guardian phone number on file for this invoice.');
      return;
    }
    try {
      const res = await communicationService.dispatchFeeNotice({
        invoiceNumber: inv.invoiceNumber,
        studentEnrollment: activeEnrollment,
        studentName: ledger?.student?.firstName ? `${ledger.student.firstName} ${ledger.student.lastName}` : 'Student',
        title: inv.feeStructureName || 'Tuition & Fee Assessment',
        amount: Number(inv.outstandingBalance || inv.netAmount),
        dueDate: inv.dueDate,
        recipientPhone: phone,
        channel: 'WHATSAPP',
      });
      toast.success(`WhatsApp Fee Notice dispatched for ${inv.invoiceNumber}!`, {
        action: res.directChatLink
          ? {
              label: 'Open WhatsApp',
              onClick: () => window.open(res.directChatLink, '_blank'),
            }
          : undefined,
      });
    } catch {
      toast.error('Failed to dispatch WhatsApp fee notice');
    }
  };

  const handleDispatchFeeReceipt = async (invoiceNumber) => {
    try {
      const res = await communicationService.dispatchFeeReceipt(invoiceNumber);
      toast.success(`WhatsApp Payment Receipt dispatched for ${invoiceNumber}!`, {
        action: res.directChatLink
          ? {
              label: 'Open WhatsApp',
              onClick: () => window.open(res.directChatLink, '_blank'),
            }
          : undefined,
      });
    } catch {
      toast.error('Failed to dispatch WhatsApp payment receipt');
    }
  };

  // Query: Student Ledger details
  const {
    data: ledger,
    isLoading: isLedgerLoading,
    error: ledgerError,
  } = useQuery({
    queryKey: ['studentLedger', activeEnrollment],
    queryFn: () => getStudentLedger(activeEnrollment),
    enabled: Boolean(activeEnrollment),
    retry: false,
  });

  // Mutation: Record payment
  const paymentMutation = useMutation({
    mutationFn: (data) => recordPayment(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['studentLedger', activeEnrollment] });
      queryClient.invalidateQueries({ queryKey: ['naacMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['complianceMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['studentTranscript'] });

      const invNum = selectedInvoice?.invoiceNumber;
      if (autoSendReceiptWhatsApp && invNum) {
        communicationService.dispatchFeeReceipt(invNum).catch(() => {});
        toast.success(
          `Payment of ₹${Number(data.amount).toLocaleString('en-IN')} recorded & WhatsApp receipt dispatched!`,
          {
            action: {
              label: 'View Outbox',
              onClick: () => setIsOutboxOpen(true),
            },
          }
        );
      } else {
        toast.success(
          `Payment of ₹${Number(data.amount).toLocaleString('en-IN')} recorded successfully!`
        );
      }

      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentForm({
        amount: '',
        paymentMethod: 'UPI',
        referenceNumber: '',
        notes: '',
      });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message || 'Failed to record payment transaction';
      toast.error(msg);
    },
  });

  // Search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      toast.error('Please enter a student enrollment number');
      return;
    }
    setActiveEnrollment(searchInput.trim());
  };

  // Open Payment Modal for an invoice
  const handleOpenPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: invoice.outstandingBalance ? String(invoice.outstandingBalance) : '',
      paymentMethod: 'UPI',
      referenceNumber: '',
      notes: '',
    });
    setShowPaymentModal(true);
  };

  // Submit payment
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(paymentForm.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid payment amount greater than zero');
      return;
    }
    if (selectedInvoice && amt > Number(selectedInvoice.outstandingBalance)) {
      toast.error(`Payment amount cannot exceed outstanding balance of ₹${selectedInvoice.outstandingBalance}`);
      return;
    }

    paymentMutation.mutate({
      invoiceId: selectedInvoice.id,
      amount: amt,
      paymentMethod: paymentForm.paymentMethod,
      referenceNumber: paymentForm.referenceNumber.trim() || undefined,
      notes: paymentForm.notes.trim() || undefined,
    });
  };

  const filteredInvoices = (ledger?.invoices || []).filter((inv) => {
    if (!defaulterFilterOnly) return true;
    return inv.status !== 'PAID' && Number(inv.outstandingBalance) > 0;
  });

  const exportLedgerCsv = () => {
    if (!ledger) return;
    const invHeaders = ['Invoice #', 'Fee Blueprint', 'Gross Amount', 'Discount', 'Net Payable', 'Paid Amount', 'Outstanding Balance', 'Due Date', 'Status'];
    const invRows = (ledger.invoices || []).map((inv) => [
      inv.invoiceNumber,
      inv.feeStructureName,
      `INR ${Number(inv.grossAmount).toLocaleString('en-IN')}`,
      `INR ${Number(inv.discount || 0).toLocaleString('en-IN')}`,
      `INR ${Number(inv.netAmount).toLocaleString('en-IN')}`,
      `INR ${Number(inv.amountPaid).toLocaleString('en-IN')}`,
      `INR ${Number(inv.outstandingBalance).toLocaleString('en-IN')}`,
      inv.dueDate,
      inv.status
    ]);

    const metaRows = [
      ['STATUTORY STUDENT FINANCIAL LEDGER & FEE STATEMENT', '', '', '', '', '', '', '', ''],
      ['Institution', institution.name || 'Central University System', '', '', '', '', '', '', ''],
      ['Institution Code', institution.code || 'CUS-01', '', '', '', '', '', '', ''],
      ['Student Name', `${ledger.student?.firstName || ''} ${ledger.student?.lastName || ''}`, '', '', '', '', '', '', ''],
      ['Enrollment Number', ledger.student?.enrollmentNumber || activeEnrollment, '', '', '', '', '', '', ''],
      ['Department', ledger.student?.department || 'Academic Department', '', '', '', '', '', '', ''],
      ['Batch / Cohort', ledger.student?.batch || 'Current Cohort', '', '', '', '', '', '', ''],
      ['Total Assessed Fees', `INR ${Number(ledger.summary?.totalBilled || 0).toLocaleString('en-IN')}`, '', '', '', '', '', '', ''],
      ['Total Fees Cleared', `INR ${Number(ledger.summary?.totalPaid || 0).toLocaleString('en-IN')}`, '', '', '', '', '', '', ''],
      ['Outstanding Balance', `INR ${Number(ledger.summary?.totalOutstanding || 0).toLocaleString('en-IN')}`, '', '', '', '', '', '', ''],
      ['Clearance Status', Number(ledger.summary?.totalOutstanding || 0) === 0 ? 'FEE CLEARANCE CERTIFIED' : 'PENDING SETTLEMENT', '', '', '', '', '', '', ''],
      ['Generated On', new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '']
    ];

    const all = [...metaRows, invHeaders, ...invRows];
    const csvContent = 'data:text/csv;charset=utf-8,' + all.map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Fee_Ledger_${activeEnrollment}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded student fee ledger statement (CSV).');
  };

  const isFeeCleared = Number(ledger?.summary?.totalOutstanding || 0) === 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-2">
              <Receipt className="w-3.5 h-3.5" /> B2C Student Ledger &amp; Collections
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">{institution.name || 'Main Campus'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Institutional Student Fee Ledger
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Audit student billing assessments, track balance settlements, and collect offline or digital fee payments.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap shrink-0">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  aria-label="Student Enrollment Number"
                  placeholder="Enrollment (e.g. 23CSM001)"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
              >
                Search Ledger
              </button>
            </form>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-all whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" /> Print Ledger
            </button>

            <button
              type="button"
              onClick={exportLedgerCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-all whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
            </button>

            <button
              type="button"
              onClick={() => setIsOutboxOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
              title="Open Parent WhatsApp & SMS Outbox Logs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Outbox</span>
            </button>
          </div>
        </div>

        {/* Prompt When No Enrollment Selected */}
        {!activeEnrollment && !isLedgerLoading && (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
            <Receipt className="w-9 h-9 text-slate-300 mx-auto mb-3" />
            <h2 className="text-base font-bold text-slate-900">Lookup a Student Fee Ledger</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Enter a canonical student enrollment number above to review invoice assessments, collect counter settlements, and print receipts.
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLedgerLoading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Loading Student Ledger Records...</p>
            <p className="text-xs text-slate-400 mt-1">Retrieving invoice assessments and receipt vouchers for {activeEnrollment}</p>
          </div>
        )}

        {/* Error / Not Found State */}
        {ledgerError && !isLedgerLoading && (
          <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center shadow-sm">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h2 className="text-base font-bold text-slate-900">Student Ledger Not Found</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Could not resolve a ledger account for enrollment <strong>{activeEnrollment}</strong>. Verify the ID or create a fee assignment.
            </p>
          </div>
        )}

        {/* Ledger Content */}
        {ledger && !isLedgerLoading && (
          <>
            {/* Student Info & Financial Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Student Profile Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-lg border border-indigo-100">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {ledger.student?.firstName} {ledger.student?.lastName}
                    </h2>
                    <p className="text-xs font-mono font-semibold text-indigo-600">
                      {ledger.student?.enrollmentNumber || activeEnrollment}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-medium text-slate-800">{ledger.student?.department || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cohort / Batch:</span>
                    <span className="font-medium text-slate-800">{ledger.student?.batch || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Clearance Seal:</span>
                    <span className={`font-bold ${isFeeCleared ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {isFeeCleared ? 'Fee Cleared' : 'Defaulter / Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Assessed */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Total Billed Fees</span>
                  <Receipt className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-3xl font-black text-slate-900 font-mono">
                  ₹{Number(ledger.summary?.totalBilled || 0).toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-slate-400">Gross tuition &amp; institutional heads</p>
              </div>

              {/* Total Paid */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Total Fees Cleared</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-emerald-600 font-mono">
                  ₹{Number(ledger.summary?.totalPaid || 0).toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-emerald-700 font-medium">Verified payments recorded</p>
              </div>

              {/* Total Outstanding */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Outstanding Deficit</span>
                  <AlertCircle className={`w-4 h-4 ${Number(ledger.summary?.totalOutstanding || 0) > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
                </div>
                <div className={`text-3xl font-black font-mono ${Number(ledger.summary?.totalOutstanding || 0) > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  ₹{Number(ledger.summary?.totalOutstanding || 0).toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-slate-500">
                  {Number(ledger.summary?.totalOutstanding || 0) > 0 ? 'Action required prior to hall tickets' : 'Account in good standing'}
                </p>
              </div>
            </div>

            {/* Invoices & Payment Receipts Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Tab Navigation & Defaulter Filter */}
              <div className="border-b border-slate-200 px-6 py-3 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('invoices')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      activeTab === 'invoices'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Fee Invoices ({ledger.invoices?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('payments')}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      activeTab === 'payments'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Payment Receipts ({ledger.payments?.length || 0})
                  </button>
                </div>

                {activeTab === 'invoices' && (
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="checkbox"
                        checked={defaulterFilterOnly}
                        onChange={(e) => setDefaulterFilterOnly(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Show Defaulter Invoices Only</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Tab 1: Invoices Table */}
              {activeTab === 'invoices' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider text-[11px]">
                      <tr>
                        <th scope="col" className="px-4 py-3">Invoice #</th>
                        <th scope="col" className="px-4 py-3">Fee Blueprint</th>
                        <th scope="col" className="px-4 py-3">Gross</th>
                        <th scope="col" className="px-4 py-3">Discount</th>
                        <th scope="col" className="px-4 py-3">Net Payable</th>
                        <th scope="col" className="px-4 py-3">Paid</th>
                        <th scope="col" className="px-4 py-3">Outstanding</th>
                        <th scope="col" className="px-4 py-3">Due Date</th>
                        <th scope="col" className="px-4 py-3 text-center">Status</th>
                        <th scope="col" className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInvoices.map((inv) => {
                        const isFullyPaid = inv.status === 'PAID' || Number(inv.outstandingBalance) === 0;
                        const badgeClass = STATUS_BADGES[inv.status] || STATUS_BADGES.UNPAID;

                        return (
                          <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800">{inv.feeStructureName}</td>
                            <td className="px-4 py-3 text-slate-600">₹{Number(inv.grossAmount).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-emerald-600">₹{Number(inv.discount || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 font-bold text-slate-900">₹{Number(inv.netAmount).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-emerald-700 font-semibold">₹{Number(inv.amountPaid).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 font-extrabold text-rose-700">₹{Number(inv.outstandingBalance).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-slate-500">{inv.dueDate}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeClass}`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {!isFullyPaid ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleDispatchFeeNotice(inv)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold rounded-md border border-emerald-200 transition-colors cursor-pointer"
                                      title="Dispatch payment link notice to parent WhatsApp"
                                    >
                                      <MessageSquare className="w-3 h-3 text-emerald-600" /> WhatsApp Notice
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPaymentModal(inv)}
                                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-md shadow-sm transition-colors cursor-pointer"
                                    >
                                      <CreditCard className="w-3 h-3" /> Collect Payment
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleDispatchFeeReceipt(inv.invoiceNumber)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                                    title="Dispatch cleared fee receipt to parent WhatsApp"
                                  >
                                    <MessageSquare className="w-3 h-3" /> WhatsApp Receipt
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredInvoices.length === 0 && (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                            {defaulterFilterOnly ? 'No outstanding defaulter invoices for this student.' : 'No fee invoices generated for this student.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 2: Payments Table */}
              {activeTab === 'payments' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider text-[11px]">
                      <tr>
                        <th scope="col" className="px-4 py-3">Receipt / Ref #</th>
                        <th scope="col" className="px-4 py-3">Invoice #</th>
                        <th scope="col" className="px-4 py-3">Payment Date</th>
                        <th scope="col" className="px-4 py-3">Payment Method</th>
                        <th scope="col" className="px-4 py-3">Amount Collected</th>
                        <th scope="col" className="px-4 py-3">Notes</th>
                        <th scope="col" className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ledger.payments && ledger.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-indigo-700">{p.referenceNumber || `RCP-${p.id}`}</td>
                          <td className="px-4 py-3 font-mono text-slate-800">{p.invoiceNumber}</td>
                          <td className="px-4 py-3 text-slate-500">{p.paymentDate}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-emerald-700">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-slate-500 italic max-w-xs truncate">{p.notes || '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedReceiptForPrint(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded text-[11px] font-medium shadow-xs transition-colors cursor-pointer"
                            >
                              <Printer className="w-3 h-3 text-slate-500" /> Print Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!ledger.payments || ledger.payments.length === 0) && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                            No payment transactions recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Collect Payment Modal */}
        {showPaymentModal && selectedInvoice && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Record Fee Collection"
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Record Fee Collection</h3>
                    <p className="text-xs text-slate-500 font-mono">Invoice: {selectedInvoice.invoiceNumber}</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close payment modal"
                  onClick={() => setShowPaymentModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Outstanding Balance Banner */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 mb-5 flex justify-between items-center text-xs">
                <div>
                  <span className="text-indigo-600 font-semibold block">Outstanding Balance:</span>
                  <span className="text-xl font-black text-indigo-900 font-mono">
                    ₹{Number(selectedInvoice.outstandingBalance).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Due Date:</span>
                  <span className="font-semibold text-slate-700">{selectedInvoice.dueDate}</span>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label htmlFor="paymentAmountInput" className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount to Collect (INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input
                      id="paymentAmountInput"
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="paymentMethodSelect" className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Instrument / Mode *
                  </label>
                  <select
                    id="paymentMethodSelect"
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe / BHIM)</option>
                    <option value="CASH">Cash Deposit (Bursar Counter)</option>
                    <option value="BANK_TRANSFER">NEFT / RTGS / IMPS</option>
                    <option value="CHEQUE">Demand Draft / Bank Cheque</option>
                    <option value="CARD">Credit / Debit Card</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="referenceNumberInput" className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction Ref / UTR / Cheque Number
                  </label>
                  <input
                    id="referenceNumberInput"
                    type="text"
                    placeholder="e.g. UTR-982187391823"
                    value={paymentForm.referenceNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="notesInput" className="block text-xs font-semibold text-slate-700 mb-1">
                    Internal Bursar Notes / Remarks
                  </label>
                  <textarea
                    id="notesInput"
                    rows={2}
                    placeholder="e.g. Semester V installment clearance verified"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Auto WhatsApp Receipt Checkbox */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={autoSendReceiptWhatsApp}
                      onChange={(e) => setAutoSendReceiptWhatsApp(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Automatically dispatch instant payment confirmation receipt via WhatsApp</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {paymentMutation.isPending ? 'Recording Settlement...' : 'Confirm Fee Settlement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Receipt Voucher Print Modal */}
        {selectedReceiptForPrint && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Print Fee Receipt Voucher"
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <Building2 className="w-5 h-5" />
                  <span>{institution.name || 'EduPulse Institutional ERP'} — Fee Voucher</span>
                </div>
                <button
                  type="button"
                  aria-label="Close receipt modal"
                  onClick={() => setSelectedReceiptForPrint(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Receipt Number:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedReceiptForPrint.referenceNumber || `RCP-${selectedReceiptForPrint.id}`}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Student Roll / ENR:</span>
                  <span className="font-mono font-semibold text-slate-900">{activeEnrollment}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Invoice Reference:</span>
                  <span className="font-mono text-slate-800">{selectedReceiptForPrint.invoiceNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Payment Date:</span>
                  <span className="text-slate-800">{selectedReceiptForPrint.paymentDate}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Instrument:</span>
                  <span className="font-semibold text-slate-800">{selectedReceiptForPrint.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">Amount Settled:</span>
                  <span className="font-black text-emerald-700 text-sm">₹{Number(selectedReceiptForPrint.amount).toLocaleString('en-IN')}</span>
                </div>
                {selectedReceiptForPrint.notes && (
                  <div className="border-b pb-2">
                    <span className="text-slate-500 block mb-0.5">Remarks:</span>
                    <span className="text-slate-700 italic">{selectedReceiptForPrint.notes}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReceiptForPrint(null)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Voucher
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp & SMS Communication Outbox Drawer */}
        <CommunicationOutboxDrawer
          isOpen={isOutboxOpen}
          onClose={() => setIsOutboxOpen(false)}
        />
      </div>
    </div>
  );
}