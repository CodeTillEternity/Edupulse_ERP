import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { useInstitutionStore } from '../store/useInstitutionStore';
import { PageFrame } from '../components/ui/PageFrame';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  MapPin,
  Loader2,
  BookOpen,
  Clock,
  Download,
  Printer,
  Search,
  ExternalLink
} from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface Section {
  id: number;
  name: string;
  courseOfferingId: number;
  capacity: number;
  currentEnrollment: number;
  isActive: boolean;
}

interface SectionStudent {
  id: number;
  sectionId: number;
  studentId: number;
  rollNumber: string;
  studentName: string;
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

export default function FacultySections() {
  const { institution } = useInstitutionStore();
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [rosterQuery, setRosterQuery] = useState('');

  // 1. Fetch assigned sections
  const { data: sections, isLoading: loadingSections, isError: isSectionsError, error: sectionsError } = useQuery<Section[]>({
    queryKey: ['faculty-sections'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/faculty/me/sections');
      return res.data;
    },
    retry: false
  });

  // 2. Fetch section details
  const { data: sectionDetails, isLoading: loadingDetails, isError: isDetailsError } = useQuery<Section>({
    queryKey: ['section-details', selectedSectionId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/sections/${selectedSectionId}`);
      return res.data;
    },
    enabled: selectedSectionId !== null
  });

  // 3. Fetch students roster
  const { data: roster, isLoading: loadingRoster, isError: isRosterError } = useQuery<SectionStudent[]>({
    queryKey: ['section-students', selectedSectionId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/sections/${selectedSectionId}/students`);
      return res.data;
    },
    enabled: selectedSectionId !== null
  });

  // 4. Fetch section timetable
  const { data: timetable, isLoading: loadingTimetable, isError: isTimetableError } = useQuery<TimetableSlot[]>({
    queryKey: ['section-timetable', selectedSectionId],
    queryFn: async () => {
      const res = await apiClient.get(`/api/v1/timetable/section/${selectedSectionId}`);
      return res.data;
    },
    enabled: selectedSectionId !== null
  });

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

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  const filteredRoster = useMemo(() => {
    if (!roster) return [];
    const q = rosterQuery.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter(
      (s) =>
        (s.rollNumber || '').toLowerCase().includes(q) ||
        (s.studentName || '').toLowerCase().includes(q)
    );
  }, [roster, rosterQuery]);

  const exportRosterCsv = () => {
    if (!selectedSectionId || !roster || roster.length === 0) {
      toast.error('Select a section with enrolled students to export.');
      return;
    }
    const secName = sectionDetails?.name || `Section-${selectedSectionId}`;
    const headers = ['Student ID', 'Roll Number', 'Student Name', 'Enrollment Status'];
    const rows = filteredRoster.map((s) => [
      String(s.studentId),
      s.rollNumber || '-',
      s.studentName,
      s.isActive ? 'ACTIVE' : 'INACTIVE',
    ]);
    const metaRows = [
      ['STATUTORY SECTION COHORT ROSTER', '', '', ''],
      ['Institution', institution.name || 'Central University System', '', ''],
      ['Institution Code', institution.code || 'CUS-01', '', ''],
      ['Section Cohort', `Section ${secName}`, '', ''],
      ['Offering Reference', `#${sectionDetails?.courseOfferingId || ''}`, '', ''],
      ['Seat Utilization', `${sectionDetails?.currentEnrollment || roster.length} / ${sectionDetails?.capacity || roster.length}`, '', ''],
      ['Exported On', new Date().toISOString(), '', ''],
      ['', '', '', '']
    ];
    const all = [...metaRows, headers, ...rows];
    const csvContent = 'data:text/csv;charset=utf-8,' + all.map((r) => r.map((c) => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Section_${secName}_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported Section ${secName} student roster (CSV).`);
  };

  const utilizationPct = sectionDetails && sectionDetails.capacity > 0
    ? Math.min(100, Math.round((sectionDetails.currentEnrollment / sectionDetails.capacity) * 100))
    : 0;

  return (
    <PageFrame
      title="Faculty Sections & Cohort Rosters"
      description={
        <p className="text-xs text-slate-500 mt-0.5">
          {institution.name || 'Central University'} • Assigned Section Cohorts, Seat Utilization &amp; Timetables
        </p>
      }
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "My Sections" }
      ]}
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" /> Print View
          </button>
          <button
            type="button"
            onClick={exportRosterCsv}
            disabled={!roster || roster.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export Roster (CSV)
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: ASSIGNED SECTIONS */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">
              Assigned Sections ({sections?.length || 0})
            </h2>
            
            {loadingSections ? (
              <div className="flex justify-center p-8 bg-white border border-slate-200"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : isSectionsError ? (
              <div className="bg-white border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600">
                Failed to load sections: {sectionsError instanceof Error ? sectionsError.message : 'Unknown API error'}.
              </div>
            ) : sections && sections.length > 0 ? (
              <div className="bg-white border border-slate-200 divide-y divide-slate-100">
                {sections.map((section) => {
                  const pct = section.capacity > 0 ? Math.min(100, Math.round((section.currentEnrollment / section.capacity) * 100)) : 0;
                  return (
                    <button
                      key={section.id}
                      onClick={() => { setSelectedSectionId(section.id); setRosterQuery(''); }}
                      className={cn(
                        "w-full text-left p-4 hover:bg-slate-50 transition-colors focus:outline-none",
                        selectedSectionId === section.id && "bg-slate-50 border-l-4 border-l-primary ring-1 ring-inset ring-slate-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">Section {section.name}</span>
                        <StatusBadge status={section.isActive ? 'ACTIVE' : 'INACTIVE'} />
                      </div>
                      <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1.5">
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {section.currentEnrollment} / {section.capacity} Enrolled
                        </span>
                        <span className="font-mono text-[11px] font-bold text-slate-700">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 p-8 text-center text-sm text-slate-500">
                You do not have any assigned sections.
              </div>
            )}
          </div>

          {/* RIGHT: SECTION DETAIL */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedSectionId ? (
              <div className="bg-white border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center justify-center min-h-[400px]">
                <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-sm font-medium">Select a section to view details.</p>
              </div>
            ) : (
              <>
                {/* SECTION INFO */}
                <div className="bg-white border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Section Details</h3>
                    {loadingDetails ? (
                       <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    ) : sectionDetails ? (
                       <StatusBadge status={sectionDetails.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    ) : null}
                  </div>
                  
                  {loadingDetails ? (
                     <div className="h-10 bg-slate-100 animate-pulse rounded" />
                  ) : isDetailsError ? (
                     <p className="text-sm text-red-500 font-medium">Failed to load details. You might not have permission.</p>
                  ) : sectionDetails ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Section Name</p>
                        <p className="font-semibold text-slate-900">{sectionDetails.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Course Offering ID</p>
                        <p className="font-semibold text-slate-900">#{sectionDetails.courseOfferingId}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Enrollment</p>
                        <p className="font-semibold text-slate-900">{sectionDetails.currentEnrollment} / {sectionDetails.capacity}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Seat Occupancy</p>
                        <p className="font-bold text-indigo-700 font-mono">{utilizationPct}% Utilized</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-red-500 font-medium">No details available.</p>
                  )}
                  
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Link
                      to={`/dashboard/attendance`}
                      className="bg-black text-white px-5 py-2 text-[11px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors flex items-center space-x-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Take Attendance</span>
                    </Link>
                  </div>
                </div>

                {/* TIMETABLE */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2">Class Schedule</h3>
                  {loadingTimetable ? (
                    <div className="flex justify-center p-8 bg-white border border-slate-200"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
                  ) : isTimetableError ? (
                    <div className="bg-white border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600">
                      Failed to load class schedule.
                    </div>
                  ) : timetable && timetable.length > 0 ? (
                    <div className="bg-white border border-slate-200 divide-y divide-slate-100">
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
                          <div key={day} className="flex flex-col sm:flex-row">
                            <div className="sm:w-32 bg-slate-50 p-3 sm:border-r border-slate-100 flex items-center">
                              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{day}</span>
                            </div>
                            <div className="flex-1 divide-y divide-slate-100">
                              {daySlots.map(slot => (
                                <div key={slot.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-semibold text-slate-900">
                                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-700">
                                    <MapPin className="w-3 h-3 text-slate-500" />
                                    <span>Room {slot.roomId}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 p-8 text-center text-sm text-slate-500">
                      No schedule available for this section.
                    </div>
                  )}
                </div>

                {/* STUDENTS ROSTER */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                      Student Roster ({filteredRoster.length})
                    </h3>
                    {roster && roster.length > 0 && (
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={rosterQuery}
                          onChange={(e) => setRosterQuery(e.target.value)}
                          placeholder="Filter by roll # or name..."
                          className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                  {loadingRoster ? (
                    <div className="flex justify-center p-8 bg-white border border-slate-200"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
                  ) : isRosterError ? (
                    <div className="bg-white border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600">
                      Failed to load student roster.
                    </div>
                  ) : filteredRoster.length > 0 ? (
                    <div className="bg-white border border-slate-200">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-500">Roll Number</th>
                            <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-500">Name</th>
                            <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 text-right">Status</th>
                            <th className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 text-right">Profile</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredRoster.map(student => (
                            <tr key={student.studentId} className="hover:bg-slate-50">
                              <td className="px-4 py-3 font-mono text-xs font-medium text-slate-600">{student.rollNumber || '-'}</td>
                              <td className="px-4 py-3 font-semibold text-slate-900">{student.studentName}</td>
                              <td className="px-4 py-3 text-right">
                                <StatusBadge status={student.isActive ? 'ACTIVE' : 'INACTIVE'} />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Link
                                  to={`/dashboard/students/${student.studentId}`}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                >
                                  <span>View</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 p-8 text-center text-sm text-slate-500">
                      {roster && roster.length > 0 ? 'No students match your search filter.' : 'No students enrolled in this section.'}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageFrame>
  );
}
