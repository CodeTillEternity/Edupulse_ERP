import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useInstitutionStore } from '../store/useInstitutionStore';
import { apiClient } from '../config/api';
import { PageFrame } from '../components/ui/PageFrame';
import { Link } from 'react-router-dom';
import {
  Clock,
  Users,
  BookOpen,
  Calendar,
  MapPin,
  ChevronRight,
  Loader2,
  Download,
  Printer,
  Award,
  CheckCircle2,
  Video,
  FileText
} from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { toast } from 'sonner';

interface Section {
  id: number;
  name: string;
  courseOfferingId: number;
  capacity: number;
  currentEnrollment: number;
  isActive: boolean;
}

interface TimetableSlot {
  id: number;
  sectionId: number;
  facultyId: number;
  roomId: number;
  dayOfWeek: string;
  startTime: string | number[];
  endTime: string | number[];
  isActive: boolean;
}

export default function FacultyDashboard() {
  const { user } = useAuthStore();
  const { institution } = useInstitutionStore();

  const { data: facultyProfile } = useQuery<{ firstName?: string; lastName?: string; department?: string; designation?: string }>({
    queryKey: ['faculty-profile-me'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/faculty/me');
      return res.data;
    },
    staleTime: 60000,
  });

  const { data: sections, isLoading: loadingSections } = useQuery<Section[]>({
    queryKey: ['faculty-sections'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/faculty/me/sections');
      return response.data;
    }
  });

  const { data: timetable, isLoading: loadingTimetable } = useQuery<TimetableSlot[]>({
    queryKey: ['faculty-timetable'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/faculty/me/timetable');
      return response.data;
    }
  });

  // Helper to format time (e.g., "09:00:00" or [9, 0] to "09:00 AM")
  const formatTime = (timeData: string | number[]) => {
    if (!timeData) return '';
    let h, m;
    if (Array.isArray(timeData)) {
      h = timeData[0];
      m = timeData[1] || 0;
    } else {
      const parts = timeData.split(':');
      h = parseInt(parts[0], 10);
      m = parseInt(parts[1], 10);
    }
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedH = h % 12 || 12;
    const formattedM = m.toString().padStart(2, '0');
    return `${formattedH}:${formattedM} ${ampm}`;
  };

  // Group timetable by day
  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  
  const facultyName = facultyProfile?.firstName
    ? (facultyProfile.lastName ? `${facultyProfile.firstName} ${facultyProfile.lastName}` : facultyProfile.firstName)
    : (user?.username || 'Faculty Member');

  // Compute total weekly workload hours
  const totalWeeklyHours = useMemo(() => {
    if (!timetable || timetable.length === 0) return 0;
    let totalMinutes = 0;
    timetable.forEach((slot) => {
      const getMin = (t: string | number[]) => {
        if (!t) return 0;
        if (Array.isArray(t)) return t[0] * 60 + (t[1] || 0);
        const parts = t.split(':');
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      };
      const duration = Math.max(0, getMin(slot.endTime) - getMin(slot.startTime));
      totalMinutes += duration;
    });
    return Number((totalMinutes / 60).toFixed(1));
  }, [timetable]);

  const totalStudentsEnrolled = useMemo(() => {
    if (!sections || sections.length === 0) return 0;
    return sections.reduce((sum, s) => sum + (s.currentEnrollment || 0), 0);
  }, [sections]);

  const exportFacultyTimetable = () => {
    if (!timetable || timetable.length === 0) {
      toast.error('No timetable entries to export');
      return;
    }

    const rows = [
      ['FACULTY TEACHING WORKLOAD & TIMETABLE SCHEDULE', ''],
      ['Institution', institution.name || 'Central University System'],
      ['Faculty Name', facultyName],
      ['Department', facultyProfile?.department || 'Academic Affairs'],
      ['Weekly Contact Hours', `${totalWeeklyHours} hrs / week`],
      ['AICTE Compliance Status', totalWeeklyHours <= 16 ? 'Compliant (<= 16h/wk)' : 'Overload (> 16h/wk)'],
      ['Generated On', new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })],
      ['', ''],
      ['Day of Week', 'Slot Time', 'Section / Cohort', 'Room Assigned']
    ];

    daysOfWeek.forEach((day) => {
      const daySlots = timetable.filter((t) => t.dayOfWeek === day);
      daySlots.forEach((slot) => {
        const sec = sections?.find((s) => s.id === slot.sectionId);
        rows.push([
          day,
          `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
          sec ? `Section ${sec.name}` : `Section #${slot.sectionId}`,
          `Room ${slot.roomId}`
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Faculty_Schedule_${facultyName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded personal teaching timetable (CSV).');
  };

  return (
    <PageFrame
      title={`Faculty Academic Portal — ${facultyName}`}
      description={
        <p className="text-xs text-slate-500 mt-1">
          {facultyProfile?.department || 'Academic Department'} • {institution.name || 'Central University'}
        </p>
      }
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" /> Print Schedule
          </button>
          <button
            onClick={exportFacultyTimetable}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export Schedule (CSV)
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Weekly Teaching Load</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalWeeklyHours} hrs</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Contact hours per week</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Assigned Sections</span>
              <BookOpen className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{sections?.length || 0} Cohorts</div>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Active teaching allocations
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Students Under Tutelage</span>
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalStudentsEnrolled} Students</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Across all assigned sections</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>AICTE Workload Status</span>
              <Award className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">
              {totalWeeklyHours <= 16 ? 'Compliant' : 'High Load'}
            </div>
            <p className="text-[11px] text-cyan-700 font-medium mt-0.5">
              ≤ 16 hrs / week ceiling
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Weekly Schedule (Takes up 2 columns on medium screens) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Weekly Schedule</h3>
            </div>
            
            {loadingTimetable ? (
              <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : timetable && timetable.length > 0 ? (
              <div className="grid gap-4">
                {daysOfWeek.map(day => {
                  const daySlots = timetable.filter(t => t.dayOfWeek === day).sort((a, b) => {
                    const getMinutes = (t: string | number[]) => {
                      if (!t) return 0;
                      if (Array.isArray(t)) return t[0] * 60 + (t[1] || 0);
                      const parts = t.split(':');
                      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                    };
                    return getMinutes(a.startTime) - getMinutes(b.startTime);
                  });
                  if (daySlots.length === 0) return null;
                  
                  return (
                    <div key={day} className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-600">
                        {day}
                      </div>
                      <div className="divide-y divide-slate-100">
                        {daySlots.map(slot => {
                          const section = sections?.find(s => s.id === slot.sectionId);
                          return (
                            <div key={slot.id} className="p-3 flex items-start sm:items-center flex-col sm:flex-row gap-3 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center space-x-2 min-w-[140px]">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span className="text-sm font-semibold text-slate-900">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4 flex-1">
                                <div className="flex items-center space-x-1">
                                  <BookOpen className="h-4 w-4 text-slate-400" />
                                  <span className="text-sm text-slate-700">
                                    Section {section ? section.name : slot.sectionId}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4 text-slate-400" />
                                  <span className="text-sm text-slate-700">
                                    Room {slot.roomId}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-slate-200 bg-white rounded-xl p-8 text-center shadow-xs">
                <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-900">No scheduled classes</p>
                <p className="text-xs text-slate-500 mt-1">Your weekly timetable is currently empty.</p>
              </div>
            )}
          </div>

          {/* Right Sidebar: My Sections & Quick Actions */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">My Sections</h3>
              </div>
              
              {loadingSections ? (
                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
              ) : sections && sections.length > 0 ? (
                <div className="border border-slate-200 bg-white rounded-xl divide-y divide-slate-100 shadow-xs overflow-hidden">
                  {sections.map(section => (
                    <div key={section.id} className="p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-slate-900">Section {section.name}</span>
                        <StatusBadge status={section.isActive ? 'ACTIVE' : 'INACTIVE'} />
                      </div>
                      <div className="flex items-center text-xs text-slate-500 space-x-3 mt-2">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {section.currentEnrollment} / {section.capacity}
                        </span>
                        <span>Offering #{section.courseOfferingId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-slate-200 bg-white rounded-xl p-6 text-center text-sm text-slate-500 shadow-xs">
                  No sections assigned.
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Faculty Academic Actions</h3>
              </div>
              <div className="grid gap-2">
                <Link 
                  to="/dashboard/attendance" 
                  className="flex items-center justify-between p-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-colors shadow-xs group"
                >
                  <span className="text-sm font-semibold text-slate-900">Take Class Attendance</span>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </Link>
                <Link 
                  to="/dashboard/classroom" 
                  className="flex items-center justify-between p-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-colors shadow-xs group"
                >
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-rose-500" />
                    <span className="text-sm font-semibold text-slate-900">Launch Virtual Lecture</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </Link>
                <Link 
                  to="/dashboard/examinations" 
                  className="flex items-center justify-between p-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-colors shadow-xs group"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-semibold text-slate-900">Grading &amp; Assessment Records</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </Link>
                <Link 
                  to="/dashboard/hr/leave" 
                  className="flex items-center justify-between p-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-colors shadow-xs group"
                >
                  <span className="text-sm font-semibold text-slate-900">UGC Statutory Leave Application</span>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}