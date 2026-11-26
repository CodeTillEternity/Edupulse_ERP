import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FileText,
  Calendar,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  BookOpen,
  GraduationCap,
  Sparkles,
  MessageSquare,
  Loader2,
  Download,
  Printer,
  Layers
} from 'lucide-react';
import {
  createExam,
  getExams,
  getStudentsForExam,
  getExamResults,
  recordStudentResults,
} from '../../api/examService';
import { getCourseOfferings } from '../../api/academicService';
import { communicationService } from '../../api/communicationService';
import { CommunicationOutboxDrawer } from '../../components/communication/CommunicationOutboxDrawer';
import { useInstitutionStore } from '../../store/useInstitutionStore';

/**
 * Calculates standard UGC Choice Based Credit System (CBCS) 10-point scale grades
 */
export const calculateUgcGrade = (marks, totalMarks = 100) => {
  if (marks === '' || marks === null || marks === undefined || isNaN(marks)) {
    return null;
  }
  const max = Number(totalMarks) > 0 ? Number(totalMarks) : 100;
  const numMarks = Number(marks);
  const pct = (numMarks / max) * 100;

  if (pct >= 90) return { letter: 'O', point: 10.0, description: 'Outstanding', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  if (pct >= 80) return { letter: 'A+', point: 9.0, description: 'Excellent', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
  if (pct >= 70) return { letter: 'A', point: 8.0, description: 'Very Good', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
  if (pct >= 60) return { letter: 'B+', point: 7.0, description: 'Good', badge: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
  if (pct >= 55) return { letter: 'B', point: 6.0, description: 'Above Average', badge: 'bg-amber-50 text-amber-800 border-amber-200' };
  if (pct >= 50) return { letter: 'C', point: 5.0, description: 'Average', badge: 'bg-orange-50 text-orange-800 border-orange-200' };
  if (pct >= 40) return { letter: 'P', point: 4.0, description: 'Pass', badge: 'bg-teal-50 text-teal-800 border-teal-200' };
  return { letter: 'F', point: 0.0, description: 'Fail / Re-appear', badge: 'bg-rose-50 text-rose-800 border-rose-200' };
};

export default function ExamManager() {
  const queryClient = useQueryClient();
  const { institution } = useInstitutionStore();
  const [activeTab, setActiveTab] = useState('exams'); // 'exams' | 'grades'

  // Exam Creation Form State
  const [examForm, setExamForm] = useState({
    name: '',
    examDate: new Date().toISOString().split('T')[0],
    totalMarks: '100',
    courseOfferingId: '',
  });

  // Grade Entry State
  const [selectedExamId, setSelectedExamId] = useState('');
  const [marksState, setMarksState] = useState({}); // { [studentId]: { marksObtained: '', remarks: '' } }
  const [isOutboxOpen, setIsOutboxOpen] = useState(false);
  const [dispatchingExamId, setDispatchingExamId] = useState(null);

  const handleBulkDispatchHallTickets = async (exam) => {
    try {
      setDispatchingExamId(exam.id);
      const res = await communicationService.dispatchHallTickets({
        examId: exam.id,
        examTitle: exam.name || exam.title,
        examDate: exam.examDate,
        hallLocation: exam.roomName || exam.venue || 'Assigned Exam Hall',
        channel: 'WHATSAPP',
      });
      toast.success(
        `Exam Hall Tickets dispatched to ${res.length} student(s) & guardians!`,
        {
          action: {
            label: 'View Outbox',
            onClick: () => setIsOutboxOpen(true),
          },
        }
      );
    } catch {
      toast.error('Failed to dispatch exam hall tickets');
    } finally {
      setDispatchingExamId(null);
    }
  };

  // Queries
  const { data: exams = [], isLoading: isExamsLoading } = useQuery({
    queryKey: ['academicExams'],
    queryFn: getExams,
  });

  const { data: courseOfferings = [] } = useQuery({
    queryKey: ['courseOfferings'],
    queryFn: getCourseOfferings,
  });

  const { data: enrolledStudents = [], isLoading: isStudentsLoading } = useQuery({
    queryKey: ['examStudents', selectedExamId],
    queryFn: () => getStudentsForExam(selectedExamId),
    enabled: Boolean(selectedExamId),
  });

  const { data: existingResults = [] } = useQuery({
    queryKey: ['examResults', selectedExamId],
    queryFn: () => getExamResults(selectedExamId),
    enabled: Boolean(selectedExamId),
  });

  // Pre-fill existing marks when exam or existingResults change
  useEffect(() => {
    if (existingResults && existingResults.length > 0) {
      const initialMarks = {};
      existingResults.forEach((res) => {
        initialMarks[res.studentId] = {
          marksObtained: String(res.marksObtained || ''),
          remarks: res.remarks || '',
        };
      });
      setMarksState((prev) => ({ ...initialMarks, ...prev }));
    }
  }, [existingResults]);

  // Create Exam Mutation
  const createExamMutation = useMutation({
    mutationFn: (data) => createExam(data),
    onSuccess: (newExam) => {
      queryClient.invalidateQueries({ queryKey: ['academicExams'] });
      toast.success(`Exam "${newExam.name}" scheduled successfully!`);
      setExamForm({
        name: '',
        examDate: new Date().toISOString().split('T')[0],
        totalMarks: '100',
        courseOfferingId: '',
      });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || error.message || 'Failed to schedule exam';
      toast.error(msg);
    },
  });

  // Submit Grades Mutation
  const submitGradesMutation = useMutation({
    mutationFn: ({ examId, payload }) => recordStudentResults(examId, payload),
    onSuccess: (savedResults) => {
      queryClient.invalidateQueries({ queryKey: ['examResults', selectedExamId] });
      queryClient.invalidateQueries({ queryKey: ['studentTranscript'] });
      queryClient.invalidateQueries({ queryKey: ['academicExams'] });
      queryClient.invalidateQueries({ queryKey: ['naacMetrics'] });
      toast.success(`Successfully recorded grades for ${savedResults.length} students!`, {
        action: {
          label: 'View Transcript',
          onClick: () => {
            const firstStudent = enrolledStudents.find(s => s.id === savedResults[0]?.studentId);
            if (firstStudent?.enrollmentNumber) {
              window.location.href = `/dashboard/academic/transcripts?enrollment=${firstStudent.enrollmentNumber}`;
            }
          }
        }
      });
    },
    onError: (error) => {
      const msg = error.response?.data?.message || error.message || 'Failed to submit grades';
      toast.error(msg);
    },
  });

  const handleCreateExam = (e) => {
    e.preventDefault();
    if (!examForm.name.trim()) {
      toast.error('Please provide an exam name');
      return;
    }
    if (!examForm.courseOfferingId) {
      toast.error('Please select a Course Offering');
      return;
    }
    if (!examForm.totalMarks || Number(examForm.totalMarks) <= 0) {
      toast.error('Total marks must be greater than zero');
      return;
    }

    createExamMutation.mutate({
      name: examForm.name.trim(),
      examDate: examForm.examDate,
      totalMarks: Number(examForm.totalMarks),
      courseOfferingId: Number(examForm.courseOfferingId),
    });
  };

  const handleMarkChange = (studentId, field, value) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSubmitGrades = () => {
    if (!selectedExamId) {
      toast.error('Please select an exam first');
      return;
    }

    const maxMarks = activeExam ? Number(activeExam.totalMarks) : 100;
    const payload = [];
    for (const student of enrolledStudents) {
      const entry = marksState[student.id];
      if (entry && entry.marksObtained !== '' && entry.marksObtained !== undefined) {
        const val = Number(entry.marksObtained);
        if (isNaN(val) || val < 0) {
          toast.error(`Marks for ${student.firstName} ${student.lastName} must be 0 or higher.`);
          return;
        }
        if (val > maxMarks) {
          toast.error(`Marks for ${student.firstName} ${student.lastName} (${val}) exceeds exam total marks (${maxMarks}).`);
          return;
        }
        payload.push({
          studentId: student.id,
          marksObtained: val,
          remarks: entry.remarks || '',
        });
      }
    }

    if (payload.length === 0) {
      toast.error('Please enter marks for at least one student');
      return;
    }

    submitGradesMutation.mutate({ examId: Number(selectedExamId), payload });
  };

  const activeExam = exams.find((e) => String(e.id) === String(selectedExamId));

  const exportExamScheduleCsv = () => {
    const headers = ['Exam ID', 'Exam Name', 'Course Code', 'Course Title', 'Semester', 'Exam Date', 'Total Marks'];
    const rows = exams.map(e => [
      `EX-${e.id}`,
      e.name,
      e.courseCode || '',
      e.courseName || '',
      e.semester || '',
      e.examDate,
      `${e.totalMarks} pts`
    ]);
    const metaRows = [
      ['STATUTORY UNIVERSITY EXAMINATION TIMETABLE DOSSIER', '', '', '', '', '', ''],
      ['Institution', institution.name || 'Central University System', '', '', '', '', ''],
      ['Institution Code', institution.code || 'CUS-01', '', '', '', '', ''],
      ['Office', 'Office of the Controller of Examinations', '', '', '', '', ''],
      ['Generated On', new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), '', '', '', '', ''],
      ['', '', '', '', '', '', '']
    ];
    const all = [...metaRows, headers, ...rows];
    const csvContent = 'data:text/csv;charset=utf-8,' + all.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Exam_Schedule_${institution.code || 'INST'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded examination schedule register (CSV).');
  };

  const exportGradeLedgerCsv = () => {
    if (!activeExam) {
      toast.error('Select an examination first to export grades');
      return;
    }
    const maxMarks = Number(activeExam.totalMarks) || 100;
    const headers = ['Roll / PRN', 'Student Name', 'Marks Obtained', 'Max Marks', 'Percentage', 'UGC Grade', 'Grade Point', 'Evaluation Remarks'];
    const rows = enrolledStudents.map(student => {
      const entry = marksState[student.id];
      const marks = entry ? entry.marksObtained : '';
      const ugc = calculateUgcGrade(marks, maxMarks);
      const pct = marks !== '' && !isNaN(marks) ? `${((Number(marks) / maxMarks) * 100).toFixed(1)}%` : '—';
      return [
        student.rollNumber || student.enrollmentNumber || `ID-${student.id}`,
        `${student.firstName} ${student.lastName}`,
        marks !== '' ? String(marks) : 'ABSENT',
        String(maxMarks),
        pct,
        ugc ? ugc.letter : '—',
        ugc ? String(ugc.point) : '—',
        entry?.remarks || ''
      ];
    });
    const metaRows = [
      ['OFFICIAL EXAMINATION GRADE AWARD SHEET', '', '', '', '', '', '', ''],
      ['Institution', institution.name || 'Central University System', '', '', '', '', '', ''],
      ['Examination', `${activeExam.name} (${activeExam.courseCode})`, '', '', '', '', '', ''],
      ['Exam Date', activeExam.examDate, '', '', '', '', '', ''],
      ['Grading Standard', '10-Point Choice Based Credit System (CBCS)', '', '', '', '', '', ''],
      ['Timestamp', new Date().toISOString(), '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '']
    ];
    const all = [...metaRows, headers, ...rows];
    const csvContent = 'data:text/csv;charset=utf-8,' + all.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Grade_Ledger_${activeExam.courseCode || 'EXAM'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded official grade award ledger (CSV).');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Award className="w-3.5 h-3.5" /> Office of the Controller of Examinations
            <span className="text-slate-300">•</span>
            <span className="text-slate-600 font-medium normal-case">{institution.name || 'Central University'}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-indigo-600" />
            Examinations &amp; Evaluation Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Schedule university assessments, record student marks, and process UGC 10-point CBCS classifications.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap shrink-0">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Register</span>
          </button>

          <button
            onClick={activeTab === 'exams' ? exportExamScheduleCsv : exportGradeLedgerCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{activeTab === 'exams' ? 'Export CSV' : 'Export Grades'}</span>
          </button>

          <button
            onClick={() => setIsOutboxOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
            title="Open WhatsApp & SMS Outbox Logs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Outbox</span>
          </button>

          {/* Tab Controls */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveTab('exams')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'exams'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Exams
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'grades'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-4 h-4" />
              Grade Entry
            </button>
          </div>
        </div>
      </div>

      {/* Institutional Examination Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Scheduled Examinations</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{exams.length} Papers</div>
          <p className="text-[11px] text-slate-500 mt-0.5">End-semester &amp; mid-term tests</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Course Offerings Assessed</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{courseOfferings.length} Courses</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Syllabus mapped
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Grading Scale</span>
            <Award className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">10-Point CBCS</div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">O through F grade point bands</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Enrolled Candidates</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{selectedExamId ? `${enrolledStudents.length} Students` : 'Select Exam'}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{selectedExamId ? 'Loaded for selected paper' : 'Pick a paper under Grade Entry'}</p>
        </div>
      </div>

      {/* TAB 1: EXAM SCHEDULING & LIST */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scheduling Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Schedule New Exam
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Define a test or exam for an active course offering.
            </p>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Exam Name <span className="text-rose-500">*</span>
                </label>
                <input
                  aria-label="Exam Name"
                  type="text"
                  placeholder="e.g. Midterm 1, Final Exam"
                  value={examForm.name}
                  onChange={(e) => setExamForm({ ...examForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Course Offering <span className="text-rose-500">*</span>
                </label>
                <select
                  aria-label="Course Offering"
                  value={examForm.courseOfferingId}
                  onChange={(e) => setExamForm({ ...examForm, courseOfferingId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                >
                  <option value="">-- Select Course Offering --</option>
                  {courseOfferings.map((co) => (
                    <option key={co.id} value={co.id}>
                      {co.courseCode || 'Course'} - {co.courseName || co.courseTitle || `Offering #${co.id}`} ({co.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Exam Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    aria-label="Exam Date"
                    type="date"
                    value={examForm.examDate}
                    onChange={(e) => setExamForm({ ...examForm, examDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Total Marks <span className="text-rose-500">*</span>
                  </label>
                  <input
                    aria-label="Total Marks"
                    type="number"
                    step="0.01"
                    min="1"
                    value={examForm.totalMarks}
                    onChange={(e) => setExamForm({ ...examForm, totalMarks: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createExamMutation.isPending}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {createExamMutation.isPending ? 'Scheduling Exam...' : 'Schedule Exam'}
              </button>
            </form>
          </div>

          {/* Scheduled Exams List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Scheduled Examinations</h3>
                <p className="text-xs text-slate-500">Upcoming and completed assessments</p>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {exams.length} Total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Exam Name</th>
                    <th className="py-3 px-4 font-semibold">Course</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Marks</th>
                    <th className="py-3 px-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {isExamsLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        Loading scheduled examinations...
                      </td>
                    </tr>
                  ) : exams.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-slate-400">
                        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="font-medium text-slate-600">No exams scheduled yet</p>
                        <p className="text-xs text-slate-400">Use the form on the left to schedule an exam.</p>
                      </td>
                    </tr>
                  ) : (
                    exams.map((exam) => (
                      <tr key={exam.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{exam.name}</div>
                          <div className="text-xs text-slate-500">{exam.semester || 'Semester'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <div className="font-medium text-slate-800">{exam.courseCode || 'Course'}</div>
                          <div className="text-slate-500">{exam.courseName}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                          {exam.examDate}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-bold text-right text-indigo-700">
                          {exam.totalMarks} pts
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleBulkDispatchHallTickets(exam)}
                              disabled={dispatchingExamId === exam.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
                              title="1-Click WhatsApp Bulk Dispatch of Admit Cards to all candidates"
                            >
                              {dispatchingExamId === exam.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                              <span>Dispatch Hall Tickets</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedExamId(String(exam.id));
                                setActiveTab('grades');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                              Enter Grades
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRADE ENTRY */}
      {activeTab === 'grades' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Top Control Bar */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Select Examination to Grade
              </label>
              <select
                aria-label="Select Exam"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choose Exam --</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} - {exam.courseCode || 'Course'} (Max: {exam.totalMarks} pts)
                  </option>
                ))}
              </select>
            </div>

            {activeExam && (
              <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block">Course</span>
                  <span className="font-semibold text-slate-800">{activeExam.courseCode}</span>
                </div>
                <div className="border-l pl-4 border-slate-200">
                  <span className="text-slate-400 block">Total Marks</span>
                  <span className="font-semibold text-indigo-700">{activeExam.totalMarks}</span>
                </div>
                <div className="border-l pl-4 border-slate-200">
                  <span className="text-slate-400 block">Exam Date</span>
                  <span className="font-semibold text-slate-800">{activeExam.examDate}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmitGrades}
              disabled={submitGradesMutation.isPending || !selectedExamId || enrolledStudents.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitGradesMutation.isPending ? 'Submitting Grades...' : 'Submit Grades'}
            </button>
          </div>

          {/* Students Grading Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold">Enrollment #</th>
                  <th className="py-3 px-4 font-semibold w-40">Marks Obtained</th>
                  <th className="py-3 px-4 font-semibold text-center">Grade Assigned</th>
                  <th className="py-3 px-4 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {!selectedExamId ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-medium text-slate-600">No exam selected</p>
                      <p className="text-xs text-slate-400">Please select an exam from the dropdown above to load enrolled students.</p>
                    </td>
                  </tr>
                ) : isStudentsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Loading enrolled students...
                    </td>
                  </tr>
                ) : enrolledStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-medium text-slate-600">No enrolled students found</p>
                      <p className="text-xs text-slate-400">No active students enrolled in this offering's batch.</p>
                    </td>
                  </tr>
                ) : (
                  enrolledStudents.map((student) => {
                    const studentMarks = marksState[student.id]?.marksObtained ?? '';
                    const studentRemarks = marksState[student.id]?.remarks ?? '';
                    const existingRes = existingResults.find((r) => r.studentId === student.id);
                    const maxMarks = activeExam ? Number(activeExam.totalMarks) : 100;
                    const isExceeding = studentMarks !== '' && Number(studentMarks) > maxMarks;
                    const liveGrade = studentMarks !== '' && !isNaN(studentMarks)
                      ? calculateUgcGrade(studentMarks, maxMarks)
                      : (existingRes ? { letter: existingRes.gradeLabel, point: existingRes.gradePoint, description: 'Recorded Grade', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' } : null);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                          {student.enrollmentNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1">
                            <input
                              aria-label={`Marks for ${student.firstName} ${student.lastName}`}
                              type="number"
                              step="0.01"
                              min="0"
                              max={maxMarks}
                              placeholder="0.00"
                              value={studentMarks}
                              onChange={(e) =>
                                handleMarkChange(student.id, 'marksObtained', e.target.value)
                              }
                              className={`w-28 px-3 py-1.5 border rounded-lg text-sm font-semibold focus:outline-none transition-all ${
                                isExceeding
                                  ? 'border-rose-400 bg-rose-50 text-rose-700 focus:ring-2 focus:ring-rose-500'
                                  : 'border-slate-300 text-indigo-700 focus:ring-2 focus:ring-indigo-500 bg-white'
                              }`}
                            />
                            {isExceeding && (
                              <span className="text-[10px] text-rose-600 font-medium">
                                Max {maxMarks} pts
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {liveGrade ? (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${liveGrade.badge}`}>
                              <span>Grade {liveGrade.letter}</span>
                              <span className="text-[10px] font-mono opacity-80">({Number(liveGrade.point).toFixed(1)} pts)</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Enter marks for preview</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <input
                            aria-label={`Remarks for ${student.firstName} ${student.lastName}`}
                            type="text"
                            placeholder="Optional feedback..."
                            value={studentRemarks}
                            onChange={(e) =>
                              handleMarkChange(student.id, 'remarks', e.target.value)
                            }
                            className="w-full max-w-xs px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WhatsApp & SMS Communication Outbox Drawer */}
      <CommunicationOutboxDrawer
        isOpen={isOutboxOpen}
        onClose={() => setIsOutboxOpen(false)}
        defaultFilter="EXAM_HALL_TICKET"
      />
    </div>
  );
}
