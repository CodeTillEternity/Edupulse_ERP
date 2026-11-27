import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
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

  const revealProps = (delay = 0) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <MarketingLayout>
      {/* ────────────────────────── 2. HERO ───────────────────────────── */}
      <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-28 overflow-hidden">
        {/* Radial ambient spotlight + subtle architectural grid */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.18),transparent)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage: 'radial-gradient(ellipse 75% 60% at 50% 15%, #000 35%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 60% at 50% 15%, #000 35%, transparent 100%)',
          }}
        />

        <div className="relative max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div
            className="max-w-4xl mx-auto text-center mb-12 sm:mb-16"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] backdrop-blur-md text-xs sm:text-sm text-zinc-300 mb-7">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Built for Indian Schools &amp; Colleges · 14-day Trial</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-semibold tracking-[-0.035em] leading-[1.05] bg-gradient-to-b from-white via-white to-zinc-400 bg-clip-text text-transparent">
              Run your institution with one connected system.
            </h1>
            <p className="mt-6 text-lg sm:text-xl xl:text-[22px] text-zinc-400 leading-relaxed max-w-3xl mx-auto">
              EduPulse brings admissions, academics, examinations, finance, and
              campus operations into a single platform built for Indian schools
              and colleges.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/onboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white text-zinc-950 text-base font-medium hover:bg-zinc-200 transition-colors shadow-[0_1px_0_0_rgba(255,255,255,0.4)_inset,0_8px_24px_-4px_rgba(255,255,255,0.18)]"
              >
                Start 14-day trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white/[0.05] text-white text-base font-medium border border-white/[0.1] hover:bg-white/[0.09] transition-colors"
              >
                Sign in
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </Link>
            </div>
          </motion.div>

          {/* Hero screenshot — genuine product with ambient rim glow */}
          <motion.div
            className="relative max-w-7xl mx-auto"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute -inset-x-10 -top-6 h-48 bg-indigo-500/20 blur-3xl opacity-45" />
            <ScreenshotFrame
              src="/screenshots/erp-dashboard.png"
              alt="EduPulse institutional dashboard showing system users, departments, students, admissions, and recent enrollments"
              url="app.edupulseerp.in/dashboard"
              priority
              className="relative"
            />
          </motion.div>
        </div>
      </section>

      {/* ────────────────── 3. PLATFORM INTRODUCTION (BENTO) ──────────── */}
      <section className="py-24 sm:py-32 bg-[#0C0D12] border-y border-white/[0.07]" id="platform">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div
            {...revealProps()}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14"
          >
            <div className="max-w-2xl">
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-indigo-400 mb-3">
                Platform
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-white">
                More than separate tools.{' '}
                <span className="text-zinc-400">One connected platform.</span>
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:pb-1">
              <p className="text-base lg:text-lg text-zinc-400 max-w-md leading-relaxed">
                Every institutional function shares the same data foundation.
              </p>
              <Link
                to="/platform"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] px-4 py-2.5 rounded-lg shrink-0 transition-colors"
              >
                Explore modules
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Asymmetric Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5">
            {CAPABILITIES.map((cap, idx) => {
              const isFeatured = idx === 0 || idx === 3;
              return (
                <motion.div
                  key={cap.title}
                  {...revealProps(idx * 0.05)}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.015] border border-white/[0.08] p-7 sm:p-8 hover:border-indigo-400/40 hover:-translate-y-0.5 transition-all duration-200 ${
                    isFeatured ? 'md:col-span-6' : 'md:col-span-6 lg:col-span-3'
                  }`}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-60" />
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/15 ring-1 ring-inset ring-indigo-400/25 flex items-center justify-center group-hover:bg-indigo-500/25 transition-colors">
                      <cap.icon className="w-5 h-5 text-indigo-300" />
                    </div>
                    {isFeatured && (
                      <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.07]">
                        {idx === 0 ? 'Core Record' : 'INR Ledgers'}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold text-white mb-2.5">
                    {cap.title}
                  </h3>
                  <p className="text-base text-zinc-400 leading-relaxed">
                    {cap.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────────── 4. INSTITUTIONAL LIFECYCLE ─────────────────── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div
            {...revealProps()}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14"
          >
            <div className="max-w-2xl">
              <p className="text-xs font-mono uppercase tracking-[0.18em] text-indigo-400 mb-3">
                Lifecycle
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-white">
                The complete institutional lifecycle
              </h2>
            </div>
            <p className="text-base lg:text-lg text-zinc-400 max-w-md leading-relaxed lg:pb-1">
              Click any stage to trace how records flow from inquiry to compliance.
            </p>
          </motion.div>

          {/* Interactive stepper */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {LIFECYCLE_STEPS.map((step, i) => {
              const isActive = activeLifecycle === i;
              return (
                <button
                  key={step.label}
                  type="button"
                  onClick={() => setActiveLifecycle(i)}
                  className={`relative text-left rounded-2xl border p-5 transition-all cursor-pointer overflow-hidden ${
                    isActive
                      ? 'bg-[#12141C] border-indigo-400/60 ring-1 ring-indigo-400/25 shadow-[0_12px_32px_-12px_rgba(99,102,241,0.35)]'
                      : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.04]'
                  }`}
                >
                  {isActive && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent" />
                  )}
                  <div className="flex items-center justify-between mb-3.5">
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded-md transition-colors ${
                        isActive
                          ? 'bg-indigo-500 text-white'
                          : 'bg-white/[0.05] text-zinc-400 border border-white/[0.08]'
                      }`}
                    >
                      0{i + 1}
                    </span>
                  </div>
                  <h4 className="text-base lg:text-lg font-semibold text-white mb-1.5">
                    {step.label}
                  </h4>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {step.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active stage detail bar */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.label}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-6 rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#12141C] to-[#0D0F15] px-6 sm:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.16em] text-indigo-400 mb-1">
                  Stage 0{activeLifecycle + 1} · {currentStep.label}
                </p>
                <p className="text-base text-zinc-200 leading-relaxed">
                  {currentStep.detail}
                </p>
              </div>
              <Link
                to="/platform"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] px-4 py-2.5 rounded-lg shrink-0 transition-colors"
              >
                Explore modules
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ─────────────────── 5. PRODUCT SHOWCASE ──────────────────────── */}
      <section className="py-24 sm:py-32 bg-[#0C0D12] border-y border-white/[0.07]">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div {...revealProps()} className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-indigo-400 mb-3">
              Product
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-white">
              See the work behind the interface.
            </h2>
            <p className="mt-4 text-base sm:text-lg lg:text-xl text-zinc-400 leading-relaxed">
              Real screens captured from the live EduPulse application — switch
              modules below to inspect each workspace.
            </p>
          </motion.div>

          {/* Segmented control tabs with animated pill */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex flex-wrap justify-center gap-1.5 p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]"
              role="tablist"
            >
              {SHOWCASE_TABS.map((tab) => {
                const isActive = activeShowcase === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveShowcase(tab.id)}
                    className={`relative px-4 sm:px-5 py-2 rounded-lg text-sm lg:text-[15px] font-medium transition-colors cursor-pointer ${
                      isActive ? 'text-zinc-950' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="showcase-active-tab"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        className="absolute inset-0 rounded-lg bg-white shadow-sm"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active screenshot with smooth crossfade */}
          <div className="relative max-w-7xl mx-auto">
            <p className="text-center text-base lg:text-lg text-zinc-400 mb-6 max-w-2xl mx-auto">
              {currentShowcase.description}
            </p>
            <div className="pointer-events-none absolute -inset-x-8 top-12 h-40 bg-indigo-500/15 blur-3xl opacity-40" />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentShowcase.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="relative"
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
      </section>

      {/* ────────────── 6. ROLE-BASED EXPERIENCE (SPLIT) ─────────────── */}
      <section className="py-24 sm:py-32">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div {...revealProps()} className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-indigo-400 mb-3">
              Role-based Workspaces
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-white">
              Built for every role in your institution
            </h2>
            <p className="mt-4 text-base sm:text-lg lg:text-xl text-zinc-400 leading-relaxed">
              Each user sees exactly what they need — from the registrar&apos;s
              admissions pipeline to a student&apos;s fee ledger.
            </p>
          </motion.div>

          {/* Management view */}
          <motion.div {...revealProps()} className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-24">
            <div className="lg:col-span-5 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-400/25 mb-5">
                Management &amp; Registrar
              </span>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-4">
                Complete institutional visibility
              </h3>
              <p className="text-base lg:text-lg text-zinc-400 leading-relaxed mb-6">
                See system-wide KPIs, departmental breakdowns, enrollment
                trends, and user activity — all from a single dashboard.
              </p>
              <ul className="space-y-3">
                {['Real-time enrollment and admissions metrics', 'Cross-department student directory', 'System access and audit logs', 'Multi-campus node management'].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2.5 text-base text-zinc-300">
                      <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
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
          </motion.div>

          {/* Faculty view */}
          <motion.div {...revealProps()} className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1 min-w-0">
              <ScreenshotFrame
                src="/screenshots/erp-exams.png"
                alt="Faculty examination center showing exam scheduling form, grade entry toggle, and scheduled examinations table"
                url="app.edupulseerp.in/dashboard/academic/exams"
              />
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/25 mb-5">
                Faculty
              </span>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-4">
                Focused academic tools
              </h3>
              <p className="text-base lg:text-lg text-zinc-400 leading-relaxed mb-6">
                Faculty get a streamlined view of their sections, course
                materials, attendance tracking, and exams — without clutter.
              </p>
              <ul className="space-y-3">
                {['Exam scheduling and grade entry', 'Section-wise attendance recording', 'Course material management', 'Timetable and schedule view'].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2.5 text-base text-zinc-300">
                      <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────── 7. TRUST & ARCHITECTURE ──────────────────────── */}
      <section className="py-24 sm:py-32 bg-[#0C0D12] border-y border-white/[0.07]">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div {...revealProps()} className="max-w-3xl mx-auto text-center mb-14">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-indigo-400 mb-3">
              Architecture
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-white">
              Built for institutional trust
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                {...revealProps(idx * 0.05)}
                className="relative overflow-hidden bg-gradient-to-b from-white/[0.05] to-white/[0.015] rounded-2xl border border-white/[0.08] p-7 hover:border-white/[0.16] transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-500/15 ring-1 ring-inset ring-indigo-400/25 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-indigo-300" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-base text-zinc-400 leading-relaxed">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── 8. PRICING ───────────────────────────── */}
      <section className="py-24 sm:py-32" id="pricing">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div {...revealProps()} className="max-w-3xl mx-auto text-center mb-14">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-indigo-400 mb-3">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-white">
              Transparent institutional pricing
            </h2>
            <p className="mt-4 text-base sm:text-lg lg:text-xl text-zinc-400 leading-relaxed">
              Every plan starts with a 14-day full-featured trial. No credit
              card required. Pricing is in INR and tailored to your institution.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {PRICING_TIERS.map((tier, idx) => (
              <motion.div
                key={tier.name}
                {...revealProps(idx * 0.06)}
                className={`relative overflow-hidden rounded-2xl border p-7 sm:p-8 flex flex-col transition-all duration-200 hover:-translate-y-1 ${
                  tier.highlight
                    ? 'border-indigo-400/60 bg-gradient-to-b from-indigo-500/[0.1] to-white/[0.02] shadow-[0_24px_60px_-20px_rgba(99,102,241,0.35)] ring-1 ring-indigo-400/25'
                    : 'border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] hover:border-white/[0.16]'
                }`}
              >
                {tier.highlight && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                )}
                {tier.highlight && (
                  <span className="inline-flex self-start items-center px-3 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider bg-indigo-500 text-white mb-4">
                    Most popular
                  </span>
                )}
                <h3 className="text-xl font-semibold text-white">
                  {tier.name}
                </h3>
                <p className="text-base text-zinc-400 mt-1.5 mb-6">
                  {tier.audience}
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-base text-zinc-300">
                      <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/onboard"
                  className={`block w-full text-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    tier.highlight
                      ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm'
                      : 'bg-white/[0.06] text-white border border-white/[0.1] hover:bg-white/[0.12]'
                  }`}
                >
                  Start 14-day trial
                </Link>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-base text-zinc-400 mt-10">
            Need custom pricing for your institution?{' '}
            <a
              href="mailto:contact@edupulseerp.in"
              className="text-white font-medium underline decoration-white/30 hover:decoration-white"
            >
              Contact us
            </a>
          </p>
        </div>
      </section>

      {/* ──────────────────────── 9. FAQ ──────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-[#0C0D12] border-y border-white/[0.07]" id="faq">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-indigo-400 mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-white">
              Frequently asked questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-white/[0.08]">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="py-5">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center justify-between w-full text-left cursor-pointer group"
                  aria-expanded={openFaq === i}
                >
                  <span className="text-lg font-medium text-zinc-100 group-hover:text-indigo-300 transition-colors pr-4">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.p
                      initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mt-3 text-base text-zinc-400 leading-relaxed"
                    >
                      {item.a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────── 10. FINAL CTA ───────────────────────────── */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(99,102,241,0.16),transparent)]" />
        <div className="relative max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white mb-4">
            Bring your institution&apos;s operations together.
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-9">
            Start a 14-day trial and see how EduPulse replaces disconnected
            tools with one integrated platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/onboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white text-zinc-950 text-base font-medium hover:bg-zinc-200 transition-colors shadow-[0_1px_0_0_rgba(255,255,255,0.4)_inset,0_8px_24px_-4px_rgba(255,255,255,0.18)]"
            >
              Start 14-day trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white/[0.06] text-white text-base font-medium border border-white/[0.1] hover:bg-white/[0.1] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
