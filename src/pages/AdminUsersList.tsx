import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { PageFrame } from '../components/ui/PageFrame';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Search,
  Loader2,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Download,
  Printer,
  KeyRound,
  Users,
  Lock,
  X,
  CheckCircle2,
} from 'lucide-react';
import { CreateUserDialog } from '../components/CreateUserDialog';
import { useInstitutionStore } from '../store/useInstitutionStore';
import { toast } from 'sonner';

interface UserSummary {
  username: string;
  email: string;
  role: string;
}

const ROLE_PERMISSIONS: Record<string, { desc: string; modules: string[]; badge: string }> = {
  SUPER_ADMIN: {
    desc: 'Full root sovereignty across all institutional tenants, access control, and audit logs.',
    modules: ['System Administration', 'Audit Trail', 'Security Matrix', 'Compliance & NIRF', 'All Operations'],
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  ADMIN: {
    desc: 'Operational management of students, faculty, departments, and financial ledgers.',
    modules: ['Admissions', 'Student Directory', 'Fee Manager', 'Faculty Rosters', 'Timetable'],
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  FACULTY: {
    desc: 'Academic evaluation, lecture attendance, course grading, and curriculum delivery.',
    modules: ['Attendance Tracker', 'Examination Manager', 'Course Catalog', 'Transcript Grading'],
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  STUDENT: {
    desc: 'Self-service portal for grades, transcripts, timetable schedules, and fee receipts.',
    modules: ['Transcript Viewer', 'Fee Center', 'Schedule Calendar', 'Academic History'],
    badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
  PARENT: {
    desc: 'Guardian portal for ward attendance monitoring, fee settlement, and absence alerts.',
    modules: ['Student Attendance Oversight', 'Fee Settlement', 'Emergency Contact Info'],
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
};

export default function AdminUsersList() {
  const { institution } = useInstitutionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  const { data: users, isLoading } = useQuery<UserSummary[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/admin/users');
      return res.data || [];
    }
  });

  const filteredUsers = users?.filter(u => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q);

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const adminCount = users?.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length || 0;
  const facultyCount = users?.filter(u => u.role === 'FACULTY').length || 0;
  const studentParentCount = users?.filter(u => u.role === 'STUDENT' || u.role === 'PARENT').length || 0;

  const exportUsersCsv = () => {
    if (filteredUsers.length === 0) {
      toast.error('No users found to export.');
      return;
    }

    const headers = [
      'Username',
      'Email Address',
      'Assigned Role',
      'Access Scope',
      'Institution Name',
      'Campus Node',
      'Audit Timestamp'
    ];

    const rows = filteredUsers.map((u) => [
      u.username,
      u.email,
      u.role,
      ROLE_PERMISSIONS[u.role]?.desc || 'Standard Institutional Role',
      institution.name || 'Central University System',
      institution.campus || 'Main Campus',
      new Date().toISOString()
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map((e) => e.map((cell) => `"${(cell ?? '').toString().replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `System_Users_Access_Matrix_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('System users directory exported to CSV.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageFrame
      title="System Access &amp; RBAC Control"
      description="Manage institutional authentication credentials, multi-role access controls, and security privileges."
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'System Access' }]}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMatrixModal(true)}
            className="text-xs h-9 border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs"
          >
            <KeyRound className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> View Permissions Matrix
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportUsersCsv}
            disabled={filteredUsers.length === 0}
            className="text-xs h-9 border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-600" /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={filteredUsers.length === 0}
            className="text-xs h-9 border-slate-300 hover:bg-slate-50 text-slate-700 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-600" /> Print
          </Button>
          <CreateUserDialog />
        </div>
      }
    >
      <div className="space-y-6">
        {/* Security Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Total Accounts</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{users?.length || 0}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Enrolled Identities</div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Administrators</span>
              <ShieldAlert className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-700 mt-2">{adminCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Super Admin &amp; Admin</div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Academic Faculty</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-2">{facultyCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Teaching Faculty Accounts</div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Students &amp; Parents</span>
              <Lock className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{studentParentCount}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Self-Service Portals</div>
          </div>
        </div>

        {/* User Table Card */}
        <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by username, email, or role..." 
                className="pl-9 h-9 text-xs border-slate-300 bg-white rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider hidden sm:inline">Role Filter:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs font-semibold border border-slate-300 rounded-xl px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Roles ({users?.length || 0})</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                <option value="ADMIN">ADMIN</option>
                <option value="FACULTY">FACULTY</option>
                <option value="STUDENT">STUDENT</option>
                <option value="PARENT">PARENT</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 border-r border-slate-200/50">Username</th>
                  <th className="px-5 py-3.5 border-r border-slate-200/50">Email</th>
                  <th className="px-5 py-3.5 border-r border-slate-200/50">Role Privilege</th>
                  <th className="px-5 py-3.5 text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500 mt-2 font-medium">Loading security accounts...</p>
                    </td>
                  </tr>
                ) : filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user, idx) => {
                    const cfg = ROLE_PERMISSIONS[user.role] || {
                      desc: 'Standard User',
                      badge: 'bg-slate-100 text-slate-700 border-slate-200',
                    };
                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900 border-r border-slate-100/50">
                          {user.username}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 border-r border-slate-100/50">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 border-r border-slate-100/50">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cfg.badge}`}>
                            <ShieldCheck className="w-3 h-3" />
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Verified
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-12 text-center text-slate-500">
                      No system users found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role Permission Matrix Modal */}
      {showMatrixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Institutional Role Permission Matrix (RBAC)</h3>
                  <p className="text-xs text-slate-500">
                    Cryptographic access privileges and statutory segregation of duties.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMatrixModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(ROLE_PERMISSIONS).map(([roleName, details]) => (
                <div key={roleName} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${details.badge}`}>
                      {roleName}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">Privilege Tier</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{details.desc}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {details.modules.map((mod, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                        ✓ {mod}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMatrixModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </PageFrame>
  );
}