import { useState, useMemo } from 'react';
import { Search, Loader2, Download, Printer, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '../config/api';
import { Input } from '../components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useInstitutionStore } from '../store/useInstitutionStore';
import { useMyStudentId } from '../hooks/useMyStudentId';
import type { AttendanceResponse } from '../types/attendance';
import FacultyAttendance from './FacultyAttendance';
import { AdminAttendanceWorkspace } from '../components/attendance/AdminAttendanceWorkspace';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

function StandardAttendance() {
  const { user } = useAuthStore();
  const { institution } = useInstitutionStore();
  const { data: myStudentId, isLoading: isLoadingId } = useMyStudentId();
  const isPersonalView = user?.role === 'STUDENT' || user?.role === 'PARENT';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const [adminViewMode, setAdminViewMode] = useState<'hierarchy' | 'ledger'>('hierarchy');
  const [searchTerm, setSearchTerm] = useState('');
  const [exceptionsOnly, setExceptionsOnly] = useState(false);

  const { data: records, isLoading, isError } = useQuery<AttendanceResponse[]>({
    queryKey: ['attendance', isPersonalView, myStudentId],
    queryFn: async () => {
      if (isPersonalView) {
        if (!myStudentId) return [];
        const res = await apiClient.get(`/api/v1/attendance/student/${myStudentId}`);
        return res.data || [];
      }
      const res = await apiClient.get('/api/v1/attendance');
      return res.data || [];
    },
    enabled: isPersonalView ? !!myStudentId : true
  });

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    return records.filter(record => {
      if (exceptionsOnly && record.status === 'PRESENT') return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const name = (record.studentName || '').toLowerCase();
      const roll = (record.rollNumber || '').toLowerCase();
      const course = (record.courseCode || '').toLowerCase();
      return name.includes(term) || roll.includes(term) || course.includes(term);
    });
  }, [records, searchTerm, exceptionsOnly]);

  if (isLoading || (isPersonalView && isLoadingId)) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const exportAttendanceLedgerCsv = () => {
    const list = isPersonalView ? (records || []) : filteredRecords;
    if (list.length === 0) {
      toast.error('No attendance records available to export.');
      return;
    }
    const formatDateCell = (d: any) =>
      Array.isArray(d) ? `${d[0]}-${String(d[1]).padStart(2, '0')}-${String(d[2]).padStart(2, '0')}` : String(d || '—');

    const headers = isPersonalView
      ? ['Date', 'Course/Subject', 'Status', 'Marked By']
      : ['Date', 'Student Name', 'Roll Number', 'Status', 'Remarks'];
    const rows = list.map((rec) =>
      isPersonalView
        ? [formatDateCell(rec.date), rec.courseCode || 'General', rec.status, rec.markedBy || '-']
        : [formatDateCell(rec.date), rec.studentName || '-', rec.rollNumber || '-', rec.status, rec.remarks || '-']
    );
    const metaRows = [
      ['STATUTORY ATTENDANCE REGISTER EXPORT', '', '', '', ''],
      ['Institution', institution.name || 'Central University System', '', '', ''],
      ['Institution Code', institution.code || 'CUS-01', '', '', ''],
      ['Exported On', new Date().toISOString(), '', '', ''],
      ['', '', '', '', '']
    ];
    const all = [...metaRows, headers, ...rows];
    const csvContent = 'data:text/csv;charset=utf-8,' + all.map((r) => r.map((c) => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Ledger_${institution.code || 'INST'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${list.length} attendance records (CSV).`);
  };

  const personalTotal = records?.length || 0;
  const personalPresent = records?.filter((r) => r.status === 'PRESENT').length || 0;
  const personalPct = personalTotal > 0 ? Math.round((personalPresent / personalTotal) * 100) : null;

  if (isPersonalView) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{user?.role === 'PARENT' ? 'Ward Attendance' : 'My Attendance'}</h1>
            <p className="text-slate-500 text-sm">{institution.name || 'Institutional'} verified classroom attendance records.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" /> Print
            </button>
            <button
              type="button"
              onClick={exportAttendanceLedgerCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
            </button>
          </div>
        </div>

        {personalPct !== null && (
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            personalPct < 75 ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            <span className="flex items-center gap-2">
              {personalPct < 75 ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              <span>
                Cumulative Attendance: {personalPct}% ({personalPresent} / {personalTotal} classes) —{' '}
                {personalPct < 75 ? 'Below UGC 75% Exam Eligibility Minimum' : 'UGC 75% Threshold Cleared'}
              </span>
            </span>
          </div>
        )}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-x-auto mt-6">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold px-6 py-4">Date</TableHead>
                <TableHead className="font-semibold px-6 py-4">Course/Subject</TableHead>
                <TableHead className="font-semibold px-6 py-4">Status</TableHead>
                <TableHead className="font-semibold px-6 py-4">Marked By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isError ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-destructive">Failed to load attendance.</TableCell>
                </TableRow>
              ) : !records || records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-slate-500">No attendance records found. Attendance data will appear after attendance is recorded.</TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="px-6 py-4 text-slate-600">
                      {Array.isArray(record.date) 
                        ? new Date(record.date[0], record.date[1] - 1, record.date[2]).toLocaleDateString()
                        : new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-slate-600">{record.courseCode || 'General'}</TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                        record.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-slate-600">{record.markedBy || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            {isAdmin ? 'Attendance Oversight' : 'Attendance Records'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isAdmin && adminViewMode === 'hierarchy'
              ? 'Browse institutional sections, lecture sessions, coverage metrics, and student rosters.'
              : 'Monitor daily student attendance records and audit logs.'}
          </p>
        </div>

        {isAdmin ? (
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setAdminViewMode('hierarchy')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                adminViewMode === 'hierarchy'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Section & Session Oversight
            </button>
            <button
              onClick={() => setAdminViewMode('ledger')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                adminViewMode === 'ledger'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Master Ledger View
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setExceptionsOnly(prev => !prev)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              exceptionsOnly 
                ? 'bg-amber-600 text-white hover:bg-amber-700' 
                : 'bg-black text-white hover:bg-slate-800'
            }`}
          >
            {exceptionsOnly ? 'Showing Exceptions Only' : 'View Exceptions'}
          </button>
        )}
      </div>

      {isAdmin && adminViewMode === 'hierarchy' ? (
        <AdminAttendanceWorkspace />
      ) : (
        <>
          <div className="bg-white p-4 rounded-t-2xl border-b border-slate-100 flex justify-between items-center shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  type="text" 
                  placeholder="Search by student name or roll number..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border-slate-200 rounded-lg text-sm w-full sm:w-72 h-10"
                />
              </div>
              {isAdmin && (
                <button 
                  onClick={() => setExceptionsOnly(prev => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    exceptionsOnly 
                      ? 'bg-amber-600 text-white hover:bg-amber-700' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {exceptionsOnly ? 'Showing Exceptions Only' : 'Filter Exceptions'}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-500 font-medium">
                {filteredRecords.length} records {exceptionsOnly && '(exceptions)'}
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" /> Print
              </button>
              <button
                type="button"
                onClick={exportAttendanceLedgerCsv}
                disabled={filteredRecords.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
              </button>
            </div>
          </div>

          <div className="bg-white rounded-b-2xl shadow-sm border border-slate-100 border-t-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold px-6 py-4">Date</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Student Name</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Roll Number</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Status</TableHead>
                  <TableHead className="font-semibold px-6 py-4">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                      <div className="flex justify-center items-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-destructive">Failed to load attendance.</TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                      {records && records.length > 0 ? 'No matching attendance records found.' : 'No attendance records found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="px-6 py-4 font-medium text-slate-700">
                        {Array.isArray(record.date) 
                          ? new Date(record.date[0], record.date[1] - 1, record.date[2]).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          : new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) === 'Invalid Date'
                            ? record.date 
                            : new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        }
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                            <span>{record.studentName?.charAt(0) || '?'}</span>
                          </div>
                          <div className="font-semibold text-slate-900">{record.studentName}</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-slate-600">{record.rollNumber}</TableCell>
                      <TableCell className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                          record.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {record.status}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-slate-500 text-sm">{record.remarks || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

export default function Attendance() {
  const { user } = useAuthStore();
  if (user?.role === 'FACULTY') {
    return <FacultyAttendance />;
  }
  return <StandardAttendance />;
}
