import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { StudentAvatar } from './StudentAvatar';
import { useInstitutionStore } from '../store/useInstitutionStore';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Loader2, CreditCard, ShieldCheck, Printer, Copy, Check, Phone } from 'lucide-react';

interface StudentIdCardModalProps {
  studentId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentIdCardModal({ studentId, open, onOpenChange }: StudentIdCardModalProps) {
  const { institution } = useInstitutionStore();
  const [copiedToken, setCopiedToken] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['student-id-card', studentId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/students/${studentId}/id-card`);
      return res.data?.data;
    },
    enabled: open && !!studentId,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyToken = async () => {
    if (!data?.verificationCode) return;
    try {
      await navigator.clipboard.writeText(data.verificationCode);
      setCopiedToken(true);
      toast.success('Verification token copied to clipboard');
      setTimeout(() => setCopiedToken(false), 2000);
    } catch {
      toast.error('Unable to copy verification token');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-base font-bold text-slate-900">
            <CreditCard className="w-5 h-5 mr-2 text-slate-700" />
            Official Student ID Card
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Verifiable digital student identity credential generated from persisted records.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-2" />
            <p className="text-xs text-slate-500">Generating student ID card...</p>
          </div>
        ) : isError ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-xs">
            {(error as any)?.response?.data?.message || 'Failed to generate ID card.'}
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* Identity Card Front Preview */}
            <div
              id="printable-student-id-card"
              className="border-2 rounded-xl overflow-hidden bg-white shadow-lg text-slate-900"
              style={{ borderColor: institution.brandPrimary || '#0f172a' }}
            >
              <div
                className="text-white px-4 py-3 flex items-center justify-between gap-2"
                style={{ backgroundColor: institution.brandPrimary || '#0f172a' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {institution.logoUrl ? (
                    <img
                      src={institution.logoUrl}
                      alt={`${institution.name} Crest`}
                      className="w-8 h-8 rounded-md object-contain bg-white p-0.5 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-white/15 border border-white/25 flex items-center justify-center text-[10px] font-black tracking-tight shrink-0">
                      {(institution.code || 'ERP').slice(0, 3).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-xs font-black tracking-wider uppercase truncate">
                      {institution.name || 'Institutional ERP'}
                    </h3>
                    <p className="text-[9px] text-white/80 uppercase tracking-widest truncate">
                      {institution.campus || 'Student Identification Card'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-emerald-300 text-[10px] font-bold shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>VERIFIED</span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <StudentAvatar
                    studentId={data.studentId}
                    fullName={data.fullName}
                    sizeClassName="w-16 h-20 rounded"
                    textClassName="text-sm"
                    className="border border-slate-300 shrink-0"
                  />
                  <div className="space-y-1 text-xs min-w-0">
                    <p className="font-bold text-sm text-slate-900 leading-tight truncate">{data.fullName}</p>
                    <div className="space-y-0.5 text-[11px] text-slate-600">
                      <p><span className="font-semibold text-slate-800">Enrollment No:</span> <span className="font-mono font-bold text-slate-900">{data.enrollmentNumber}</span></p>
                      <p><span className="font-semibold text-slate-800">Roll No:</span> <span className="font-mono">{data.rollNumber || 'N/A'}</span></p>
                      <p><span className="font-semibold text-slate-800">Department:</span> {data.department}</p>
                      <p><span className="font-semibold text-slate-800">Program:</span> {data.program}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-700">Internal ID:</span> #{data.studentId}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Status:</span> <span className="font-bold text-emerald-700">{data.status}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Valid Through:</span> {data.validThroughYear}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Issue Date:</span> {data.issueDate}
                  </div>
                </div>

                {(institution.phone || institution.address) && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-500 gap-2">
                    <span className="truncate">{institution.address}</span>
                    {institution.phone && (
                      <span className="flex items-center gap-1 font-mono shrink-0">
                        <Phone className="w-2.5 h-2.5" /> {institution.phone}
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-dashed border-slate-300 flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>TOKEN: {data.verificationCode ? `${data.verificationCode.substring(0, 16)}...` : 'N/A'}</span>
                  <span className="text-slate-500 font-sans font-semibold">
                    Registrar · {institution.code || 'INST'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 print:hidden">
              {data.verificationCode ? (
                <Button variant="ghost" size="sm" onClick={handleCopyToken} className="text-xs text-slate-600">
                  {copiedToken ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                  {copiedToken ? 'Copied Token' : 'Copy Token'}
                </Button>
              ) : <div />}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  className="text-white"
                  style={{ backgroundColor: institution.brandPrimary || '#0f172a' }}
                  onClick={handlePrint}
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Save PDF
                </Button>
              </div>
            </div>

            <style>{`
              @media print {
                /* Exclude backdrop, header, dialog controls, and page */
                body * {
                  visibility: hidden !important;
                }
                #printable-student-id-card,
                #printable-student-id-card * {
                  visibility: visible !important;
                }
                #printable-student-id-card {
                  position: fixed !important;
                  left: 50% !important;
                  top: 40px !important;
                  transform: translateX(-50%) !important;
                  width: 380px !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  box-shadow: none !important;
                  border: 2px solid #0f172a !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  z-index: 99999 !important;
                }
                /* Hide dialog overlays and wrappers entirely in print */
                [data-radix-portal], [role="dialog"], [data-state="open"] {
                  background: transparent !important;
                  border: none !important;
                  box-shadow: none !important;
                }
              }
            `}</style>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
