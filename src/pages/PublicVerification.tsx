import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
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
} from 'lucide-react';
import { toast } from 'sonner';

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

  const isVerified = credential?.valid === true;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Authoritative Header Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">EduPulse Public Credential Registry</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  Non-Repudiation
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous Degree & Transcript Verification Gateway</p>
            </div>
          </div>

          {/* Quick Search Toolbar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Token or Roll # (e.g. 23CSM001)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900/90 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
            >
              Verify
            </button>
          </form>
        </div>
      </header>

      {/* Main Verification Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="py-24 text-center space-y-4 bg-slate-950/40 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-400">Cryptographically querying institutional ledger...</p>
          </div>
        )}

        {/* Verification Status Banner */}
        {!isLoading && isVerified && credential && (
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 p-6 shadow-xl shadow-emerald-950/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400 shadow-inner">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Official Record Authenticated
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    Authentic Academic Credential
                  </h1>
                  <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                    This academic document is certified genuine and cryptographically bound to the institutional registry. 
                    The cumulative GPA, evaluation grades, and student identity match the sealed university records.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Printer className="w-4 h-4 text-slate-300" /> Print Official Attestation
                </button>
                <button
                  onClick={() => copyToClipboard(credential.digitalSignatureSha256, 'SHA-256 Fingerprint')}
                  className="px-4 py-2 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-medium rounded-xl border border-emerald-800/50 transition flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Copy Hash Digest
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Failed / Unverified State */}
        {!isLoading && (!isVerified || isError) && (
          <div className="rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-950 to-slate-950 p-8 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400 shadow-inner">
              <ShieldAlert className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Security Warning</span>
              <h2 className="text-xl font-bold text-white">Credential Verification Failed</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No verified academic record matching <span className="font-mono text-rose-300">"{activeIdentifier}"</span> was found in the university registry. 
                This document may be counterfeit, altered, or not yet officially conferred by the Controller of Examinations.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setActiveIdentifier('23CSM001')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition shadow"
              >
                Load Demo Verified Student (23CSM001)
              </button>
            </div>
          </div>
        )}

        {/* Detailed Credential Dossier */}
        {!isLoading && isVerified && credential && (
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-8 space-y-8 print:bg-white print:text-black print:border-none print:p-0">
            {/* Institution Letterhead Banner */}
            <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
                  {credential.institutionName}
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                  OFFICE OF THE CONTROLLER OF EXAMINATIONS
                </h2>
                <p className="text-xs text-slate-400">
                  Statutory University Credential Attestation & Non-Repudiation Certificate
                </p>
              </div>

              <div className="text-right text-xs space-y-1">
                <div className="font-mono text-slate-300">Token: <span className="text-indigo-400 font-bold">{credential.verificationToken}</span></div>
                <div className="text-slate-400">Concurred on: {credential.issueDate}</div>
              </div>
            </div>

            {/* Student & Academic Program Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-slate-900/60 rounded-xl p-6 border border-slate-800/80 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Candidate Full Name</span>
                  <span className="font-bold text-white text-sm">{credential.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">University Roll / PRN</span>
                  <span className="font-mono font-bold text-indigo-400 text-sm">{credential.enrollmentNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Degree & Specialization</span>
                  <span className="font-semibold text-slate-200">{credential.programDegree}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Academic Cohort</span>
                  <span className="text-slate-300">{credential.batchName}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Conferral Division / Standing</span>
                  <span className="font-bold text-emerald-400">{credential.division}</span>
                </div>
              </div>

              {/* Cumulative GPA Card */}
              <div className="bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-900 rounded-xl p-6 border border-indigo-500/30 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Cumulative GPA</span>
                  <Award className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="my-3">
                  <div className="text-4xl font-extrabold text-white tracking-tight">
                    {Number(credential.cumulativeGpa).toFixed(2)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Scale: 4.00 UGC Quality Standards</p>
                </div>
                <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex justify-between">
                  <span>Evaluations: {credential.totalEvaluations}</span>
                  <span className="text-emerald-400 font-medium">Verified Active</span>
                </div>
              </div>
            </div>

            {/* Course Records Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Certified Course Evaluations & Grade Points
              </h3>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-300 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Course Code</th>
                      <th className="py-2.5 px-4 font-semibold">Course Title</th>
                      <th className="py-2.5 px-4 font-semibold">Evaluation Mode</th>
                      <th className="py-2.5 px-4 font-semibold text-center">Grade</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Grade Point</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Registry Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                    {credential.courseRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          Course grade points in progress or pending formal concurrence.
                        </td>
                      </tr>
                    ) : (
                      credential.courseRecords.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-900/40 transition">
                          <td className="py-3 px-4 font-mono font-bold text-white">{c.courseCode}</td>
                          <td className="py-3 px-4 text-slate-200">{c.courseName}</td>
                          <td className="py-3 px-4 text-slate-400">{c.examName}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                              {c.gradeLabel}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-white text-right">
                            {Number(c.gradePoint).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
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
            <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" /> Cryptographic Integrity Audit Trail
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Algorithm: SHA-256 HMAC</span>
              </div>
              
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">Authoritative Digital Fingerprint</div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-indigo-300 break-all select-all flex items-center justify-between gap-2">
                  <span>{credential.digitalSignatureSha256}</span>
                  <button
                    onClick={() => copyToClipboard(credential.digitalSignatureSha256, 'Digest')}
                    className="p-1 hover:bg-slate-800 rounded transition shrink-0 text-slate-400 hover:text-white"
                    title="Copy SHA-256 Digest"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-[11px] text-slate-400">
                <div>
                  <span className="block font-medium text-slate-500">Accreditation</span>
                  <span className="text-slate-300 font-semibold">NAAC 'A+' / AICTE Approved</span>
                </div>
                <div>
                  <span className="block font-medium text-slate-500">Autonomous Status</span>
                  <span className="text-slate-300 font-semibold">UGC Recognized</span>
                </div>
                <div>
                  <span className="block font-medium text-slate-500">Issuing Registry</span>
                  <span className="text-slate-300 font-semibold">Controller of Exams</span>
                </div>
                <div>
                  <span className="block font-medium text-slate-500">Security Standard</span>
                  <span className="text-emerald-400 font-semibold">W3C Compliant Cryptographic Attestation</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 EduPulse Institutional ERP. Tamper-evident academic credentials platform.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/login" className="hover:text-white transition">Staff & Student Login</Link>
            <span>•</span>
            <span className="text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Registry Online
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
