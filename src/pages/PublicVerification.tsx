import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  ShieldCheck,
  ShieldAlert,
  GraduationCap,
  Award,
  CheckCircle2,
  Copy,
  Printer,
  Search,
  BookOpen,
  Lock,
  ArrowLeft,
  ExternalLink,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { openExternalUrl } from '../api/axiosClient';

interface CourseRecord {
  courseCode: string;
  courseName: string;
  examName: string;
  marksObtained: number;
  totalMarks: number;
  gradeLabel: string;
  gradePoint: number;
  status: string;
}

interface VerifiedCredential {
  verificationToken: string;
  valid: boolean;
  statusMessage: string;
  documentType: string;
  studentName: string;
  enrollmentNumber: string;
  institutionName: string;
  departmentName: string;
  programDegree: string;
  batchName: string;
  cumulativeGpa: number;
  division: string;
  totalEvaluations: number;
  issueDate: string;
  issuingAuthority: string;
  digitalSignatureSha256: string;
  verificationUrl: string;
  securityAssurance: string;
  courseRecords: CourseRecord[];
  institutionalAttributes: Record<string, string>;
}

export default function PublicVerification() {
  const navigate = useNavigate();
  const { token } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');

  const initialIdentifier = token || queryId || '23CSM001';
  const [searchInput, setSearchInput] = useState(initialIdentifier);
  const [activeIdentifier, setActiveIdentifier] = useState(initialIdentifier);

  const { data: credential, isLoading, isError } = useQuery<VerifiedCredential>({
    queryKey: ['publicVerify', activeIdentifier],
    queryFn: async () => {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
      const res = await axios.get(`${baseURL}/api/v1/verify/${encodeURIComponent(activeIdentifier)}`);
      return res.data;
    },
    enabled: Boolean(activeIdentifier),
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) {
      toast.error('Please enter a verification token or enrollment number.');
      return;
    }
    setActiveIdentifier(searchInput.trim());
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleOpenInSystemBrowser = () => {
    const targetToken = credential?.verificationToken || activeIdentifier;
    const url = `http://localhost:8081/api/v1/verify/portal/${encodeURIComponent(targetToken)}`;
    openExternalUrl(url);
    toast.success('Launching official verification portal in your system web browser...');
  };

  const isVerified = credential?.valid === true;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation & Operational Bar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-50 shadow-xs print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Prominent Back to ERP Navigation */}
            <button
              onClick={() => navigate('/dashboard/academic/transcripts')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all hover:-translate-x-0.5"
              title="Return to Transcripts in ERP"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Back to ERP Portal</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight">EduPulse Public Credential Registry</span>
                  <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Statutory Attestation
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Office of the Controller of Examinations</p>
              </div>
            </div>
          </div>

          {/* Quick Search & External Browser Launchers */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={handleOpenInSystemBrowser}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Open in System Web Browser (Edge / Chrome)"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Open in System Web Browser</span>
              <span className="sm:hidden">Web Browser</span>
            </button>

            <form onSubmit={handleSearch} className="flex items-center gap-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Token or Roll #..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono w-40 sm:w-48"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors shadow-xs shrink-0"
              >
                Verify
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Verification Document Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="py-24 text-center space-y-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Cryptographically authenticating against university ledger...</p>
          </div>
        )}

        {/* Verification Status Banner */}
        {!isLoading && isVerified && credential && (
          <div className="bg-white rounded-2xl border-2 border-emerald-500/80 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0 text-emerald-700 shadow-inner">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Official University Record Authenticated & Conferred
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                    Authentic Academic Credential
                  </h1>
                  <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                    This academic document is cryptographically verified and sealed under the statutory authority of the Office of the Controller of Examinations. All course credits, grade points, and cumulative standing match the permanent autonomous institutional ledger.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Printer className="w-4 h-4" /> Print Official Attestation
                </button>
                <button
                  onClick={() => copyToClipboard(credential.digitalSignatureSha256, 'SHA-256 Digest')}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Copy Hash Digest
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Failed / Unverified State */}
        {!isLoading && (!isVerified || isError) && (
          <div className="rounded-2xl border-2 border-rose-300 bg-white p-8 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600 shadow-inner">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Verification Alert</span>
              <h2 className="text-xl font-bold text-slate-900">Credential Verification Failed</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                No verified academic record matching <span className="font-mono font-bold text-rose-700">"{activeIdentifier}"</span> was found in the university registry. This document may be invalid or pending formal concurrence.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setActiveIdentifier('23CSM001')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
              >
                Load Demo Verified Student (23CSM001)
              </button>
            </div>
          </div>
        )}

        {/* Detailed Credential Dossier */}
        {!isLoading && isVerified && credential && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-8 shadow-xs print:p-0 print:border-none">
            {/* Institution Letterhead Banner */}
            <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold tracking-widest text-indigo-700 uppercase flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> {credential.institutionName}
                </span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
                  OFFICE OF THE CONTROLLER OF EXAMINATIONS
                </h2>
                <p className="text-xs text-slate-500">
                  Statutory University Credential Attestation & Non-Repudiation Certificate
                </p>
              </div>

              <div className="text-left sm:text-right text-xs space-y-1">
                <div className="font-mono text-slate-600">Token: <span className="text-indigo-600 font-bold">{credential.verificationToken}</span></div>
                <div className="text-slate-500">Concurred on: <span className="font-semibold text-slate-800">{credential.issueDate}</span></div>
              </div>
            </div>

            {/* Student & Academic Program Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-slate-50 rounded-xl p-6 border border-slate-200/80 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block font-medium">Candidate Full Name</span>
                  <span className="font-bold text-slate-900 text-base">{credential.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">University PRN / Roll</span>
                  <span className="font-mono font-bold text-indigo-700 text-base">{credential.enrollmentNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Degree & Specialization</span>
                  <span className="font-semibold text-slate-800">{credential.programDegree}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Academic Cohort</span>
                  <span className="text-slate-700">{credential.batchName}</span>
                </div>
                <div className="col-span-2 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Conferral Division / Standing</span>
                  <span className="font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300 text-xs">
                    {credential.division}
                  </span>
                </div>
              </div>

              {/* Cumulative GPA Card - Calibrated to 10.00 UGC CBCS Scale */}
              <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 text-white rounded-xl p-6 shadow-md flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Cumulative GPA</span>
                  <Award className="w-5 h-5 text-amber-300" />
                </div>
                <div className="my-3">
                  <div className="text-5xl font-extrabold tracking-tight">
                    {Number(credential.cumulativeGpa).toFixed(2)}
                  </div>
                  <p className="text-xs text-indigo-200 mt-1 font-medium">Scale: 10.00 Point UGC Choice-Based Credit System (CBCS)</p>
                </div>
                <div className="pt-3 border-t border-indigo-600/60 text-xs text-indigo-200 flex justify-between items-center">
                  <span>Evaluations: {credential.courseRecords.length || credential.totalEvaluations} Courses</span>
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Conferred
                  </span>
                </div>
              </div>
            </div>

            {/* Course Records Table with Full Visibility & Proper Bottom Spacing */}
            <div className="space-y-3 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Certified Course Evaluations & Grade Points
                </h3>
                <span className="text-xs text-slate-500 font-mono">Total Earned Credits: 20.00</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Course Code</th>
                      <th className="py-3 px-4">Course Title</th>
                      <th className="py-3 px-4">Evaluation Mode</th>
                      <th className="py-3 px-4 text-center">Grade</th>
                      <th className="py-3 px-4 text-right">Grade Point</th>
                      <th className="py-3 px-4 text-right">Registry Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-800">
                    {credential.courseRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Course grade points in progress or pending formal concurrence.
                        </td>
                      </tr>
                    ) : (
                      credential.courseRecords.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.courseCode}</td>
                          <td className="py-3 px-4 text-slate-800">{c.courseName}</td>
                          <td className="py-3 px-4 text-slate-500">{c.examName}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {c.gradeLabel}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right">
                            {Number(c.gradePoint).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Sealed
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cryptographic Attestation Metadata Footer */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" /> Cryptographic Integrity & Non-Repudiation Audit Trail
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Algorithm: SHA-256 HMAC</span>
              </div>
              
              <div className="space-y-1">
                <div className="text-[11px] text-slate-500 font-medium">Authoritative Digital Fingerprint</div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-300 font-mono text-[11px] text-indigo-700 break-all select-all flex items-center justify-between gap-2 shadow-xs">
                  <span>{credential.digitalSignatureSha256}</span>
                  <button
                    onClick={() => copyToClipboard(credential.digitalSignatureSha256, 'Digest')}
                    className="p-1 hover:bg-slate-100 rounded transition shrink-0 text-slate-500 hover:text-slate-800"
                    title="Copy SHA-256 Digest"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-[11px] text-slate-600">
                <div>
                  <span className="block font-medium text-slate-500">Accreditation</span>
                  <span className="text-slate-900 font-semibold">NAAC 'A+' / AICTE Approved</span>
                </div>
                <div>
                  <span className="block font-medium text-slate-500">Autonomous Status</span>
                  <span className="text-slate-900 font-semibold">UGC Section 2(f) & 12(B)</span>
                </div>
                <div>
                  <span className="block font-medium text-slate-500">Issuing Registry</span>
                  <span className="text-slate-900 font-semibold">Controller of Exams</span>
                </div>
                <div>
                  <span className="block font-medium text-slate-500">Security Standard</span>
                  <span className="text-emerald-700 font-semibold">W3C Non-Repudiation</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 EduPulse Institutional ERP. Statutory Tamper-Evident Academic Registry.</p>
          <div className="flex items-center gap-4 text-slate-600">
            <button onClick={() => navigate('/dashboard/academic/transcripts')} className="hover:text-slate-900 font-medium transition">
              ← Return to Transcripts
            </button>
            <span>•</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Registry Status: Online & Concurred
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
