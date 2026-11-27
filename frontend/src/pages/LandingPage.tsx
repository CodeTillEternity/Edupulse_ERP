import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronDown,
  GraduationCap,
  BookOpen,
  IndianRupee,
  ClipboardCheck,
  Building2,
  Shield,
  Database,
  Globe,
  Smartphone,
  BarChart3,
} from 'lucide-react';
import MarketingLayout from '../components/marketing/MarketingLayout';
import ScreenshotFrame from '../components/marketing/ScreenshotFrame';

/* ─── Data ────────────────────────────────────────────────────────── */

const CAPABILITIES = [
  {
    icon: GraduationCap,
    title: 'Student lifecycle',
    body: 'Track every student from admission inquiry to graduation in a unified 360° profile.',
  },
  {
    icon: BookOpen,
    title: 'Academic management',
    body: 'Configure departments, programs, credit courses, batches, and conflict-free timetables.',
  },
  {
    icon: BarChart3,
    title: 'Examinations & GPA',
    body: 'Schedule exams, enter grades, compute CBCS GPA, and issue verified transcripts.',
  },
  {
    icon: IndianRupee,
    title: 'Finance & fees',
    body: 'Manage INR fee structures, student ledgers, online payments, and cash/cheque receipts.',
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance operations',
    body: 'Mark section-wise attendance fast with instant oversight for department heads.',
  },
  {
    icon: Building2,
    title: 'Campus administration',
    body: 'Run multi-campus nodes, library circulation, transport routes, and staff payroll.',
  },
] as const;

const LIFECYCLE_STEPS = [
  {
    label: 'Admissions',
    desc: 'Capture inquiries, review documents, and approve applications.',
    detail: 'Public intake portals feed directly into your registrar queue with status tracking and one-click approval.',
  },
  {
    label: 'Enrollment',
    desc: 'Assign programs, batches, sections, and guardian contacts.',
    detail: 'Approved applicants convert into active student records with auto-generated enrollment IDs and batch placement.',
  },
  {
    label: 'Academics',
    desc: 'Deliver courses, timetables, study materials, and attendance.',
    detail: 'Faculty and registrars coordinate schedules, course catalogs, and daily section-wise attendance in one workspace.',
  },
  {
    label: 'Assessment',
    desc: 'Schedule exams, record marks, and publish official transcripts.',
    detail: 'Run CBCS-compliant grading, verify marksheets, and share QR-verifiable academic transcripts.',
  },
  {
    label: 'Finance',
    desc: 'Generate INR invoices, collect fees, and track pending dues.',
    detail: 'Term-wise fee structures, student ledgers, and real-time collection summaries keep finance teams aligned.',
  },
  {
    label: 'Administration',
    desc: 'Oversee library, transport, HR payroll, and audit compliance.',
    detail: 'Centralized role-based access, audit logs, and campus operations keep every department accountable.',
  },
] as const;

const SHOWCASE_TABS = [
  {
    id: 'dashboard',
    label: 'Institution overview',
    description:
      'Monitor active users, departments, student strength, and admissions from one live command view.',
    screenshot: '/screenshots/erp-dashboard.png',
    alt: 'EduPulse Institution Dashboard showing system users, departments, total students, admissions queue, and recent enrollments',
  },
  {
    id: 'students',
    label: 'Student directory',
    description:
      'Filter students across departments and batches, and open complete 360° profiles in one click.',
    screenshot: '/screenshots/erp-students.png',
    alt: 'EduPulse Student Directory displaying enrolled students with enrollment numbers, departments, semesters, and status',
  },
  {
    id: 'academics',
    label: 'Academic catalog',
    description:
      'Organize degree programs, credit-bearing courses, batches, and active academic sections.',
    screenshot: '/screenshots/erp-academics.png',
    alt: 'EduPulse Academic Catalog showing B.Tech Computer Science and B.Sc Physics programs, courses, and batches',
  },
  {
    id: 'finance',
    label: 'Finance & billing',
    description:
      'Track INR fee collections, pending balances, and individual student invoices in real time.',
    screenshot: '/screenshots/erp-finance.png',
    alt: 'EduPulse Finance Dashboard showing ₹53,500 collected, ₹53,500 pending, and recent student fee invoices',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    description:
      'Record section-wise attendance and give registrars instant visibility into student participation.',
    screenshot: '/screenshots/erp-attendance.png',
    alt: 'EduPulse Attendance Oversight screen with section selector and attendance summary',
  },
] as const;

type ShowcaseId = (typeof SHOWCASE_TABS)[number]['id'];

const PRICING_TIERS: {
  name: string;
  audience: string;
  highlight?: boolean;
  features: string[];
}[] = [
  {
    name: 'Starter',
    audience: 'For schools and single-campus institutions',
    features: [
      'Student directory & 360° profiles',
      'Admissions pipeline',
      'Academic catalog & timetables',
      'Attendance tracking',
      'INR fee structures & invoicing',
      'CSV data import',
    ],
  },
  {
    name: 'Professional',
    audience: 'For growing colleges and multi-department institutes',
    highlight: true,
    features: [
      'Everything in Starter',
      'Examinations, GPA & transcripts',
      'Student & guardian self-service portal',
      'Library & transport management',
      'HR leave & payroll management',
      'Role-based access & audit logs',
    ],
  },
  {
    name: 'Enterprise',
    audience: 'For universities and multi-campus trusts',
    features: [
      'Everything in Professional',
      'Multi-campus governance',
      'Custom onboarding & data migration',
      'Dedicated implementation support',
      'Compliance & audit reporting',
      'Custom institutional agreements',
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: 'What is EduPulse?',
    a: 'EduPulse is a multi-tenant institutional ERP built for Indian schools, colleges, and universities. It unifies student records, admissions, academics, examinations, INR fee management, attendance, HR, library, and transport into one connected platform.',
  },
  {
    q: 'How long is the free trial?',
    a: 'Every institution receives a 14-day full-featured trial. No credit card is required to start.',
  },
  {
    q: 'How is pricing structured?',
    a: 'Pricing is in INR and tailored to your institution size and modules. Contact our team for a custom institutional quote.',
  },
  {
    q: 'How is institutional data isolated?',
    a: 'Every institution operates in its own isolated tenant context backed by PostgreSQL Row-Level Security (RLS). Your data is never shared with or visible to any other institution.',
  },
  {
    q: 'Can I import existing student data?',
    a: 'Yes. EduPulse includes a bulk CSV data ingestion tool for students, faculty, departments, and fee records with pre-import validation.',
  },
  {
    q: 'Does EduPulse work offline?',
    a: 'The web application requires an internet connection. A native Windows Desktop application is currently in pre-release development.',
  },
  {
    q: 'What payment methods are supported for student fees?',
    a: 'EduPulse supports online fee collection as well as manual offline payment recording for cash and cheque transactions.',
  },
  {
    q: 'How do I get started?',
    a: 'Click "Start 14-day trial" and provide your institution name, administrator email, and password to provision your workspace.',
  },
] as const;

/* ─── Component ───────────────────────────────────────────────────── */

export default function LandingPage() {
  const [activeShowcase, setActiveShowcase] = useState<ShowcaseId>('dashboard');
  const [activeLifecycle, setActiveLifecycle] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const shouldReduceMotion = useReducedMotion();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [hash]);

  const currentShowcase = SHOWCASE_TABS.find((t) => t.id === activeShowcase) || SHOWCASE_TABS[0];
  const currentStep = LIFECYCLE_STEPS[activeLifecycle] || LIFECYCLE_STEPS[0];

  return (
    <MarketingLayout>
      {/* ────────────────────────── HERO ───────────────────────────── */}
      <section className="pt-10 sm:pt-14 lg:pt-16 pb-14 sm:pb-20">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-end mb-10 sm:mb-12">
            <div className="lg:col-span-7">
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-medium tracking-[-0.035em] leading-[1.12] text-white">
                Run your institution with one connected system.
              </h1>
            </div>
            <div className="lg:col-span-5 space-y-5">
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                EduPulse brings admissions, academics, examinations, finance, and
                campus operations into a single platform built for Indian schools
                and colleges.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/onboard"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-white text-zinc-950 text-sm sm:text-base font-medium hover:bg-zinc-200 transition-colors"
                >
                  Start 14-day trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-zinc-900 text-zinc-200 text-sm sm:text-base font-medium border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>

          {/* Genuine ERP Dashboard */}
          <ScreenshotFrame
            src="/screenshots/erp-dashboard.png"
            alt="EduPulse institutional dashboard showing system users, departments, students, admissions, and recent enrollments"
            url="app.edupulseerp.in/dashboard"
            priority
          />
        </div>
      </section>

      {/* ────────────────── PLATFORM CAPABILITIES (HAIRLINE GRID) ────── */}
      <section className="py-20 sm:py-28 border-t border-zinc-800" id="platform">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white">
                More than separate tools.{' '}
                <span className="text-zinc-500">One connected platform.</span>
              </h2>
            </div>
            <Link
              to="/platform"
              className="inline-flex items-center gap-1.5 text-sm sm:text-base font-medium text-zinc-300 hover:text-white transition-colors shrink-0"
            >
              Explore all modules
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-zinc-800">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.title}
                className="border-r border-b border-zinc-800 p-7 sm:p-9 hover:bg-zinc-900/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <cap.icon className="w-4 h-4 text-zinc-400 shrink-0" />
                  <h3 className="text-lg font-medium text-white">
                    {cap.title}
                  </h3>
                </div>
                <p className="text-base text-zinc-400 leading-relaxed">
                  {cap.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── PRODUCT SHOWCASE (SPLIT EXPLORER) ─────────── */}
      <section className="py-20 sm:py-28 border-t border-zinc-800 bg-zinc-950/60">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white mb-4">
              See the work behind the interface.
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
              Real screens captured from the live EduPulse application. Select a
              workspace to inspect it.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left vertical selector rail */}
            <div className="lg:col-span-4 border-t border-zinc-800" role="tablist">
              {SHOWCASE_TABS.map((tab) => {
                const isActive = activeShowcase === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveShowcase(tab.id)}
                    className={`w-full text-left py-4 px-4 border-b border-zinc-800 border-l-2 transition-colors cursor-pointer ${
                      isActive
                        ? 'border-l-white bg-zinc-900/60'
                        : 'border-l-transparent hover:bg-zinc-900/30'
                    }`}
                  >
                    <div className={`text-base font-medium ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                      {tab.label}
                    </div>
                    {isActive && (
                      <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
                        {tab.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right genuine ERP screenshot */}
            <div className="lg:col-span-8 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentShowcase.id}
                  initial={shouldReduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <ScreenshotFrame
                    src={currentShowcase.screenshot}
                    alt={currentShowcase.alt}
                    url={`app.edupulseerp.in/${currentShowcase.id === 'dashboard' ? 'dashboard' : `dashboard/${currentShowcase.id}`}`}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── INSTITUTIONAL LIFECYCLE ──────────────────── */}
      <section className="py-20 sm:py-28 border-t border-zinc-800">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white max-w-xl">
              The complete institutional lifecycle
            </h2>
            <p className="text-base text-zinc-400 max-w-md leading-relaxed">
              Select a stage to inspect how student and financial records stay
              synchronized across departments.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {LIFECYCLE_STEPS.map((step, i) => {
              const isActive = activeLifecycle === i;
              return (
                <button
                  key={step.label}
                  type="button"
                  onClick={() => setActiveLifecycle(i)}
                  className={`text-left pt-5 border-t-2 transition-colors cursor-pointer ${
                    isActive
                      ? 'border-white'
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <span className={`block text-xs font-mono mb-2 ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                    0{i + 1}
                  </span>
                  <h4 className={`text-base font-medium mb-1.5 ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                    {step.label}
                  </h4>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {step.desc}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-10 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-base text-zinc-300 max-w-3xl leading-relaxed">
              <span className="font-mono text-xs text-zinc-500 mr-3">
                0{activeLifecycle + 1} / {currentStep.label}
              </span>
              {currentStep.detail}
            </p>
            <Link
              to="/platform"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-zinc-300 transition-colors shrink-0"
            >
              View module breakdown
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ────────────── ROLE-BASED EXPERIENCE (SPLIT) ────────────────── */}
      <section className="py-20 sm:py-28 border-t border-zinc-800 bg-zinc-950/60">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white mb-4">
              Built for every role in your institution
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
              Each user sees exactly what they need — from the registrar&apos;s
              admissions pipeline to a student&apos;s fee ledger.
            </p>
          </div>

          {/* Management view */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-24">
            <div className="lg:col-span-5 min-w-0">
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">
                Management &amp; Registrar
              </p>
              <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-white mb-4">
                Complete institutional visibility
              </h3>
              <p className="text-base text-zinc-400 leading-relaxed mb-6">
                See system-wide KPIs, departmental breakdowns, enrollment
                trends, and user activity — all from a single dashboard.
              </p>
              <ul className="space-y-3 border-t border-zinc-800 pt-5">
                {['Real-time enrollment and admissions metrics', 'Cross-department student directory', 'System access and audit logs', 'Multi-campus node management'].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-300">
                      <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div className="lg:col-span-7 min-w-0">
              <ScreenshotFrame
                src="/screenshots/erp-student-profile.png"
                alt="Student 360° profile showing personal information, academic placement, guardians, and document actions"
                url="app.edupulseerp.in/dashboard/students/1"
              />
            </div>
          </div>

          {/* Faculty view */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1 min-w-0">
              <ScreenshotFrame
                src="/screenshots/erp-exams.png"
                alt="Faculty examination center showing exam scheduling form, grade entry toggle, and scheduled examinations table"
                url="app.edupulseerp.in/dashboard/academic/exams"
              />
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2 min-w-0">
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">
                Faculty
              </p>
              <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-white mb-4">
                Focused academic tools
              </h3>
              <p className="text-base text-zinc-400 leading-relaxed mb-6">
                Faculty get a streamlined view of their sections, course
                materials, attendance tracking, and exams — without clutter.
              </p>
              <ul className="space-y-3 border-t border-zinc-800 pt-5">
                {['Exam scheduling and grade entry', 'Section-wise attendance recording', 'Course material management', 'Timetable and schedule view'].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-300">
                      <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── TRUST & ARCHITECTURE (HAIRLINE) ─────────────── */}
      <section className="py-20 sm:py-28 border-t border-zinc-800">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white mb-12">
            Built for institutional trust
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-zinc-800">
            {[
              {
                icon: Shield,
                title: 'Tenant isolation',
                body: 'Every institution runs in its own PostgreSQL RLS boundary — data is never shared across tenants.',
              },
              {
                icon: Database,
                title: 'Your data, your control',
                body: 'Export students, fees, and academic records anytime with zero proprietary lock-in.',
              },
              {
                icon: Globe,
                title: 'Built for India',
                body: 'INR fee ledgers, UGC-compliant CBCS grading, and NAAC/NIRF reporting workflows.',
              },
              {
                icon: Smartphone,
                title: 'Web & desktop',
                body: 'Access from any browser today. Windows Desktop client is currently in pre-release.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border-r border-b border-zinc-800 p-7 sm:p-8"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <item.icon className="w-4 h-4 text-zinc-400 shrink-0" />
                  <h3 className="text-base font-medium text-white">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── PRICING (MATRIX) ────────────────────── */}
      <section className="py-20 sm:py-28 border-t border-zinc-800 bg-zinc-950/60" id="pricing">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white">
                Transparent institutional pricing
              </h2>
              <p className="mt-3 text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
                Every plan starts with a 14-day full-featured trial. No credit
                card required. Pricing is in INR and tailored to your institution.
              </p>
            </div>
            <a
              href="mailto:contact@edupulseerp.in"
              className="text-sm sm:text-base font-medium text-zinc-300 hover:text-white underline decoration-zinc-700 hover:decoration-white shrink-0"
            >
              Request custom INR quote
            </a>
          </div>

          <div className="grid lg:grid-cols-3 border border-zinc-800 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`p-7 sm:p-9 flex flex-col justify-between ${
                  tier.highlight ? 'bg-zinc-900/60' : 'bg-transparent'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-medium text-white">
                      {tier.name}
                    </h3>
                    {tier.highlight && (
                      <span className="text-xs font-mono uppercase tracking-wider text-white px-2 py-0.5 border border-zinc-700 rounded">
                        Most popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-zinc-400 mb-6 pb-6 border-b border-zinc-800">
                    {tier.audience}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-300">
                        <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to="/onboard"
                  className={`block w-full text-center px-4 py-3 rounded-md text-sm sm:text-base font-medium transition-colors ${
                    tier.highlight
                      ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                      : 'bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800'
                  }`}
                >
                  Start 14-day trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────── FAQ (2-COL SPLIT) ──────────────────── */}
      <section className="py-20 sm:py-28 border-t border-zinc-800" id="faq">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
            <div className="lg:col-span-4">
              <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] text-white mb-3">
                Frequently asked questions
              </h2>
              <p className="text-base text-zinc-400 leading-relaxed">
                Have another question?{' '}
                <a
                  href="mailto:contact@edupulseerp.in"
                  className="text-white underline decoration-zinc-700 hover:decoration-white"
                >
                  Email our team
                </a>
                .
              </p>
            </div>

            <div className="lg:col-span-8 divide-y divide-zinc-800 border-t border-zinc-800">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="py-5">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex items-center justify-between w-full text-left cursor-pointer group"
                    aria-expanded={openFaq === i}
                  >
                    <span className="text-base sm:text-lg font-medium text-zinc-100 group-hover:text-white transition-colors pr-4">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${
                        openFaq === i ? 'rotate-180 text-white' : ''
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
                      {item.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────── FINAL CTA ──────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-zinc-800 bg-zinc-950/60">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] text-white mb-3">
              Bring your institution&apos;s operations together.
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
              Start a 14-day trial and see how EduPulse replaces disconnected
              tools with one integrated platform.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/onboard"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-white text-zinc-950 text-sm sm:text-base font-medium hover:bg-zinc-200 transition-colors"
            >
              Start 14-day trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-zinc-900 text-zinc-200 text-sm sm:text-base font-medium border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
