import { Component, useEffect } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { isTauriDesktop } from './api/axiosClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentsList from './pages/StudentsList';
import StudentProfile from './pages/StudentProfile';
import DepartmentsList from './pages/DepartmentsList';
import Attendance from './pages/Attendance';
import FinanceDashboard from './pages/FinanceDashboard';
import InstitutionsList from './pages/InstitutionsList';
import CampusesList from './pages/CampusesList';
import GuardiansList from './pages/GuardiansList';
import AdminUsersList from './pages/AdminUsersList';
import Admissions from './pages/Admissions';
import Academics from './pages/Academics';
import FacultySections from './pages/FacultySections';
import PublicAdmissions from './pages/PublicAdmissions';
import LandingPage from './pages/LandingPage';
import InstitutionProfile from './pages/InstitutionProfile';
import { ProfileRedirect } from './components/ProfileRedirect';
import Layout from './components/Layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { VideoProvider } from './context/VideoContext';

// Functional modules imported from SaaS repository
import CourseManager from './pages/Academic/CourseManager';
import ExamManager from './pages/Academic/ExamManager';
import TranscriptViewer from './pages/Academic/TranscriptViewer';
import AttendanceTracker from './pages/Operations/AttendanceTracker';
import TimetableManager from './pages/Operations/TimetableManager';
import LibraryManager from './pages/Operations/LibraryManager';
import TransportManager from './pages/Operations/TransportManager';
import FeeManager from './pages/Finance/FeeManager';
import StudentLedger from './pages/Finance/StudentLedger';
import StudentFeeLedger from './pages/Portal/StudentFeeLedger';
import LeaveManager from './pages/HR/LeaveManager';
import PayrollDashboard from './pages/HR/PayrollDashboard';
import EnrollStudent from './pages/Admissions/EnrollStudent';
import VirtualClassroom from './pages/VirtualClassroom';
import AcademicMaterialView from './components/materials/AcademicMaterialView';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentPortalLayout from './layouts/StudentPortalLayout';
import StudentPortalDashboard from './pages/Portal/StudentDashboard';
import FeeCenter from './pages/Portal/FeeCenter';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center">
          <div className="max-w-md w-full space-y-4 bg-white p-8 rounded-xl shadow-md border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
            <p className="text-sm text-slate-600">The application encountered an unexpected error.</p>
            {this.state.error && (
              <p className="text-xs text-rose-600 font-mono bg-rose-50 p-3 rounded text-left overflow-auto max-h-32">
                {this.state.error.message}
              </p>
            )}
            <div className="flex justify-center space-x-3 pt-2">
              <Button onClick={() => window.location.reload()}>Try Again</Button>
              <Button variant="outline" onClick={this.handleReset}>Reset to Login</Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-slate-500 font-medium">Restoring session...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles: string[] }) {
  const user = useAuthStore((state) => state.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-slate-500 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function RootRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isTauriDesktop()) {
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />;
  }

  return <LandingPage />;
}

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center space-y-4">
    <h1 className="text-4xl font-bold text-slate-900">404 - Page Not Found</h1>
    <p className="text-slate-600">The page you are looking for doesn't exist or has been moved.</p>
    <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
  </div>
);

const Forbidden = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center space-y-4">
    <h1 className="text-4xl font-bold text-slate-900">403 - Access Denied</h1>
    <p className="text-slate-600">You do not have permission to access this page.</p>
    <Button onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <VideoProvider>
          <Router>
            <Routes>
              {/* Public & Authentication */}
              <Route path="/login" element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              } />
              <Route path="/admissions" element={<PublicAdmissions />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/403" element={<Forbidden />} />

              {/* Student Self-Service Dedicated Portal */}
              <Route
                path="/portal"
                element={
                  <ProtectedRoute>
                    <RoleProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN', 'ADMIN']}>
                      <StudentPortalLayout />
                    </RoleProtectedRoute>
                  </ProtectedRoute>
                }
              >
                <Route index element={<StudentPortalDashboard />} />
                <Route path="fees" element={<FeeCenter />} />
                <Route path="ledger" element={<StudentFeeLedger />} />
                <Route path="fee-ledger" element={<StudentFeeLedger />} />
                <Route path="schedule" element={<TimetableManager />} />
                <Route path="academics" element={<TranscriptViewer />} />
                <Route path="materials" element={<AcademicMaterialView />} />
                <Route path="classroom" element={<VirtualClassroom />} />
              </Route>

              {/* Main ERP Dashboard Shell */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT', 'PARENT', 'FINANCE']}><ProfileRedirect /></RoleProtectedRoute>} />
                <Route path="students" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT', 'PARENT', 'FINANCE']}><StudentsList /></RoleProtectedRoute>} />
                <Route path="students/:id" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT', 'PARENT', 'FINANCE']}><StudentProfile /></RoleProtectedRoute>} />
                <Route path="departments" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><DepartmentsList /></RoleProtectedRoute>} />
                <Route path="attendance" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT', 'PARENT']}><Attendance /></RoleProtectedRoute>} />
                <Route path="finance" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'STUDENT', 'PARENT']}><FinanceDashboard /></RoleProtectedRoute>} />
                <Route path="institutions" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}><InstitutionsList /></RoleProtectedRoute>} />
                <Route path="campuses" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}><CampusesList /></RoleProtectedRoute>} />
                <Route path="institution-profile" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><InstitutionProfile /></RoleProtectedRoute>} />
                <Route path="admissions" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><Admissions /></RoleProtectedRoute>} />
                <Route path="admissions/enroll" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><EnrollStudent /></RoleProtectedRoute>} />
                <Route path="academics" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY']}><Academics /></RoleProtectedRoute>} />
                <Route path="sections" element={<RoleProtectedRoute allowedRoles={['FACULTY']}><FacultySections /></RoleProtectedRoute>} />
                <Route path="guardians" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><GuardiansList /></RoleProtectedRoute>} />
                <Route path="admin/users" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}><AdminUsersList /></RoleProtectedRoute>} />

                {/* Academic Functional Modules */}
                <Route path="academic/courses" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY']}><CourseManager /></RoleProtectedRoute>} />
                <Route path="academic/course-manager" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY']}><CourseManager /></RoleProtectedRoute>} />
                <Route path="academic/exams" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY']}><ExamManager /></RoleProtectedRoute>} />
                <Route path="academic/transcripts" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT']}><TranscriptViewer /></RoleProtectedRoute>} />
                <Route path="academic/materials" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT']}><AcademicMaterialView /></RoleProtectedRoute>} />
                <Route path="academic/classroom" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT']}><VirtualClassroom /></RoleProtectedRoute>} />
                <Route path="classroom" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT']}><VirtualClassroom /></RoleProtectedRoute>} />

                {/* Operations Functional Modules */}
                <Route path="operations/attendance" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY']}><AttendanceTracker /></RoleProtectedRoute>} />
                <Route path="operations/timetable" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT']}><TimetableManager /></RoleProtectedRoute>} />
                <Route path="operations/library" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT']}><LibraryManager /></RoleProtectedRoute>} />
                <Route path="operations/transport" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'STUDENT']}><TransportManager /></RoleProtectedRoute>} />

                {/* Finance & HR Functional Modules */}
                <Route path="finance/fees" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FINANCE']}><FeeManager /></RoleProtectedRoute>} />
                <Route path="finance/fee-manager" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FINANCE']}><FeeManager /></RoleProtectedRoute>} />
                <Route path="finance/ledger" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FINANCE']}><StudentLedger /></RoleProtectedRoute>} />
                <Route path="finance/tuition" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'STUDENT']}><StudentFeeLedger /></RoleProtectedRoute>} />
                <Route path="hr/leaves" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FACULTY']}><LeaveManager /></RoleProtectedRoute>} />
                <Route path="hr/payroll" element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN', 'FINANCE']}><PayrollDashboard /></RoleProtectedRoute>} />
              </Route>
              <Route path="/" element={<RootRoute />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster position="top-right" richColors />
        </VideoProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
