import React from 'react';
import { Printer, Download, X, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

export interface ThermalReceiptData {
  invoiceNumber: string;
  studentName: string;
  studentId: string;
  courseName: string;
  semester: string;
  academicYear: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  transactionReference: string;
  institutionName?: string;
  campusName?: string;
  cashierName?: string;
  breakdown?: { label: string; amount: number }[];
}

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ThermalReceiptData | null;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
}) => {
  if (!isOpen || !receipt) return null;

  const institutionName = receipt.institutionName || 'ARYA COLLEGE OF ENGINEERING & IT';
  const campusName = receipt.campusName || 'Kukas Campus, Jaipur — 302028';
  const cashier = receipt.cashierName || 'Desktop POS Terminal #01';

  const defaultBreakdown = receipt.breakdown || [
    { label: 'Academic Tuition Fee', amount: receipt.amount * 0.75 },
    { label: 'Semester Exam Clearance', amount: receipt.amount * 0.15 },
    { label: 'Campus Infra & Lab Cess', amount: receipt.amount * 0.10 },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPlaintext = () => {
    const divider = '========================================';
    const singleDivider = '----------------------------------------';
    
    let content = `${institutionName}\n`;
    content += `${campusName}\n`;
    content += `OFFICIAL FEE RECEIPT (ESC/POS 80mm)\n`;
    content += `${divider}\n`;
    content += `Receipt No : ${receipt.invoiceNumber}\n`;
    content += `Date & Time: ${receipt.paymentDate}\n`;
    content += `Cashier / T: ${cashier}\n`;
    content += `${singleDivider}\n`;
    content += `Student ID : ${receipt.studentId}\n`;
    content += `Student    : ${receipt.studentName}\n`;
    content += `Program    : ${receipt.courseName}\n`;
    content += `Term / AY  : ${receipt.semester} (${receipt.academicYear})\n`;
    content += `${divider}\n`;
    content += `ITEMIZED PARTICULARS            AMOUNT\n`;
    content += `${singleDivider}\n`;
    
    defaultBreakdown.forEach((item) => {
      const label = item.label.padEnd(28, ' ').substring(0, 28);
      const amt = item.amount.toFixed(2).padStart(12, ' ');
      content += `${label}${amt}\n`;
    });
    
    content += `${divider}\n`;
    content += `TOTAL SETTLED (INR):        ${receipt.amount.toFixed(2).padStart(12, ' ')}\n`;
    content += `${divider}\n`;
    content += `Mode of Pay : ${receipt.paymentMethod}\n`;
    content += `Txn / Ref ID: ${receipt.transactionReference}\n`;
    content += `Status      : PAYMENT RECONCILED / CLEAR\n`;
    content += `${divider}\n\n`;
    content += `         Authorized Signatory\n`;
    content += `     Accounts & Bursar Division\n\n`;
    content += `  *** Powered by EduPulse Cloud ERP ***\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Thermal_Receipt_${receipt.invoiceNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Control Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50 print:hidden">
          <div className="flex items-center space-x-2">
            <Printer className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              80mm POS Thermal Receipt
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable 80mm ESC/POS Container */}
        <div className="p-6 bg-slate-100 flex justify-center overflow-y-auto max-h-[70vh]">
          <div
            id="thermal-receipt-printable"
            className="w-[300px] bg-white text-black p-4 font-mono text-[11px] leading-relaxed shadow-md border border-slate-300 rounded-sm"
          >
            {/* Header / Crest */}
            <div className="text-center pb-2 border-b border-dashed border-black">
              <div className="font-extrabold text-[12px] tracking-tight leading-tight uppercase">
                {institutionName}
              </div>
              <div className="text-[10px] text-gray-700 mt-0.5">
                {campusName}
              </div>
              <div className="text-[9px] uppercase tracking-wider font-semibold text-gray-500 mt-1">
                Cashier Fee Collection Voucher
              </div>
            </div>

            {/* Receipt Metadata */}
            <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span className="font-bold">{receipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{receipt.paymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Counter:</span>
                <span>{cashier}</span>
              </div>
            </div>

            {/* Student Particulars */}
            <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Student ID:</span>
                <span className="font-bold">{receipt.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="font-semibold truncate max-w-[170px]">{receipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span>Program:</span>
                <span className="truncate max-w-[170px]">{receipt.courseName}</span>
              </div>
              <div className="flex justify-between">
                <span>Semester:</span>
                <span>{receipt.semester}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="py-2 border-b border-dashed border-black text-[10px]">
              <div className="flex justify-between font-bold border-b border-black pb-1 mb-1">
                <span>PARTICULARS</span>
                <span>AMOUNT (₹)</span>
              </div>
              {defaultBreakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between py-0.5">
                  <span className="truncate max-w-[180px]">{item.label}</span>
                  <span>{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>

            {/* Total Settled */}
            <div className="py-2 border-b-2 border-black text-[12px] font-bold flex justify-between">
              <span>TOTAL PAID:</span>
              <span>₹{receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {/* Payment Details */}
            <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Pay Mode:</span>
                <span className="font-bold uppercase">{receipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Ref / Txn ID:</span>
                <span className="font-mono text-[9px] truncate max-w-[160px]">
                  {receipt.transactionReference}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-emerald-700 font-bold mt-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                <span>PAYMENT CLEARED & AUDITED</span>
              </div>
            </div>

            {/* Barcode Mock & Signatures */}
            <div className="pt-3 text-center space-y-2">
              <div className="flex justify-center">
                <div className="tracking-[3px] font-bold text-[10px] border border-black px-3 py-1 font-mono">
                  * {receipt.invoiceNumber} *
                </div>
              </div>
              <div className="text-[9px] text-gray-500 pt-2 border-t border-dotted border-gray-400">
                This is a computer generated POS receipt issued on cloud-linked desktop terminal.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-between print:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadPlaintext}
            className="text-xs h-9"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Voucher (.txt)
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-9"
            >
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              className="text-xs h-9 bg-slate-900 hover:bg-slate-800 text-white"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print (80mm)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
