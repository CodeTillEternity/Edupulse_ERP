import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPortalDashboard } from '../../api/portalService';
import { useInstitutionStore } from '../../store/useInstitutionStore';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Award,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Video,
  Download,
  Printer,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';

export default function StudentDashboard() {
  const { institution } = useInstitutionStore();
  const { data: dashboard, isLoading, isError, error } = useQuery({
    queryKey: ['portal-dashboard'],
    queryFn: getPortalDashboard,
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Loading your academic dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-xl mx-auto my-8">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-rose-900">Unable to load dashboard</h3>
        <p className="text-sm text-rose-600 mt-1">
          {error?.response?.data?.message || error?.message || 'Could not retrieve your student metrics.'}
        </p>
      </div>
    );
  }

  const {
    studentName = 'Student',
    enrollmentNumber = 'N/A',
    batchName = 'N/A',
    departmentName = 'N/A',
    cumulativeGpa = 0.0,
    todayClasses = [],
    unpaidInvoices = [],
    totalUnpaidAmount = 0
  } = dashboard || {};

  const formattedGpa = Number(cumulativeGpa || 0).toFixed(2);
  const formattedUnpaid = Number(totalUnpaidAmount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  const exportSemesterSummaryCsv = () => {
    const rows = [
      ['STUDENT ACADEMIC & TIMETABLE SNAPSHOT', '', '', ''],
      ['Institution', institution.name || 'Central University System', '', ''],
      ['Institution Code', institution.code || 'CUS-01', '', ''],
      ['Student Name', studentName, '', ''],
      ['Enrollment Number', enrollmentNumber, '', ''],
      ['Batch Cohort', batchName, '', ''],
      ['Department', departmentName, '', ''],
      ['Cumulative GPA', formattedGpa, '', ''],
      ['Outstanding Dues', `INR ${formattedUnpaid}`, '', ''],
      ['Generated On', new Date().toISOString(), '', ''],
      ['', '', '', ''],
      ['Course Code', 'Course Title', 'Slot Time', 'Room & Faculty'],
      ...todayClasses.map((c) => [
        c.courseCode || 'CLS',
        c.courseName || '',
        `${c.startTime || ''} - ${c.endTime || ''}`,
        `Room ${c.roomNumber || '-'} (${c.facultyName || 'Faculty'})`,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Portal_Snapshot_${enrollmentNumber}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported semester portal summary (CSV).');
  };

  return (
    <div className="space-y-6">
      {/* 1. Clean Institutional Student Identity Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>{institution.name || 'Institutional Portal'} ({institution.code || 'INST'})</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                Active Semester Cohort
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {studentName}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl">
              Enrollment No: <span className="font-mono font-bold text-slate-900">{enrollmentNumber}</span> • Batch: <span className="font-semibold text-slate-900">{batchName}</span> • Dept: <span className="font-semibold text-slate-900">{departmentName}</span>
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={exportSemesterSummaryCsv}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <Link
              to="/portal/classroom"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
            >
              <Video className="w-3.5 h-3.5 text-rose-400" />
              <span>Live Classroom</span>
            </Link>
            <Link
              to="/portal/materials"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Faculty Notes</span>
            </Link>
            <Link
              to="/portal/fee-ledger"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Fee Ledger</span>
            </Link>
            <Link
              to="/portal/schedule"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Schedule</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards (Academic Snapshot & Fee Assessment) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Snapshot Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Academic Snapshot
              </span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Award className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                {formattedGpa}
              </span>
              <span className="text-sm font-semibold text-slate-500">/ 10.00 UGC CBCS CGPA</span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Cumulative grade point average computed across published university examination results.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Good Academic Standing
            </span>
            <Link
              to="/portal/academics"
              className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              <span>View Transcripts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Action Required / Finance Alert Card */}
        <div
          className={`rounded-2xl p-6 border shadow-xs flex flex-col justify-between ${
            unpaidInvoices.length > 0
              ? 'bg-amber-50/60 border-amber-200/80'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Fee Assessment Status
              </span>
              <div
                className={`p-2 rounded-xl ${
                  unpaidInvoices.length > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {unpaidInvoices.length > 0 ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
            </div>

            {unpaidInvoices.length > 0 ? (
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                    ₹{formattedUnpaid}
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  You have <span className="font-bold text-slate-900">{unpaidInvoices.length}</span> unpaid institutional invoice(s) due for settlement.
                </p>
              </div>
            ) : (
              <div>
                <span className="text-2xl font-bold text-slate-900">All Cleared</span>
                <p className="text-xs text-slate-500 mt-2">
                  All semester fee installments are settled. No pending payment dues.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-xs text-slate-500">Razorpay RBI-Compliant Gateway</span>
            <Link
              to="/portal/fees"
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-colors ${
                unpaidInvoices.length > 0
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{unpaidInvoices.length > 0 ? 'Pay Outstanding Now' : 'View Invoices'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Today's Classes Chronological List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Today's Classes</h2>
              <p className="text-xs text-slate-500">Chronological daily lecture schedule</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {todayClasses.length} Scheduled
          </span>
        </div>

        {todayClasses.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No classes scheduled for today</h4>
            <p className="text-xs text-slate-400 mt-1">Enjoy your study break or prepare for upcoming assessments.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayClasses.map((item, index) => (
              <div
                key={item.id || index}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                    {item.courseCode || 'CLS'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.courseName}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="inline-flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {item.startTime} - {item.endTime}
                        </span>
                      </span>
                      <span className="inline-flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Room {item.roomNumber}</span>
                      </span>
                      {item.facultyName && (
                        <span className="inline-flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.facultyName}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="self-end sm:self-center">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {item.dayOfWeek}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
