import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Database,
  ArrowRight,
  RefreshCw,
  Users,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import {
  validateStudentsCsv,
  commitStudents,
  validateInvoicesCsv,
  commitInvoices,
  type StudentImportRow,
  type FeeInvoiceImportRow,
  type ImportValidationResult,
  type ImportExecutionResponse,
} from '../api/migrationService';
import { resolveBaseUrl } from '../api/axiosClient';
import { toast } from 'sonner';

export const DataMigration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'FEES'>('STUDENTS');
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [studentResult, setStudentResult] = useState<ImportValidationResult<StudentImportRow> | null>(null);
  const [invoiceResult, setInvoiceResult] = useState<ImportValidationResult<FeeInvoiceImportRow> | null>(null);
  const [commitSummary, setCommitSummary] = useState<ImportExecutionResponse | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setSelectedFile(file);
    setCommitSummary(null);

    setLoading(true);
    try {
      if (activeTab === 'STUDENTS') {
        const res = await validateStudentsCsv(file);
        setStudentResult(res);
        if (res.errorRows > 0) {
          toast.warning(`File analyzed: ${res.validRows} valid rows, ${res.errorRows} errors detected.`);
        } else {
          toast.success(`All ${res.validRows} rows passed pre-flight validation! Ready to commit.`);
        }
      } else {
        const res = await validateInvoicesCsv(file);
        setInvoiceResult(res);
        if (res.errorRows > 0) {
          toast.warning(`File analyzed: ${res.validRows} valid rows, ${res.errorRows} errors detected.`);
        } else {
          toast.success(`All ${res.validRows} rows passed pre-flight validation! Ready to commit.`);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to validate uploaded file.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    setCommitting(true);
    try {
      if (activeTab === 'STUDENTS' && studentResult) {
        const validRows = studentResult.rows.filter((r) => r.valid);
        const res = await commitStudents(validRows);
        setCommitSummary(res);
        setStudentResult(null);
        setSelectedFile(null);
        toast.success(res.message);
      } else if (activeTab === 'FEES' && invoiceResult) {
        const validRows = invoiceResult.rows.filter((r) => r.valid);
        const res = await commitInvoices(validRows);
        setCommitSummary(res);
        setInvoiceResult(null);
        setSelectedFile(null);
        toast.success(res.message);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to commit records to database.');
    } finally {
      setCommitting(false);
    }
  };

  const downloadTemplate = (type: 'students' | 'fees') => {
    const url = `${resolveBaseUrl()}/api/v1/migration/templates/${type}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <Database className="w-4 h-4" /> Institutional Onboarding & Migration
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Bulk Data Ingestion Engine</h1>
          <p className="text-slate-400 text-sm mt-1">
            Migrate thousands of existing students, enrollment registries, and historical fee ledgers from Excel/CSV in under 60 seconds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => downloadTemplate(activeTab === 'STUDENTS' ? 'students' : 'fees')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            Download Sample {activeTab === 'STUDENTS' ? 'Students' : 'Fee Invoices'} Template
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-8">
        <button
          onClick={() => {
            setActiveTab('STUDENTS');
            setSelectedFile(null);
            setStudentResult(null);
            setCommitSummary(null);
          }}
          className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-all relative ${
            activeTab === 'STUDENTS' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Bulk Student Enrollment ({studentResult ? studentResult.totalRows : 'Ready'})
        </button>

        <button
          onClick={() => {
            setActiveTab('FEES');
            setSelectedFile(null);
            setInvoiceResult(null);
            setCommitSummary(null);
          }}
          className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-all relative ${
            activeTab === 'FEES' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Historical Fee Invoices & Dues
        </button>
      </div>

      {/* Upload Zone */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">
              Upload {activeTab === 'STUDENTS' ? 'Student Registry' : 'Fee Invoices'} CSV Spreadsheet
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports standard RFC 4180 CSV files exported from Excel, Google Sheets, Tally, or legacy ERP systems.
            </p>
          </div>

          <label className="inline-block cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={loading || committing}
              className="hidden"
            />
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all">
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Spreadsheet...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  Select CSV File to Ingest
                </>
              )}
            </span>
          </label>

          {selectedFile && (
            <p className="text-xs text-indigo-300 font-mono mt-2">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
      </div>

      {/* Success Commitment Banner */}
      {commitSummary && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 text-emerald-200 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Migration Batch Committed Successfully</h4>
              <p className="text-xs text-emerald-300/80">{commitSummary.message}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-emerald-500/20 text-xs">
            <div>
              <span className="text-emerald-400 font-semibold block">Records Ingested</span>
              <span className="text-lg font-bold text-white">{commitSummary.successCount}</span>
            </div>
            <div>
              <span className="text-emerald-400 font-semibold block">Failed / Skipped</span>
              <span className="text-lg font-bold text-white">{commitSummary.failureCount}</span>
            </div>
            <div>
              <span className="text-emerald-400 font-semibold block">Partition Isolation</span>
              <span className="text-white font-mono">Multi-Tenant Scoped</span>
            </div>
            <div>
              <span className="text-emerald-400 font-semibold block">Ledger Status</span>
              <span className="text-emerald-300 font-bold">Synchronized</span>
            </div>
          </div>
        </div>
      )}

      {/* Student Validation Preview Table */}
      {studentResult && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pre-Flight Report:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg font-mono">
                Total: {studentResult.totalRows}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-lg font-mono font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Valid: {studentResult.validRows}
              </span>
              {studentResult.errorRows > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs rounded-lg font-mono font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" /> Errors: {studentResult.errorRows}
                </span>
              )}
            </div>

            <button
              onClick={handleCommit}
              disabled={committing || studentResult.validRows === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
            >
              {committing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Committing Batch...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" /> Commit {studentResult.validRows} Valid Students
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto max-h-96 border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-800 sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Enrollment</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Dept</th>
                  <th className="p-3">Batch</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {studentResult.rows.map((row) => (
                  <tr key={row.rowNumber} className={row.valid ? 'hover:bg-slate-800/30' : 'bg-rose-950/20'}>
                    <td className="p-3 text-slate-500">{row.rowNumber}</td>
                    <td className="p-3 font-bold text-white">{row.enrollmentNumber || '—'}</td>
                    <td className="p-3 font-sans text-slate-200">
                      {row.firstName} {row.lastName}
                    </td>
                    <td className="p-3 text-slate-400">{row.email}</td>
                    <td className="p-3 text-indigo-400">{row.departmentCode}</td>
                    <td className="p-3 text-slate-300">{row.batchName}</td>
                    <td className="p-3 text-slate-400">{row.category || 'GENERAL'}</td>
                    <td className="p-3 text-slate-300">{row.status}</td>
                    <td className="p-3">
                      {row.valid ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> OK
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1 font-sans text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {row.validationError}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Validation Preview Table */}
      {invoiceResult && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pre-Flight Report:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg font-mono">
                Total: {invoiceResult.totalRows}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded-lg font-mono font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Valid: {invoiceResult.validRows}
              </span>
              {invoiceResult.errorRows > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs rounded-lg font-mono font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" /> Errors: {invoiceResult.errorRows}
                </span>
              )}
            </div>

            <button
              onClick={handleCommit}
              disabled={committing || invoiceResult.validRows === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
            >
              {committing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Committing Invoices...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" /> Commit {invoiceResult.validRows} Fee Invoices
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto max-h-96 border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-800 sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Invoice Number</th>
                  <th className="p-3">Enrollment</th>
                  <th className="p-3">Fee Structure</th>
                  <th className="p-3">Gross (₹)</th>
                  <th className="p-3">Paid (₹)</th>
                  <th className="p-3">Discount (₹)</th>
                  <th className="p-3">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {invoiceResult.rows.map((row) => (
                  <tr key={row.rowNumber} className={row.valid ? 'hover:bg-slate-800/30' : 'bg-rose-950/20'}>
                    <td className="p-3 text-slate-500">{row.rowNumber}</td>
                    <td className="p-3 font-bold text-white">{row.invoiceNumber}</td>
                    <td className="p-3 text-indigo-400">{row.enrollmentNumber}</td>
                    <td className="p-3 font-sans text-slate-200">{row.feeStructureName}</td>
                    <td className="p-3 text-slate-200">{row.grossAmount?.toLocaleString('en-IN') || '0.00'}</td>
                    <td className="p-3 text-emerald-400">{row.amountPaid?.toLocaleString('en-IN') || '0.00'}</td>
                    <td className="p-3 text-slate-400">{row.discount?.toLocaleString('en-IN') || '0.00'}</td>
                    <td className="p-3">
                      {row.valid ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> OK
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1 font-sans text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {row.validationError}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
