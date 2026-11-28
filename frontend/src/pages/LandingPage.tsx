import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
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
import IntegrationsSection from '../components/marketing/IntegrationsSection';
import { Reveal, StaggerGrid, StaggerItem } from '../components/marketing/MotionPrimitives';

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
  const [activeCap, setActiveCap] = useState(0);
  const [activeTrust, setActiveTrust] = useState(0);
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

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveShowcase((prev) => {
        const idx = SHOWCASE_TABS.findIndex((t) => t.id === prev);
        return SHOWCASE_TABS[(idx + 1) % SHOWCASE_TABS.length].id;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const lifecycleTimer = setInterval(() => {
      setActiveLifecycle((prev) => (prev + 1) % LIFECYCLE_STEPS.length);
    }, 4500);
    const gridTimer = setInterval(() => {
      setActiveCap((prev) => (prev + 1) % CAPABILITIES.length);
      setActiveTrust((prev) => (prev + 1) % 4);
    }, 2600);
    return () => {
      clearInterval(lifecycleTimer);
      clearInterval(gridTimer);
    };
  }, [shouldReduceMotion]);

  const activeShowcaseIdx = Math.max(
    0,
    SHOWCASE_TABS.findIndex((t) => t.id === activeShowcase)
  );
  const currentStep = LIFECYCLE_STEPS[activeLifecycle] || LIFECYCLE_STEPS[0];

  return (
    <MarketingLayout>
      {/* ────────────────────────── HERO ───────────────────────────── */}
      <section className="pt-12 sm:pt-16 lg:pt-24 pb-16 sm:pb-24 lg:pb-28">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
            {/* Left: Commanding Editorial Hero Copy */}
            <div className="lg:col-span-5 min-w-0">
              <h1 className="text-4xl sm:text-5xl sm:leading-[1.16] lg:text-[56px] lg:leading-[1.15] xl:text-[64px] xl:leading-[1.15] font-medium tracking-[-0.035em] text-white">
                Run your institution with{' '}
                <span className="relative inline-block px-2.5 mx-0.5">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 180 68"
                    preserveAspectRatio="none"
                    className="pointer-events-none absolute -inset-x-1.5 -inset-y-0.5 w-[calc(100%+12px)] h-[calc(100%+4px)] -rotate-1"
                  >
                    <path
                      d="M8 22C38 11 112 7 169 14C176 15 178 24 172 32C168 38 174 47 166 53C124 62 42 63 10 55C3 52 2 38 7 30C4 26 4 23 8 22Z"
                      fill="#F59E0B"
                    />
                    <path
                      d="M14 14C62 6 128 6 172 12"
                      stroke="#FBBF24"
                      strokeWidth="4"
                      strokeLinecap="round"
                      opacity="0.7"
                    />
                    <path
                      d="M6 56C54 62 126 60 168 54"
                      stroke="#D97706"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                  </svg>
                  <span className="marketing-brush-text relative z-10 text-zinc-950 font-semibold">
                    one
                  </span>
                </span>{' '}
                connected system.
              </h1>
              <p className="mt-6 text-base sm:text-lg xl:text-xl text-zinc-400 leading-relaxed max-w-xl">
                EduPulse brings admissions, academics, examinations, finance, and
                campus operations into a single platform built for Indian schools
                and colleges.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/onboard"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-white text-zinc-950 text-sm sm:text-base font-medium hover:bg-zinc-200 transition-colors"
                >
                  Start 14-day trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-zinc-900 text-zinc-200 text-sm sm:text-base font-medium border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
              </div>

              <div className="mt-12 pt-6 border-t border-zinc-800 grid grid-cols-3 gap-4 max-w-lg">
                <div>
                  <div className="text-sm font-mono text-white">14-day</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Full-featured trial</div>
                </div>
                <div>
                  <div className="text-sm font-mono text-white">INR</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Native fee ledgers</div>
                </div>
                <div>
                  <div className="text-sm font-mono text-white">RLS</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Isolated per institution</div>
                </div>
              </div>
            </div>

            {/* Right: Genuine ERP Dashboard Stage */}
            <Reveal delay={0.1} className="lg:col-span-7 min-w-0 relative">
              {!shouldReduceMotion && (
                <motion.div
                  aria-hidden="true"
                  animate={{ opacity: [0.35, 0.72, 0.35], scale: [0.98, 1.03, 0.98] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="pointer-events-none absolute -inset-4 rounded-2xl bg-gradient-to-tr from-amber-500/25 via-amber-400/10 to-sky-500/25 blur-2xl"
                />
              )}
              <motion.div
                className="relative z-10"
                animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ScreenshotFrame
                  src="/screenshots/erp-dashboard.png"
                  alt="EduPulse institutional dashboard showing system users, departments, students, admissions, and recent enrollments"
                  url="app.edupulseerp.in/dashboard"
                  priority
                />
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ────────────────── PLATFORM CAPABILITIES (HAIRLINE GRID) ────── */}
      <section className="py-20 sm:py-28 border-t border-zinc-800" id="platform">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
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

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-zinc-800">
            {CAPABILITIES.map((cap, idx) => {
              const highlighted = !shouldReduceMotion && activeCap === idx;
              return (
                <StaggerItem
                  key={cap.title}
                  className={`relative group border-r border-b border-zinc-800 p-7 sm:p-9 transition-all duration-500 overflow-hidden ${
                    highlighted
                      ? 'bg-gradient-to-b from-zinc-800/50 to-zinc-900/30'
                      : 'hover:bg-zinc-900/40'
                  }`}
                >
                  {highlighted && (
                    <motion.span
                      layoutId="cap-active-line"
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/90 to-transparent"
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                  <div className="flex items-center gap-2.5 mb-3">
                    <cap.icon
                      className={`w-4 h-4 transition-all duration-300 shrink-0 ${
                        highlighted
                          ? 'text-amber-400 scale-110'
                          : 'text-zinc-400 group-hover:text-white group-hover:scale-110'
                      }`}
                    />
                    <h3 className="text-lg font-medium text-white">
                      {cap.title}
                    </h3>
                  </div>
                  <p className="text-base text-zinc-400 leading-relaxed">
                    {cap.body}
                  </p>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* ────────────────── PRODUCT SHOWCASE (SPLIT EXPLORER) ─────────── */}
      <section className="py-20 sm:py-28 border-t border-zinc-800 bg-zinc-950/60">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
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
            {/* Left vertical selector rail (auto-advancing) */}
            <div className="lg:col-span-4 border-t border-zinc-800" role="tablist">
              {SHOWCASE_TABS.map((tab) => {
                const isActive = activeShowcase === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveShowcase(tab.id)}
                    className={`relative w-full text-left py-4 px-4 border-b border-zinc-800 border-l-2 transition-colors cursor-pointer overflow-hidden ${
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
                    {isActive && !shouldReduceMotion && (
                      <motion.div
                        key={`progress-${tab.id}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 3, ease: 'linear' }}
                        style={{ transformOrigin: 'left' }}
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-400"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right orbital 3D ring carousel (steps clockwise every 3s) */}
            <div className="relative z-0 lg:col-span-8 min-w-0 pt-10 sm:pt-14 pb-4 overflow-hidden">
              <div className="relative flex items-center justify-center">
                {/* Subtle orbital ring guide */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[58%] w-[84%] h-[42%] rounded-[100%] border border-zinc-800/80"
                />

                {/* Invisible sizer matching front card width/height */}
                <div className="w-[78%] sm:w-[74%] invisible pointer-events-none" aria-hidden="true">
                  <ScreenshotFrame
                    src={SHOWCASE_TABS[0].screenshot}
                    alt=""
                    url="app.edupulseerp.in/dashboard"
                  />
                </div>

                {SHOWCASE_TABS.map((tab, idx) => {
                  const total = SHOWCASE_TABS.length;
                  // Clockwise step: each card advances one orbital slot every 3s
                  const slot = (idx - activeShowcaseIdx + total) % total;
                  const angle = (slot * 2 * Math.PI) / total;

                  // depth: 1 at front (0 deg), 0 at back (180 deg)
                  const depth = (Math.cos(angle) + 1) / 2;
                  const x = Math.sin(angle) * 150;
                  const y = (1 - Math.cos(angle)) * -38 + 16;
                  const scale = 0.5 + depth * 0.5;
                  const opacity = 0.35 + depth * 0.65;
                  const zIndex = Math.round(depth * 10) + 1;

                  return (
                    <motion.div
                      key={tab.id}
                      initial={false}
                      animate={{
                        x,
                        y,
                        scale,
                        opacity,
                      }}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { duration: 0.75, ease: [0.22, 1, 0.36, 1] }
                      }
                      style={{
                        zIndex,
                        pointerEvents: slot === 0 ? 'auto' : 'none',
                      }}
                      className="absolute w-[78%] sm:w-[74%] origin-center"
                    >
                      <ScreenshotFrame
                        src={tab.screenshot}
                        alt={tab.alt}
                        url={`app.edupulseerp.in/${tab.id === 'dashboard' ? 'dashboard' : `dashboard/${tab.id}`}`}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── INSTITUTIONAL LIFECYCLE ──────────────────── */}
      <section className="py-20 sm:py-28 border-t border-zinc-800">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
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
                  className={`flex flex-col justify-start text-left pt-5 border-t-2 transition-colors cursor-pointer ${
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
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
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

      {/* ─────────────── INTEGRATIONS ECOSYSTEM (HAIRLINE) ──────────── */}
      <IntegrationsSection />

      {/* ─────────────── TRUST & ARCHITECTURE (HAIRLINE) ─────────────── */}
      <section className="py-20 sm:py-28 border-t border-zinc-800">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white mb-12">
            Built for institutional trust
          </h2>
          <StaggerGrid className="grid sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-zinc-800">
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
            ].map((item, idx) => {
              const highlighted = !shouldReduceMotion && activeTrust === idx;
              return (
                <StaggerItem
                  key={item.title}
                  className={`relative group border-r border-b border-zinc-800 p-7 sm:p-8 transition-all duration-500 overflow-hidden ${
                    highlighted
                      ? 'bg-gradient-to-b from-zinc-800/50 to-zinc-900/30'
                      : 'hover:bg-zinc-900/40'
                  }`}
                >
                  {highlighted && (
                    <motion.span
                      layoutId="trust-active-line"
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/90 to-transparent"
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                  <div className="flex items-center gap-2.5 mb-3">
                    <item.icon
                      className={`w-4 h-4 transition-all duration-300 shrink-0 ${
                        highlighted
                          ? 'text-amber-400 scale-110'
                          : 'text-zinc-400 group-hover:text-white group-hover:scale-110'
                      }`}
                    />
                    <h3 className="text-base font-medium text-white">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                    {item.body}
                  </p>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </div>
      </section>

      {/* ─────────────────────── PRICING (MATRIX) ────────────────────── */}
      <section className="py-20 sm:py-28 border-t border-zinc-800 bg-zinc-950/60" id="pricing">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
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

          <Reveal>
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
          </Reveal>
        </div>
      </section>

      {/* ──────────────────────── FAQ (2-COL SPLIT) ──────────────────── */}
      <section className="py-20 sm:py-28 border-t border-zinc-800" id="faq">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
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
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.p
                        initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed overflow-hidden"
                      >
                        {item.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────── FINAL CTA ──────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-zinc-800 bg-zinc-950/60">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
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
