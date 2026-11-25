import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  Building2,
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
import { useInstitutionStore } from '../store/useInstitutionStore';
import { toast } from 'sonner';

export const DataMigration: React.FC = () => {
  const queryClient = useQueryClient();
  const { institution } = useInstitutionStore();
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
        queryClient.invalidateQueries({ queryKey: ['students'] });
        queryClient.invalidateQueries({ queryKey: ['naacMetrics'] });
        queryClient.invalidateQueries({ queryKey: ['nirfSummary'] });
        toast.success(res.message);
      } else if (activeTab === 'FEES' && invoiceResult) {
        const validRows = invoiceResult.rows.filter((r) => r.valid);
        const res = await commitInvoices(validRows);
        setCommitSummary(res);
        setInvoiceResult(null);
        setSelectedFile(null);
        queryClient.invalidateQueries({ queryKey: ['studentLedgers'] });
        queryClient.invalidateQueries({ queryKey: ['feeStructures'] });
        queryClient.invalidateQueries({ queryKey: ['naacMetrics'] });
        toast.success(res.message);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to commit records to database.');
    } finally {
      setCommitting(false);
    }
  };

  const generateClientTemplate = (type: 'STUDENTS' | 'FEES') => {
    if (type === 'STUDENTS') {
      const headers = ['enrollmentNumber', 'firstName', 'lastName', 'email', 'phone', 'gender', 'departmentCode', 'batchName', 'category', 'status'];
      const sampleRows = [
        ['ENR-2026-1001', 'Aarav', 'Sharma', 'aarav.sharma@college.edu', '+919876543210', 'MALE', 'CSE', '2024-2028', 'GENERAL', 'ACTIVE'],
        ['ENR-2026-1002', 'Priya', 'Patel', 'priya.patel@college.edu', '+919876543211', 'FEMALE', 'ECE', '2024-2028', 'OBC', 'ACTIVE'],
        ['ENR-2026-1003', 'Rohan', 'Verma', 'rohan.verma@college.edu', '+919876543212', 'MALE', 'ME', '2024-2028', 'SC', 'ACTIVE'],
        ['ENR-2026-1004', 'Ananya', 'Iyer', 'ananya.iyer@college.edu', '+919876543213', 'FEMALE', 'CSE', '2024-2028', 'EWS', 'ACTIVE'],
      ];
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...sampleRows].map(e => e.join(',')).join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `EduPulse_Students_Import_Template.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Generated official Student Registry import template CSV.');
    } else {
      const headers = ['invoiceNumber', 'enrollmentNumber', 'feeStructureName', 'grossAmount', 'amountPaid', 'discount', 'dueDate', 'status'];
      const sampleRows = [
        ['INV-2026-001', 'ENR-2026-1001', 'B.Tech Annual Tuition 2026', '65000', '65000', '0', '2026-12-31', 'PAID'],
        ['INV-2026-002', 'ENR-2026-1002', 'B.Tech Annual Tuition 2026', '65000', '35000', '5000', '2026-12-31', 'PARTIAL'],
        ['INV-2026-003', 'ENR-2026-1003', 'B.Tech Annual Tuition 2026', '65000', '0', '0', '2026-12-31', 'UNPAID'],
      ];
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...sampleRows].map(e => e.join(',')).join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `EduPulse_Fee_Invoices_Import_Template.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Generated official Historical Fee Invoices import template CSV.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Database className="w-4 h-4" /> Institutional Onboarding &amp; Migration
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium normal-case flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {institution.name || 'Central University System'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Bulk Data Ingestion Engine</h1>
          <p className="text-slate-500 text-sm mt-1">
            Migrate thousands of student registries, cohort allocations, and historical fee ledgers from Excel/CSV in under 60 seconds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => generateClientTemplate(activeTab)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-2xs transition-all"
            title="Download CSV template format"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            Download Sample {activeTab === 'STUDENTS' ? 'Students' : 'Fee Invoices'} Template
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-8">
        <button
          onClick={() => {
            setActiveTab('STUDENTS');
            setSelectedFile(null);
            setStudentResult(null);
            setCommitSummary(null);
          }}
          className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-all relative ${
            activeTab === 'STUDENTS' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Bulk Student Enrollment ({studentResult ? `${studentResult.totalRows} Analyzed` : 'Ready'})
        </button>

        <button
          onClick={() => {
            setActiveTab('FEES');
            setSelectedFile(null);
            setInvoiceResult(null);
            setCommitSummary(null);
          }}
          className={`flex items-center gap-2 pb-4 text-sm font-semibold transition-all relative ${
            activeTab === 'FEES' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Historical Fee Invoices &amp; Dues
        </button>
      </div>

      {/* Upload Zone */}
      <div className="bg-white border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-3xl p-10 transition-colors relative overflow-hidden shadow-sm">
        <div className="max-w-xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Upload {activeTab === 'STUDENTS' ? 'Student Registry' : 'Fee Invoices'} CSV Spreadsheet
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports standard RFC 4180 CSV files exported from Excel, Google Sheets, or legacy university ERPs.
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
            <span className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-md transition-all">
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
            <p className="text-xs text-indigo-700 font-mono font-semibold mt-2">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
      </div>

      {/* Success Commitment Banner */}
      {commitSummary && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-950 space-y-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Migration Batch Committed Successfully</h4>
              <p className="text-xs text-emerald-800">{commitSummary.message}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-emerald-200 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block">Records Ingested</span>
              <span className="text-lg font-bold text-slate-900">{commitSummary.successCount}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Failed / Skipped</span>
              <span className="text-lg font-bold text-slate-900">{commitSummary.failureCount}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Partition Isolation</span>
              <span className="text-slate-900 font-mono font-semibold">Multi-Tenant Scoped</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Ledger Status</span>
              <span className="text-emerald-700 font-bold">Synchronized</span>
            </div>
          </div>
        </div>
      )}

      {/* Student Validation Preview Table */}
      {studentResult && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Pre-Flight Report:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-mono font-medium">
                Total: {studentResult.totalRows}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-lg font-mono font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Valid: {studentResult.validRows}
              </span>
              {studentResult.errorRows > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs rounded-lg font-mono font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Errors: {studentResult.errorRows}
                </span>
              )}
            </div>

            <button
              onClick={handleCommit}
              disabled={committing || studentResult.validRows === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-all self-start sm:self-auto"
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

          <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase tracking-wider text-[11px] text-slate-600 border-b border-slate-200 sticky top-0">
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
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {studentResult.rows.map((row) => (
                  <tr key={row.rowNumber} className={row.valid ? 'hover:bg-slate-50/80' : 'bg-rose-50/50'}>
                    <td className="p-3 text-slate-400">{row.rowNumber}</td>
                    <td className="p-3 font-bold text-slate-900">{row.enrollmentNumber || '—'}</td>
                    <td className="p-3 font-sans text-slate-800 font-medium">
                      {row.firstName} {row.lastName}
                    </td>
                    <td className="p-3 text-slate-600">{row.email}</td>
                    <td className="p-3 text-indigo-700 font-semibold">{row.departmentCode}</td>
                    <td className="p-3 text-slate-700">{row.batchName}</td>
                    <td className="p-3 text-slate-600">{row.category || 'GENERAL'}</td>
                    <td className="p-3 text-slate-600">{row.status}</td>
                    <td className="p-3">
                      {row.valid ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> OK
                        </span>
                      ) : (
                        <span className="text-rose-700 flex items-center gap-1 font-sans text-xs font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" /> {row.validationError}
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
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Pre-Flight Report:</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-mono font-medium">
                Total: {invoiceResult.totalRows}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-lg font-mono font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Valid: {invoiceResult.validRows}
              </span>
              {invoiceResult.errorRows > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-xs rounded-lg font-mono font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Errors: {invoiceResult.errorRows}
                </span>
              )}
            </div>

            <button
              onClick={handleCommit}
              disabled={committing || invoiceResult.validRows === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition-all self-start sm:self-auto"
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

          <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase tracking-wider text-[11px] text-slate-600 border-b border-slate-200 sticky top-0">
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
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {invoiceResult.rows.map((row) => (
                  <tr key={row.rowNumber} className={row.valid ? 'hover:bg-slate-50/80' : 'bg-rose-50/50'}>
                    <td className="p-3 text-slate-400">{row.rowNumber}</td>
                    <td className="p-3 font-bold text-slate-900">{row.invoiceNumber}</td>
                    <td className="p-3 text-indigo-700 font-semibold">{row.enrollmentNumber}</td>
                    <td className="p-3 font-sans text-slate-800 font-medium">{row.feeStructureName}</td>
                    <td className="p-3 text-slate-700">₹{row.grossAmount?.toLocaleString('en-IN') || '0.00'}</td>
                    <td className="p-3 text-emerald-700 font-semibold">₹{row.amountPaid?.toLocaleString('en-IN') || '0.00'}</td>
                    <td className="p-3 text-slate-500">₹{row.discount?.toLocaleString('en-IN') || '0.00'}</td>
                    <td className="p-3">
                      {row.valid ? (
                        <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> OK
                        </span>
                      ) : (
                        <span className="text-rose-700 flex items-center gap-1 font-sans text-xs font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" /> {row.validationError}
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
