import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import { useConnectivity } from '../hooks/useConnectivity';
import { useDesktopZoom } from '../hooks/useDesktopZoom';
import { useInstitutionStore } from '../store/useInstitutionStore';
import { 
  LayoutDashboard, Users, GraduationCap, CalendarCheck, Wallet, 
  Store, ShieldAlert, UserCheck, 
  Menu, X, LogOut, ChevronDown, UserCircle, Bell,
  Check, KeyRound, ZoomIn, ZoomOut, Building2,
  BookOpen, FileText, Bus, CreditCard, Video, Award, Receipt, Briefcase, UserPlus, Clock,
  Server, Settings, MessageSquare, UploadCloud
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ServerSettingsModal } from './ServerSettingsModal';
import { OfflineSyncBadge } from './OfflineSyncBadge';
import { ClassroomCallOverlay } from './classroom/ClassroomCallOverlay';
import { CommunicationOutboxDrawer } from './communication/CommunicationOutboxDrawer';
import { resolveBaseUrl } from '../api/axiosClient';

interface NavItemProps {
  path: string;
  icon: React.ElementType;
  label: string;
  disabled?: boolean;
}

const NavItem = React.memo(({ path, icon: Icon, label, disabled = false }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

  if (disabled) {
    return (
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-md text-slate-400 cursor-not-allowed opacity-75">
        <div className="flex items-center space-x-3">
          <Icon className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
          <span className="text-sm lg:text-base font-medium">{label}</span>
        </div>
      </div>
    );
  }

  return (
    <Link 
      to={path} 
      className={cn(
        "flex items-center justify-between px-3.5 py-2.5 rounded-md transition-colors",
        isActive 
          ? "bg-primary/10 text-primary font-semibold" 
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
      )}
    >
      <div className="flex items-center space-x-3">
        <Icon className={cn("w-4 h-4 lg:w-5 lg:h-5 shrink-0", isActive ? "text-primary" : "text-slate-500")} />
        <span className="text-sm lg:text-base">{label}</span>
      </div>
    </Link>
  );
});

const NavGroup = React.memo(({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-6">
    <div className="px-3.5 text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</div>
    <nav className="space-y-0.5">{children}</nav>
  </div>
));

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isCommunicationOutboxOpen, setIsCommunicationOutboxOpen] = useState(false);
  const [currentServerUrl, setCurrentServerUrl] = useState(() => resolveBaseUrl());

  // Administrator shortcut (Ctrl + Shift + S) to open Server Settings Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        setIsServerModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isOnline, status, checkNow } = useConnectivity();
  const { zoomPercent, zoomIn, zoomOut, resetZoom } = useDesktopZoom();
  const { institution } = useInstitutionStore();

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ unreadCount: number }>('/api/v1/notifications/unread-count');
        return res.data;
      } catch {
        return { unreadCount: 0 };
      }
    },
    refetchInterval: 15000,
  });

  const { data: notifications = [], isLoading: isLoadingNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/api/v1/notifications');
      return res.data;
    },
    enabled: isNotificationsOpen,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.patch(`/api/v1/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.patch('/api/v1/notifications/mark-all-read');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const handleLogout = async () => {
    const isApplicant = user?.role === 'APPLICANT';
    await logout();
    if (isApplicant) {
      navigate('/login?tab=applicant');
    } else {
      navigate('/login');
    }
  };

  const sidebarScrollRef = React.useRef<HTMLDivElement>(null);

  // Preserve sidebar scroll position across route changes
  React.useLayoutEffect(() => {
    const saved = sessionStorage.getItem('edupulse_sidebar_scroll_top');
    if (sidebarScrollRef.current && saved !== null) {
      sidebarScrollRef.current.scrollTop = Number(saved);
    }
  }, [location.pathname]);

  const handleSidebarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    sessionStorage.setItem('edupulse_sidebar_scroll_top', String(e.currentTarget.scrollTop));
  };

  const rawRole = user?.role || '';
  const role = (rawRole || 'ADMIN').toUpperCase().replace(/^ROLE_/, '');

  const renderSidebarContent = () => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return (
          <>
            <NavGroup title="Admin Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            </NavGroup>

            <NavGroup title="Operations">
              <NavItem path="/dashboard/students" icon={Users} label="Students Directory" />
              <NavItem path="/dashboard/admissions" icon={UserCheck} label="Admissions" />
              <NavItem path="/dashboard/admissions/enroll" icon={UserPlus} label="Enroll Student" />
              <NavItem path="/dashboard/attendance" icon={CalendarCheck} label="Attendance Oversight" />
              <NavItem path="/dashboard/operations/attendance" icon={Clock} label="Live Attendance Tracker" />
              <NavItem path="/dashboard/operations/timetable" icon={CalendarCheck} label="Timetable Scheduler" />
              <NavItem path="/dashboard/operations/library" icon={BookOpen} label="Library Management" />
              <NavItem path="/dashboard/operations/transport" icon={Bus} label="Fleet & Transport" />
            </NavGroup>

            <NavGroup title="Academics">
              <NavItem path="/dashboard/departments" icon={Store} label="Programs & Departments" />
              <NavItem path="/dashboard/academics" icon={GraduationCap} label="Course Catalog" />
              <NavItem path="/dashboard/academic/courses" icon={BookOpen} label="Course Manager" />
              <NavItem path="/dashboard/academic/exams" icon={Award} label="Examinations" />
              <NavItem path="/dashboard/academic/transcripts" icon={FileText} label="Transcripts & GPA" />
              <NavItem path="/dashboard/academic/classroom" icon={Video} label="Virtual Classroom" />
              <NavItem path="/dashboard/academic/materials" icon={FileText} label="Course Materials" />
            </NavGroup>

            <NavGroup title="Finance & HR">
              <NavItem path="/dashboard/finance" icon={Wallet} label="Fee Management" />
              <NavItem path="/dashboard/finance/fees" icon={CreditCard} label="Fee Structures & Heads" />
              <NavItem path="/dashboard/finance/ledger" icon={Receipt} label="Student Fee Ledger" />
              <NavItem path="/dashboard/hr/leaves" icon={CalendarCheck} label="Staff Leave Requests" />
              <NavItem path="/dashboard/hr/payroll" icon={Briefcase} label="Payroll Dashboard" />
            </NavGroup>

            <NavGroup title="System Setup">
              <NavItem path="/dashboard/institution-profile" icon={Building2} label="Institution Profile" />
              <NavItem path="/dashboard/admin/users" icon={ShieldAlert} label="Access Control" />
              <NavItem path="/dashboard/campuses" icon={Store} label="Campuses & Nodes" />
              <NavItem path="/dashboard/migration" icon={UploadCloud} label="Bulk Data Ingestion" />
              <NavItem path="/dashboard/compliance" icon={Award} label="NAAC / NIRF Compliance" />
              <NavItem path="/dashboard/audit-logs" icon={ShieldAlert} label="System Audit Trail" />
            </NavGroup>
          </>
        );

      case 'FACULTY':
        return (
          <>
            <NavGroup title="Faculty Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            </NavGroup>
            
            <NavGroup title="Academics">
              <NavItem path="/dashboard/academics" icon={GraduationCap} label="My Timetable" />
              <NavItem path="/dashboard/operations/timetable" icon={CalendarCheck} label="Timetable Schedule" />
              <NavItem path="/dashboard/sections" icon={Users} label="My Sections" />
              <NavItem path="/dashboard/academic/courses" icon={BookOpen} label="Course Manager" />
              <NavItem path="/dashboard/academic/exams" icon={Award} label="Exams & Grading" />
              <NavItem path="/dashboard/academic/classroom" icon={Video} label="Virtual Classroom" />
              <NavItem path="/dashboard/academic/materials" icon={FileText} label="Course Materials" />
            </NavGroup>
            
            <NavGroup title="Operations & Staff">
              <NavItem path="/dashboard/attendance" icon={CalendarCheck} label="Take Attendance" />
              <NavItem path="/dashboard/operations/attendance" icon={Clock} label="Live Attendance Tracker" />
              <NavItem path="/dashboard/hr/leaves" icon={CalendarCheck} label="My Leave Requests" />
            </NavGroup>
          </>
        );

      case 'STUDENT':
        return (
          <>
            <NavGroup title="Self-Service Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
              <NavItem path="/portal" icon={GraduationCap} label="Student Portal" />
            </NavGroup>
            
            <NavGroup title="Academics">
              <NavItem path="/dashboard/attendance" icon={CalendarCheck} label="My Attendance" />
              <NavItem path="/dashboard/operations/timetable" icon={CalendarCheck} label="My Timetable" />
              <NavItem path="/dashboard/academic/transcripts" icon={FileText} label="Transcripts & GPA" />
              <NavItem path="/dashboard/academic/classroom" icon={Video} label="Virtual Classroom" />
              <NavItem path="/dashboard/academic/materials" icon={BookOpen} label="Course Materials" />
              <NavItem path="/dashboard/operations/library" icon={BookOpen} label="Library Books" />
            </NavGroup>

            <NavGroup title="Finance">
              <NavItem path="/dashboard/finance" icon={Wallet} label="My Invoices" />
              <NavItem path="/dashboard/finance/tuition" icon={CreditCard} label="Tuition Ledger" />
            </NavGroup>
          </>
        );

      case 'PARENT':
        return (
          <>
            <NavGroup title="Ward Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            </NavGroup>
            
            <NavGroup title="Academics">
              <NavItem path="/dashboard/attendance" icon={CalendarCheck} label="Ward Attendance" />
            </NavGroup>
            
            <NavGroup title="Finance">
              <NavItem path="/dashboard/finance" icon={Wallet} label="Ward Fees" />
            </NavGroup>
          </>
        );

      case 'FINANCE':
        return (
          <>
            <NavGroup title="Finance Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            </NavGroup>
            
            <NavGroup title="Receivables">
              <NavItem path="/dashboard/finance" icon={Wallet} label="Fee Management" />
              <NavItem path="/dashboard/finance/fees" icon={CreditCard} label="Fee Structures & Invoices" />
              <NavItem path="/dashboard/finance/ledger" icon={Receipt} label="Student Ledger" />
            </NavGroup>

            <NavGroup title="Payroll & HR">
              <NavItem path="/dashboard/hr/payroll" icon={Briefcase} label="Payroll Dashboard" />
            </NavGroup>
            
            <NavGroup title="Directory">
              <NavItem path="/dashboard/students" icon={Users} label="Student Lookup" />
            </NavGroup>
          </>
        );

      case 'APPLICANT':
        return (
          <>
            <NavGroup title="Applicant Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="My Application" />
              <NavItem path="/admissions" icon={GraduationCap} label="Admissions Catalog" />
            </NavGroup>
          </>
        );
        
      default:
        return (
          <>
            <NavGroup title="Admin Portal">
              <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            </NavGroup>

            <NavGroup title="Operations">
              <NavItem path="/dashboard/students" icon={Users} label="Students Directory" />
              <NavItem path="/dashboard/admissions" icon={UserCheck} label="Admissions" />
              <NavItem path="/dashboard/admissions/enroll" icon={UserPlus} label="Enroll Student" />
              <NavItem path="/dashboard/attendance" icon={CalendarCheck} label="Attendance Oversight" />
              <NavItem path="/dashboard/operations/attendance" icon={Clock} label="Live Attendance Tracker" />
              <NavItem path="/dashboard/operations/timetable" icon={CalendarCheck} label="Timetable Scheduler" />
              <NavItem path="/dashboard/operations/library" icon={BookOpen} label="Library Management" />
              <NavItem path="/dashboard/operations/transport" icon={Bus} label="Fleet & Transport" />
            </NavGroup>

            <NavGroup title="Academics">
              <NavItem path="/dashboard/departments" icon={Store} label="Programs & Departments" />
              <NavItem path="/dashboard/academics" icon={GraduationCap} label="Course Catalog" />
              <NavItem path="/dashboard/academic/courses" icon={BookOpen} label="Course Manager" />
              <NavItem path="/dashboard/academic/exams" icon={Award} label="Examinations" />
              <NavItem path="/dashboard/academic/transcripts" icon={FileText} label="Transcripts & GPA" />
              <NavItem path="/dashboard/academic/classroom" icon={Video} label="Virtual Classroom" />
              <NavItem path="/dashboard/academic/materials" icon={FileText} label="Course Materials" />
            </NavGroup>

            <NavGroup title="Finance & HR">
              <NavItem path="/dashboard/finance" icon={Wallet} label="Fee Management" />
              <NavItem path="/dashboard/finance/fees" icon={CreditCard} label="Fee Structures & Heads" />
              <NavItem path="/dashboard/finance/ledger" icon={Receipt} label="Student Fee Ledger" />
              <NavItem path="/dashboard/hr/leaves" icon={CalendarCheck} label="Staff Leave Requests" />
              <NavItem path="/dashboard/hr/payroll" icon={Briefcase} label="Payroll Dashboard" />
            </NavGroup>

            <NavGroup title="System Setup">
              <NavItem path="/dashboard/institution-profile" icon={Building2} label="Institution Profile" />
              <NavItem path="/dashboard/admin/users" icon={ShieldAlert} label="Access Control" />
              <NavItem path="/dashboard/campuses" icon={Store} label="Campuses & Nodes" />
              <NavItem path="/dashboard/migration" icon={UploadCloud} label="Bulk Data Ingestion" />
              <NavItem path="/dashboard/compliance" icon={Award} label="NAAC / NIRF Compliance" />
              <NavItem path="/dashboard/audit-logs" icon={ShieldAlert} label="System Audit Trail" />
            </NavGroup>
          </>
        );
    }
  };

  return (
    <div className="h-full w-full bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden select-none print:h-auto print:overflow-visible print:bg-white">
      
      {/* Mobile Header Overlay */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 print:hidden">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg shadow-sm border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center bg-slate-50">
            {institution.logoUrl ? (
              <img src={institution.logoUrl} alt={institution.name} className="w-full h-full object-contain" />
            ) : (
              <img src="/logo.jpg" alt="EduPulse Logo" className="w-full h-full object-cover" />
            )}
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-base truncate">{institution.name || 'EduPulse ERP'}</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md">
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 w-72 lg:w-80 xl:w-84 bg-white border-r border-slate-200 shadow-sm flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 h-full shrink-0 print:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-5 lg:p-6 border-b border-slate-200 hidden md:flex items-center space-x-3.5">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl shadow-sm border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center bg-slate-50">
            {institution.logoUrl ? (
              <img src={institution.logoUrl} alt={institution.name} className="w-full h-full object-contain p-1" />
            ) : (
              <img src="/logo.jpg" alt="EduPulse Logo" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-extrabold text-slate-900 tracking-tight text-sm lg:text-base leading-tight truncate" title={institution.name}>
              {institution.name || 'EduPulse ERP'}
            </h1>
            <p className="text-[10px] lg:text-xs text-slate-500 mt-0.5 font-bold tracking-wider truncate uppercase">
              {institution.campus || 'Enterprise V1.0'}
            </p>
          </div>
        </div>

        <div 
          ref={sidebarScrollRef}
          onScroll={handleSidebarScroll}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('a')) {
              setIsMobileMenuOpen(false);
            }
          }}
          className="flex-1 overflow-y-auto p-4 lg:p-5 custom-scrollbar"
        >
          {renderSidebarContent()}
        </div>

        <div className="p-4 lg:p-5 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3.5 px-3">
            <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold uppercase shrink-0 text-sm lg:text-base">
              {user?.username?.charAt(0) || user?.role?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm lg:text-base font-semibold text-slate-900 truncate">{user?.username || 'User'}</p>
              <p className="text-xs lg:text-sm text-slate-500 truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden print:h-auto print:overflow-visible">
        
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 lg:h-18 bg-white border-b border-slate-200 items-center justify-between px-6 lg:px-8 sticky top-0 z-10 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            {/* Cloud / Server Connection Indicator */}
            {user?.role === 'SUPER_ADMIN' ? (
              <button
                type="button"
                onClick={() => setIsServerModalOpen(true)}
                title={`Target Backend: ${currentServerUrl} (Click to switch server, or Ctrl+Shift+S)`}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-xs"
              >
                <span className={cn("w-2 h-2 rounded-full", isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500")}></span>
                <Server className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-mono text-[11px] max-w-[140px] truncate">{currentServerUrl.replace(/^https?:\/\//, '')}</span>
                <Settings className="w-3 h-3 text-slate-400" />
              </button>
            ) : (
              <div
                className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200"
                title={isOnline ? "Connected to Central EduPulse Cloud" : "Offline Mode"}
              >
                <span className={cn("w-2 h-2 rounded-full", isOnline ? "bg-emerald-500" : "bg-red-500")}></span>
                <span className="text-[11px] font-medium">{isOnline ? "Cloud Online" : "Offline"}</span>
              </div>
            )}

            {/* Offline Mutation Sync Queue Badge */}
            <OfflineSyncBadge />

            {/* Left side context - reserved for breadcrumbs or title injected by pages */}
            {!isOnline && (
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  status === 'unstable' ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                )}>
                  {status === 'unstable' ? 'Backend Unstable' : 'Backend Disconnected'}
                </span>
                <button
                  onClick={() => checkNow()}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                  title="Retry backend health check"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 lg:space-x-6">
            {/* Desktop Zoom Control Widget */}
            <div 
              className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs text-slate-700 shadow-sm"
              title="Adjust Interface Scale (Shortcut: Ctrl + / Ctrl - / Ctrl 0)"
            >
              <button
                type="button"
                onClick={zoomOut}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Zoom Out (Ctrl -)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="px-2 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-800 hover:text-slate-950 font-semibold text-xs transition-colors cursor-pointer min-w-[48px]"
                title="Reset Zoom to 100% (Ctrl 0)"
              >
                {zoomPercent}%
              </button>
              <button
                type="button"
                onClick={zoomIn}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Zoom In (Ctrl +)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Parent & Student Communication Rails Outbox Trigger */}
            <button
              onClick={() => setIsCommunicationOutboxOpen(true)}
              className="text-slate-500 hover:text-emerald-700 transition-colors relative p-2 rounded-full hover:bg-emerald-50 focus:outline-none cursor-pointer"
              title="Parent & Student Communication Rails (WhatsApp & SMS Outbox Logs)"
            >
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Real Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="text-slate-500 hover:text-slate-800 transition-colors relative p-2 rounded-full hover:bg-slate-100 focus:outline-none"
                title="Notifications"
              >
                <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
                {unreadData && unreadData.unreadCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadData.unreadCount > 9 ? '9+' : unreadData.unreadCount}
                  </span>
                ) : null}
              </button>

              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900">Notifications</span>
                        {unreadData && unreadData.unreadCount > 0 && (
                          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadData.unreadCount} unread
                          </span>
                        )}
                      </div>
                      {unreadData && unreadData.unreadCount > 0 ? (
                        <button
                          onClick={() => markAllReadMutation.mutate()}
                          disabled={markAllReadMutation.isPending}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer hover:underline disabled:opacity-50"
                        >
                          Mark all as read
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">EduPulse Alerts</span>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {isLoadingNotifs ? (
                        <div className="p-6 text-center text-xs text-slate-400">Loading notifications...</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                          <p className="font-semibold text-slate-700">All caught up!</p>
                          <p className="text-slate-400">No new alerts or system notices.</p>
                        </div>
                      ) : (
                        notifications.map((n: any) => (
                          <div 
                            key={n.id} 
                            className={cn(
                              "p-3.5 flex items-start justify-between gap-3 transition-colors",
                              n.read ? "bg-white opacity-75" : "bg-blue-50/40"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                  "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                                  n.type === 'ERROR' || n.type === 'WARNING' ? "bg-amber-100 text-amber-800" :
                                  n.type === 'SUCCESS' ? "bg-emerald-100 text-emerald-800" :
                                  "bg-slate-100 text-slate-700"
                                )}>
                                  {n.type || 'INFO'}
                                </span>
                                <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-2">{n.message}</p>
                              {n.link && (
                                <Link
                                  to={n.link}
                                  onClick={() => {
                                    if (!n.read) markReadMutation.mutate(n.id);
                                    setIsNotificationsOpen(false);
                                  }}
                                  className="inline-flex items-center text-[11px] text-blue-600 hover:text-blue-800 font-semibold mt-1.5 hover:underline"
                                >
                                  Open workflow &rarr;
                                </Link>
                              )}
                              {n.createdAt && (
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {new Date(n.createdAt).toLocaleString(undefined, {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                  })}
                                </p>
                              )}
                            </div>
                            {!n.read && (
                              <button
                                onClick={() => markReadMutation.mutate(n.id)}
                                disabled={markReadMutation.isPending}
                                className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100/60 p-1 rounded font-medium shrink-0"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 focus:outline-none"
              >
                <UserCircle className="w-6 h-6" />
                <span className="text-sm font-medium">{user?.username}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-20 py-1 overflow-hidden">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
                      <p className="text-xs text-slate-500">{user?.role?.replace('_', ' ')}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsChangePasswordOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2 border-b border-slate-100"
                    >
                      <KeyRound className="w-4 h-4 text-slate-500" />
                      <span>Change Password</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            <ChangePasswordModal 
              isOpen={isChangePasswordOpen} 
              onClose={() => setIsChangePasswordOpen(false)} 
            />
          </div>
        </header>

        {/* Mobile menu backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 z-20 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Outlet */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative flex flex-col min-h-0 print:overflow-visible print:bg-white">
          <Outlet />
          <ClassroomCallOverlay />
        </main>
      </div>

      <CommunicationOutboxDrawer
        isOpen={isCommunicationOutboxOpen}
        onClose={() => setIsCommunicationOutboxOpen(false)}
      />

      <ServerSettingsModal 
        isOpen={isServerModalOpen} 
        onClose={() => setIsServerModalOpen(false)} 
        onSaved={(newUrl) => setCurrentServerUrl(newUrl)} 
      />
    </div>
  );
}