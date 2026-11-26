import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  BookOpen,
  Award,
  IndianRupee,
  CalendarCheck,
  Building2,
  Check,
} from 'lucide-react';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import ScreenshotFrame from '../../components/marketing/ScreenshotFrame';

const MODULES = [
  {
    id: 'students',
    icon: Users,
    badge: 'Student Information',
    title: 'Unified student lifecycle & 360° profiles',
    description:
      'Track every student from admission inquiry through enrollment, guardian mapping, section placement, and document records in one searchable directory.',
    points: [
      'Online admission pipeline with application review and approval',
      '360° student profile with guardian contacts and enrollment status',
      'Bulk CSV import with validation for rapid institutional onboarding',
    ],
    screenshot: '/screenshots/erp-students.png',
    alt: 'EduPulse student directory showing enrolled students and batch filtering',
    url: 'app.edupulseerp.in/dashboard/students',
  },
  {
    id: 'academics',
    icon: BookOpen,
    badge: 'Academic Management',
    title: 'Programs, courses, batches, and timetables',
    description:
      'Structure multi-year degree programs or school grades with department hierarchies, credit-bearing courses, faculty assignments, and conflict-checked schedules.',
    points: [
      'Department, program, batch, and section hierarchy',
      'Course catalog with credit definitions and faculty mapping',
      'Academic materials distribution and timetable scheduling',
    ],
    screenshot: '/screenshots/erp-academics.png',
    alt: 'EduPulse academic catalog showing programs, courses, and batch structure',
    url: 'app.edupulseerp.in/dashboard/academics',
  },
  {
    id: 'exams',
    icon: Award,
    badge: 'Examinations & GPA',
    title: 'Exam scheduling, grading, and transcripts',
    description:
      'Manage internal assessments and semester examinations with CBCS-aligned GPA calculation and downloadable academic transcripts.',
    points: [
      'Exam scheduling across sections and courses',
      'Faculty grade entry workflows and verification',
      'Transcript generation with public verification support',
    ],
    screenshot: '/screenshots/erp-exams.png',
    alt: 'EduPulse examination management workspace for scheduling exams and entering grades',
    url: 'app.edupulseerp.in/dashboard/academic/exams',
  },
  {
    id: 'finance',
    icon: IndianRupee,
    badge: 'Finance & Fees',
    title: 'INR fee structures, invoices, and student ledgers',
    description:
      'Configure term-wise fee structures, generate student invoices, record cash/cheque or online payments, and monitor pending collections in real time.',
    points: [
      'INR-native fee structures and installment tracking',
      'Individual student fee ledgers and receipt history',
      'Pending dues visibility across departments and batches',
    ],
    screenshot: '/screenshots/erp-finance.png',
    alt: 'EduPulse finance dashboard displaying INR fee collections and pending invoices',
    url: 'app.edupulseerp.in/dashboard/finance',
  },
  {
    id: 'attendance',
    icon: CalendarCheck,
    badge: 'Attendance Operations',
    title: 'Section-wise attendance and oversight',
    description:
      'Record daily or lecture-wise attendance per section and give registrars and heads of department clear visibility into attendance trends.',
    points: [
      'Fast section-wise attendance marking for faculty',
      'Departmental attendance oversight dashboard',
      'Student and guardian visibility into attendance standing',
    ],
    screenshot: '/screenshots/erp-attendance.png',
    alt: 'EduPulse attendance oversight screen showing section selection and attendance tracking',
    url: 'app.edupulseerp.in/dashboard/attendance',
  },
  {
    id: 'campus',
    icon: Building2,
    badge: 'Campus Administration',
    title: 'Multi-campus governance and role-based access',
    description:
      'Coordinate multiple campuses, libraries, transport routes, staff leaves, and compliance audit trails from a single administrative core.',
    points: [
      'Role-based access for Management, Faculty, Finance, and Students',
      'Library catalog, transport routes, and HR leave workflows',
      'Comprehensive audit logs for administrative accountability',
    ],
    screenshot: '/screenshots/erp-admissions.png',
    alt: 'EduPulse admissions and institutional administration pipeline',
    url: 'app.edupulseerp.in/dashboard/admissions',
  },
];

export default function PlatformPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-16 pb-16 sm:pt-24 sm:pb-20 border-b border-gray-800 bg-gray-950/70">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <p className="text-sm font-medium text-indigo-300 uppercase tracking-wider mb-3">
            Platform
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white max-w-4xl mx-auto">
            Every institutional workflow on one shared data foundation.
          </h1>
          <p className="mt-5 text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Explore the core modules inside EduPulse. Every screen below is
            captured directly from the live ERP application.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/start-trial"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-gray-950 font-medium hover:bg-gray-200 transition-colors"
            >
              Start 14-day trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-800 text-white font-medium border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              Talk to our team
            </Link>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-20 sm:py-28">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 space-y-24">
          {MODULES.map((mod, idx) => {
            const isEven = idx % 2 === 1;
            return (
              <div
                key={mod.id}
                id={mod.id}
                className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center"
              >
                <div className={`min-w-0 ${isEven ? 'lg:order-2' : ''}`}>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 mb-4">
                    <mod.icon className="w-3.5 h-3.5" />
                    {mod.badge}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3">
                    {mod.title}
                  </h2>
                  <p className="text-base text-gray-300 leading-relaxed mb-5">
                    {mod.description}
                  </p>
                  <ul className="space-y-2.5">
                    {mod.points.map((pt) => (
                      <li
                        key={pt}
                        className="flex items-start gap-2.5 text-sm text-gray-300"
                      >
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`min-w-0 ${isEven ? 'lg:order-1' : ''}`}>
                  <ScreenshotFrame
                    src={mod.screenshot}
                    alt={mod.alt}
                    url={mod.url}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </MarketingLayout>
  );
}
