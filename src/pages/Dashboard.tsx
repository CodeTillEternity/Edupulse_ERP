import { useAuthStore } from '../store/useAuthStore';
import FacultyDashboard from './FacultyDashboard';
import StudentDashboard from './StudentDashboard';
import ParentDashboard from './ParentDashboard';
import FinanceDashboardHome from './FinanceDashboardHome';
import ManagementDashboard from './ManagementDashboard';
import ApplicantDashboard from './ApplicantDashboard';

export default function Dashboard() {
  const { user } = useAuthStore();
  const rawRole = user?.role || '';
  const role = (rawRole || 'ADMIN').toUpperCase().replace(/^ROLE_/, '');

  switch (role) {
    case 'FACULTY':
      return <FacultyDashboard />;
    case 'STUDENT':
      return <StudentDashboard />;
    case 'PARENT':
      return <ParentDashboard />;
    case 'FINANCE':
      return <FinanceDashboardHome />;
    case 'APPLICANT':
      return <ApplicantDashboard />;
    case 'SUPER_ADMIN':
    case 'ADMIN':
    default:
      return <ManagementDashboard />;
  }
}