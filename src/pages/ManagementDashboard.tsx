import { useAuthStore } from '../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { PageFrame } from '../components/ui/PageFrame';
import { ShieldAlert, Users, Store, UserCheck, Loader2 } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Link } from 'react-router-dom';
import type { Student, PaginatedResponse } from '../types/student';

interface UserDTO {
  id: number;
  username: string;
  email: string;
  role: string;
  enabled: boolean;
}

interface Department {
  id: number;
  name: string;
  code: string;
}

interface Application {
  id: number;
  applicantName: string;
  status: string;
  appliedAt: string;
  programName: string;
}

export default function ManagementDashboard() {
  const { user } = useAuthStore();
  const role = user?.role || '';
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'ADMIN';

  const { data: usersData, isLoading: loadingUsers } = useQuery<UserDTO[]>({
    queryKey: ['dashboard-users'],
    enabled: isSuperAdmin,
    queryFn: async () => (await apiClient.get('/api/v1/admin/users')).data
  });

  const { data: departmentsData } = useQuery<Department[]>({
    queryKey: ['dashboard-depts'],
    queryFn: async () => (await apiClient.get('/api/v1/departments')).data
  });

  const { data: studentsData, isLoading: loadingStudents } = useQuery<PaginatedResponse<Student>>({
    queryKey: ['dashboard-students'],
    queryFn: async () => (await apiClient.get('/api/v1/students', { params: { page: 0, size: 5 } })).data?.data
  });

  const { data: appsData, isLoading: loadingApps } = useQuery<Application[]>({
    queryKey: ['dashboard-apps'],
    enabled: isAdmin || isSuperAdmin,
    queryFn: async () => (await apiClient.get('/api/v1/admission-applications')).data
  });

  const totalUsersCount = Array.isArray(usersData) ? usersData.length : null;
  const activeUsers = Array.isArray(usersData) ? usersData.filter(u => u?.enabled).length : null;
  const lockedUsers = Array.isArray(usersData) ? usersData.filter(u => u && !u.enabled).length : null;
  const totalDepts = Array.isArray(departmentsData) ? departmentsData.length : 0;
  const totalStudents = studentsData?.totalElements || (Array.isArray(studentsData) ? (studentsData as any).length : 0);
  const pendingApps = Array.isArray(appsData) ? appsData.filter(a => a?.status === 'SUBMITTED' || a?.status === 'UNDER_REVIEW').length : 0;

  const adminName = user?.username || (isSuperAdmin ? 'Super Admin' : 'Admin');

  return (
    <PageFrame 
      title={`${isSuperAdmin ? "System Governance" : "Institutional Operations"} — Welcome, ${adminName}`} 
      description={isSuperAdmin ? "Monitor system health, access control, and master configuration." : "Overview of daily operations, admissions, and student activities."}
    >
      <div className="grid gap-px grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8 bg-slate-200 border border-slate-200 shadow-sm">
        {/* Metric 1: System Users or Operations */}
        <div className="bg-white p-5 sm:p-6 lg:p-7 hover:bg-slate-50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-slate-500">
              {isSuperAdmin ? "System Users" : "Active Staff"}
            </h3>
            <ShieldAlert className="h-5 w-5 text-slate-400" />
          </div>
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            {totalUsersCount !== null ? totalUsersCount : (activeUsers !== null ? activeUsers : '-')}
          </div>
          <p className="text-xs lg:text-sm text-slate-500 mt-2 font-medium">
            {activeUsers !== null && lockedUsers !== null 
              ? `${activeUsers} active, ${lockedUsers} locked` 
              : 'Institutional user status active'}
          </p>
        </div>

        {/* Metric 2: Departments */}
        <div className="bg-white p-5 sm:p-6 lg:p-7 hover:bg-slate-50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-slate-500">Departments</h3>
            <Store className="h-5 w-5 text-slate-400" />
          </div>
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            {departmentsData ? totalDepts : '-'}
          </div>
          <p className="text-xs lg:text-sm text-slate-500 mt-2 font-medium">Configured Academic Programs</p>
        </div>

        {/* Metric 3: Total Students */}
        <div className="bg-white p-5 sm:p-6 lg:p-7 hover:bg-slate-50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-slate-500">Total Students</h3>
            <Users className="h-5 w-5 text-slate-400" />
          </div>
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            {studentsData ? totalStudents : '-'}
          </div>
          <p className="text-xs lg:text-sm text-slate-500 mt-2 font-medium">Enrolled Across Campuses</p>
        </div>

        {/* Metric 4: Admissions Pipeline */}
        <div className="bg-white p-5 sm:p-6 lg:p-7 hover:bg-slate-50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-slate-500">Admissions Queue</h3>
            <UserCheck className="h-5 w-5 text-slate-400" />
          </div>
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            {appsData ? pendingApps : '0'}
          </div>
          <p className="text-xs lg:text-sm text-slate-500 mt-2 font-medium">Requires Review / Pending</p>
        </div>
      </div>

      <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm lg:text-base font-bold uppercase tracking-wider text-slate-900">Recent Enrollments</h3>
            <Link to="/dashboard/students" className="text-xs lg:text-sm font-semibold text-slate-500 hover:text-primary">View Directory &rarr;</Link>
          </div>
          
          {loadingStudents ? (
            <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
          ) : Array.isArray(studentsData?.content) && studentsData.content.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-200 bg-white shadow-sm">
              {studentsData.content.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3.5">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 bg-slate-900 text-white flex items-center justify-center font-bold text-xs sm:text-sm rounded">
                      {s.firstName ? s.firstName.charAt(0) : 'S'}
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-slate-900">{s.firstName || 'Student'} {s.lastName || ''}</p>
                      <p className="text-xs sm:text-sm font-medium text-slate-500">{s.rollNumber || 'Pending ID'}</p>
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 border border-slate-200 bg-slate-50 text-center text-sm lg:text-base text-slate-500">
              No students found.
            </div>
          )}
        </div>

        {isSuperAdmin ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm lg:text-base font-bold uppercase tracking-wider text-slate-900">System Access Log</h3>
            </div>
            {loadingUsers ? (
              <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : usersData ? (
              <div className="border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm lg:text-base">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 sm:px-6 py-2.5 sm:py-3.5 font-semibold text-slate-600 text-xs lg:text-sm uppercase tracking-wider">User</th>
                      <th className="px-4 sm:px-6 py-2.5 sm:py-3.5 font-semibold text-slate-600 text-xs lg:text-sm uppercase tracking-wider text-right">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usersData.slice(0, 5).map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 sm:px-6 py-3 sm:py-3.5 font-medium text-slate-900">{u.username}</td>
                        <td className="px-4 sm:px-6 py-3 sm:py-3.5 text-right">
                          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-600 bg-slate-100 px-2.5 py-1 rounded">{u.role ? u.role.replace('ROLE_', '') : 'USER'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 border border-slate-200 bg-slate-50 text-center text-sm lg:text-base text-slate-500">
                Could not load access data.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm lg:text-base font-bold uppercase tracking-wider text-slate-900">Admissions Pipeline</h3>
              <Link to="/dashboard/admissions" className="text-xs lg:text-sm font-semibold text-slate-500 hover:text-primary">Review Applications &rarr;</Link>
            </div>
            {loadingApps ? (
              <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : appsData && appsData.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 bg-white shadow-sm">
                {appsData.filter(a => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').slice(0, 5).map(a => (
                  <div key={a.id} className="flex justify-between items-center p-3.5 sm:p-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <span className="font-semibold text-slate-900 block text-sm sm:text-base">{a.applicantName}</span>
                      <span className="text-xs sm:text-sm font-medium text-slate-500">{a.programName || 'Unknown Program'}</span>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-slate-200 bg-slate-50 text-center text-sm lg:text-base text-slate-500">
                No pending applications.
              </div>
            )}
          </div>
        )}
      </div>
    </PageFrame>
  );
}
