import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Pricing } from '../components/marketing/Pricing';
import {
  ArrowRight,
  Menu,
  X,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Receipt,
  CalendarCheck,
  Award,
  Users,
  Building2,
  QrCode,
  Printer,
  Download,
  Globe,
} from 'lucide-react';

type ShowcaseTab = 'overview' | 'transcript' | 'finance' | 'attendance';

const SHOWCASE_TABS: { id: ShowcaseTab; label: string; route: string }[] = [
  { id: 'overview', label: 'NAAC & Executive Hub', route: 'app.edupulseerp.in/dashboard/compliance' },
  { id: 'transcript', label: 'CBCS Transcript & QR', route: 'app.edupulseerp.in/dashboard/academic/transcripts' },
  { id: 'finance', label: 'Fee Ledger & 80mm POS', route: 'app.edupulseerp.in/dashboard/finance/ledger' },
  { id: 'attendance', label: 'UGC 75% Attendance', route: 'app.edupulseerp.in/dashboard/attendance' },
];

const CORE_PILLARS = [
  {
    icon: Users,
    title: 'Admissions & Student Lifecycle',
    description:
      'Public admission applications, document verification, batch enrollment, and printable student ID cards.',
  },
  {
    icon: GraduationCap,
    title: 'CBCS Academics & Examinations',
    description:
      'Programs, course offerings, timetable allocation, 10-point CBCS grading, and SHA-256 verifiable transcripts.',
  },
  {
    icon: Receipt,
    title: 'INR Fee Ledgers & 80mm POS',
    description:
      'Custom fee structures, Razorpay online payments, itemized 80mm thermal receipts, and defaulter tracking.',
  },
  {
    icon: CalendarCheck,
    title: 'UGC 75% Attendance & Alerts',
    description:
      'Section-wise live attendance registers, debarment alerts, and WhatsApp/SMS parent outbox notifications.',
  },
  {
    icon: Award,
    title: 'NAAC / NIRF & Audit Trail',
    description:
      'Live Student-Faculty Ratio, cadre distribution, CSV/print registers, and immutable system audit logs.',
  },
  {
    icon: Building2,
    title: 'Multi-Tenant Cloud + Desktop',
    description:
      'PostgreSQL row-level isolation per institution, custom crest branding, and native Windows Desktop parity.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('overview');

  const currentTabMeta = SHOWCASE_TABS.find((t) => t.id === activeTab) || SHOWCASE_TABS[0];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col font-sans antialiased selection:bg-zinc-950 selection:text-white">
      {/* 1. Clean Top Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/logo.jpg"
                alt="EduPulse Logo"
                className="h-8 w-8 rounded-lg object-cover border border-zinc-200"
              />
              <span className="font-bold text-base tracking-tight text-zinc-950">EduPulse</span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                ERP
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-zinc-600">
              <a
                href="#product"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('product');
                }}
                className="hover:text-zinc-950 transition-colors"
              >
                Product
              </a>
              <a
                href="#modules"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('modules');
                }}
                className="hover:text-zinc-950 transition-colors"
              >
                Modules
              </a>
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('pricing');
                }}
                className="hover:text-zinc-950 transition-colors"
              >
                Pricing
              </a>
              <Link to="/verify" className="hover:text-zinc-950 transition-colors">
                Verify Credential
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-2.5">
              {isAuthenticated ? (
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white text-[13px] font-medium rounded-lg h-9 px-4"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                  Open Workspace ({user?.role})
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="text-zinc-700 hover:text-zinc-950 text-[13px] font-medium h-9 px-3.5"
                  >
                    Sign in
                  </Button>
                  <Button
                    onClick={() => navigate('/onboard')}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white text-[13px] font-medium rounded-lg h-9 px-4"
                  >
                    Start Free Trial
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </>
              )}
            </div>

            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="p-2 rounded-lg text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-zinc-200 px-4 pt-3 pb-5 space-y-3">
            <nav className="flex flex-col space-y-1 text-sm font-medium text-zinc-700">
              <a
                href="#product"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  scrollToSection('product');
                }}
                className="px-3 py-2 rounded-lg hover:bg-zinc-50"
              >
                Product
              </a>
              <a
                href="#modules"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  scrollToSection('modules');
                }}
                className="px-3 py-2 rounded-lg hover:bg-zinc-50"
              >
                Modules
              </a>
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  scrollToSection('pricing');
                }}
                className="px-3 py-2 rounded-lg hover:bg-zinc-50"
              >
                Pricing
              </a>
              <Link to="/verify" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-zinc-50">
                Verify Credential
              </Link>
            </nav>
            <div className="pt-2 border-t border-zinc-100 flex flex-col gap-2">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/onboard');
                }}
                className="w-full justify-center bg-zinc-950 text-white hover:bg-zinc-800 text-sm font-medium rounded-lg h-9"
              >
                Start Free Trial
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full justify-center border-zinc-300 text-zinc-800 hover:bg-zinc-50 text-sm font-medium rounded-lg h-9"
              >
                Sign in
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero + Real Interactive Product Window */}
      <section id="product" className="pt-14 pb-16 md:pt-20 md:pb-24 border-b border-zinc-200/80 bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4">
            Cloud SaaS &amp; Windows Desktop · Multi-Tenant Institutional ERP
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-zinc-950 leading-[1.06]">
            University &amp; College ERP, built to run.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Admissions, CBCS academics, examinations, INR fee ledgers, attendance, and verifiable
            transcripts in one isolated workspace for every institution.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => navigate('/onboard')}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-sm rounded-lg h-11 px-6 shadow-sm"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 font-medium text-sm rounded-lg h-11 px-5"
            >
              Live ERP Sign In
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/admissions')}
              className="text-zinc-600 hover:text-zinc-950 font-medium text-sm rounded-lg h-11 px-4"
            >
              Admissions Portal →
            </Button>
          </div>
        </div>

        {/* Real Product App Frame */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          {/* Interactive Module Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            {SHOWCASE_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                    active
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:text-zinc-950 hover:border-zinc-300'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Browser / Desktop Window Chrome */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="h-10 bg-zinc-100/90 border-b border-zinc-200 px-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
              </div>
              <div className="text-[11px] font-mono text-zinc-500 bg-white border border-zinc-200 rounded px-3 py-0.5 truncate max-w-md">
                https://{currentTabMeta.route}
              </div>
              <Link
                to="/login"
                className="text-[11px] font-medium text-zinc-700 hover:text-zinc-950 hidden sm:inline"
              >
                Open Live App →
              </Link>
            </div>

            {/* Real Workspace Shell Preview */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[430px] text-left">
              {/* Left Sidebar (Mirrors Layout.tsx) */}
              <aside className="hidden md:flex md:col-span-3 border-r border-zinc-200 bg-white p-4 flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100">
                    <img src="/logo.jpg" alt="Institution" className="w-8 h-8 rounded-lg border border-zinc-200" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 truncate">Central University</div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">MAIN CAMPUS · 101</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Workspace
                    </div>
                    {[
                      ['overview', 'NAAC / NIRF Compliance'],
                      ['transcript', 'Transcripts & GPA'],
                      ['finance', 'Student Fee Ledger'],
                      ['attendance', 'Attendance Oversight'],
                    ].map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setActiveTab(id as ShowcaseTab)}
                        className={`w-full text-left px-2.5 py-2 rounded-md transition-colors cursor-pointer ${
                          activeTab === id
                            ? 'bg-zinc-900 text-white font-semibold'
                            : 'text-zinc-600 hover:bg-zinc-100'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t border-zinc-100 flex items-center gap-2 text-xs text-zinc-500">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-700 text-[10px]">
                    A
                  </div>
                  <span className="font-medium text-zinc-700">superadmin</span>
                </div>
              </aside>

              {/* Main View Area */}
              <div className="md:col-span-9 bg-slate-50/70 p-5 sm:p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                          Statutory Accreditation &amp; Rankings Engine
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">
                          NAAC &amp; NIRF Institutional Quality Hub
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          <Download className="w-3.5 h-3.5" /> Export SSR CSV
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-md bg-slate-900 text-white">
                          <Printer className="w-3.5 h-3.5" /> Print Report
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        ['Student-Faculty Ratio', '14.2 : 1', 'AICTE Compliant (≤ 15:1)', 'text-emerald-600'],
                        ['Projected NIRF Score', '84.3 / 100', 'Band: Rank 51–100', 'text-blue-600'],
                        ['Gender Diversity', '42.5%', 'Female Enrollment Ratio', 'text-slate-600'],
                        ['Fee Collection', '₹1,42,80,000', '91.4% Settled This Term', 'text-emerald-600'],
                      ].map(([label, val, sub, cls]) => (
                        <div key={label} className="bg-white border border-slate-200 rounded-xl p-3.5">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            {label}
                          </div>
                          <div className="text-xl font-bold text-slate-900 mt-1">{val}</div>
                          <div className={`text-[10px] font-medium mt-1 ${cls}`}>{sub}</div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="text-xs font-bold text-slate-800 mb-3">
                        Department-Wise University Exam Pass Percentages
                      </div>
                      <div className="space-y-2.5 text-xs">
                        {[
                          ['Computer Science & Engineering', '96.4%', 'w-[96%]'],
                          ['Information Technology', '94.1%', 'w-[94%]'],
                          ['Electronics & Communication', '92.8%', 'w-[93%]'],
                        ].map(([dept, pct, w]) => (
                          <div key={dept} className="space-y-1">
                            <div className="flex justify-between font-medium text-slate-700">
                              <span>{dept}</span>
                              <span className="font-mono font-bold text-emerald-700">{pct}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full bg-emerald-600 rounded-full ${w}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'transcript' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Official University Transcript</h3>
                        <p className="text-xs text-slate-500">
                          10-Point UGC CBCS Scale · Cryptographic SHA-256 Verification
                        </p>
                      </div>
                      <Link
                        to="/verify"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Try Live /verify
                      </Link>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wide text-slate-900">
                            Aarav Sharma · PRN: 23CSM001
                          </div>
                          <div className="text-[11px] text-slate-500">
                            B.Tech Computer Science &amp; Engineering (2024–2028)
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase font-semibold text-slate-500">Cumulative CGPA</div>
                          <div className="text-xl font-black text-slate-900">9.25 / 10.00</div>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                              <th className="text-left py-2 px-3 font-semibold">Code</th>
                              <th className="text-left py-2 px-3 font-semibold">Course Title</th>
                              <th className="text-right py-2 px-3 font-semibold">Credits</th>
                              <th className="text-right py-2 px-3 font-semibold">Marks</th>
                              <th className="text-right py-2 px-3 font-semibold">Grade</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {[
                              ['CS301', 'Advanced Distributed Systems', '4', '88 / 100', 'A+ (9.0)'],
                              ['CS302', 'Database Internals & Optimization', '4', '92 / 100', 'O (10.0)'],
                              ['CS303', 'Operating Systems Architecture', '4', '86 / 100', 'A (8.5)'],
                            ].map(([code, title, cr, marks, grade]) => (
                              <tr key={code}>
                                <td className="py-2 px-3 font-mono font-semibold text-slate-900">{code}</td>
                                <td className="py-2 px-3 text-slate-700">{title}</td>
                                <td className="py-2 px-3 text-right">{cr}</td>
                                <td className="py-2 px-3 text-right font-mono">{marks}</td>
                                <td className="py-2 px-3 text-right font-bold text-emerald-700">{grade}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="pt-2 border-t border-dashed border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-mono">SEAL: EDP-VRF-23CSM001-8594641E</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Tamper-Evident Ledger
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'finance' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">Student Fee Ledger (INR)</h3>
                        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          RAZORPAY SYNCED
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100 text-xs">
                        {[
                          ['INV-2026-1042', 'Semester V Tuition & Lab', '₹68,500.00', 'PAID'],
                          ['INV-2026-1088', 'Hostel & Mess Term Fee', '₹32,000.00', 'PAID'],
                          ['INV-2026-1120', 'University Exam Registration', '₹3,500.00', 'PENDING'],
                        ].map(([inv, desc, amt, status]) => (
                          <div key={inv} className="py-2.5 flex items-center justify-between gap-2">
                            <div>
                              <div className="font-mono font-semibold text-slate-900">{inv}</div>
                              <div className="text-[11px] text-slate-500">{desc}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-slate-900">{amt}</div>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  status === 'PAID'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actual 80mm POS Thermal Receipt Preview */}
                    <div className="lg:col-span-5 bg-white border border-slate-300 rounded-lg p-4 font-mono text-[11px] text-slate-900 shadow-sm">
                      <div className="text-center border-b border-dashed border-slate-400 pb-2">
                        <div className="font-bold uppercase">CENTRAL UNIVERSITY SYSTEM</div>
                        <div className="text-[9px] text-slate-500">80mm Cashier Fee Voucher</div>
                      </div>
                      <div className="py-2 space-y-1 border-b border-dashed border-slate-400 text-[10px]">
                        <div className="flex justify-between">
                          <span>Receipt #:</span>
                          <span className="font-bold">INV-2026-1042</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Student:</span>
                          <span>Aarav Sharma (23CSM001)</span>
                        </div>
                      </div>
                      <div className="py-2 space-y-1 border-b border-slate-900 text-[10px]">
                        <div className="flex justify-between">
                          <span>Academic Tuition Fee</span>
                          <span>51,375.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Exam &amp; Lab Cess</span>
                          <span>17,125.00</span>
                        </div>
                      </div>
                      <div className="pt-2 flex justify-between font-bold text-xs">
                        <span>TOTAL PAID (INR):</span>
                        <span>₹68,500.00</span>
                      </div>
                      <div className="mt-2 text-[9px] text-emerald-700 font-bold text-center">
                        ✓ PAYMENT CLEARED &amp; AUDITED
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'attendance' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          UGC 75% Attendance Oversight
                        </h3>
                        <p className="text-xs text-slate-500">
                          CS301 · Section A · Automatic parent absence alerts via WhatsApp &amp; SMS
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Minimum Threshold: 75%
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                          <tr>
                            <th className="text-left py-2.5 px-4 font-semibold">Enrollment</th>
                            <th className="text-left py-2.5 px-4 font-semibold">Student</th>
                            <th className="text-right py-2.5 px-4 font-semibold">Cumulative</th>
                            <th className="text-right py-2.5 px-4 font-semibold">UGC Standing</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {[
                            ['23CSM001', 'Aarav Sharma', '92.0%', 'Cleared', 'bg-emerald-100 text-emerald-800'],
                            ['23CSM014', 'Priya Nair', '81.5%', 'Cleared', 'bg-emerald-100 text-emerald-800'],
                            ['23CSM029', 'Rohan Verma', '68.0%', 'Debarment Risk', 'bg-rose-100 text-rose-800'],
                          ].map(([id, name, pct, status, badge]) => (
                            <tr key={id}>
                              <td className="py-2.5 px-4 font-mono font-semibold">{id}</td>
                              <td className="py-2.5 px-4 text-slate-800">{name}</td>
                              <td className="py-2.5 px-4 text-right font-mono font-bold">{pct}</td>
                              <td className="py-2.5 px-4 text-right">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge}`}>
                                  {status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Major ERP Capabilities (Crisp 6-Tile Grid) */}
      <section id="modules" className="py-16 md:py-24 bg-white border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
              Core ERP Modules
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950">
              Everything required to run an institution.
            </h2>
            <p className="mt-3 text-base text-zinc-600">
              Built around Indian and international higher-education workflows—with zero bolted-on tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_PILLARS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 mb-4">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-950">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Pricing */}
      <section id="pricing" className="py-16 md:py-24 bg-[#FAFAFA] border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Pricing />
        </div>
      </section>

      {/* 5. Direct Enterprise CTA */}
      <section className="py-16 md:py-20 bg-zinc-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Launch your campus workspace today.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
            Create an isolated tenant workspace in minutes, upload your institution crest, and invite your
            staff and students.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => navigate('/onboard')}
              className="bg-white text-zinc-950 hover:bg-zinc-100 font-semibold text-sm rounded-lg h-11 px-6"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/register')}
              className="border-zinc-700 text-zinc-200 hover:bg-zinc-900 hover:text-white font-medium text-sm rounded-lg h-11 px-5 bg-transparent"
            >
              Register Institution
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> PostgreSQL RLS Isolation
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SHA-256 Transcript Verification
            </span>
          </div>
        </div>
      </section>

      {/* 6. Clean Footer */}
      <footer className="bg-white border-t border-zinc-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-zinc-200/80">
            <div className="col-span-2 md:col-span-1 space-y-2.5">
              <div className="flex items-center gap-2">
                <img src="/logo.jpg" alt="EduPulse" className="w-7 h-7 rounded-md border border-zinc-200" />
                <span className="font-bold text-sm text-zinc-950">EduPulse ERP</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Multi-tenant institutional ERP for universities and colleges.
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold text-zinc-950 uppercase tracking-wider mb-3">Product</div>
              <ul className="space-y-2 text-xs text-zinc-600">
                <li><a href="#product" onClick={(e) => { e.preventDefault(); scrollToSection('product'); }} className="hover:text-zinc-950">Interactive Preview</a></li>
                <li><a href="#modules" onClick={(e) => { e.preventDefault(); scrollToSection('modules'); }} className="hover:text-zinc-950">Core Modules</a></li>
                <li><a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }} className="hover:text-zinc-950">Pricing</a></li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold text-zinc-950 uppercase tracking-wider mb-3">Portals</div>
              <ul className="space-y-2 text-xs text-zinc-600">
                <li><Link to="/login" className="hover:text-zinc-950">ERP Sign In</Link></li>
                <li><Link to="/admissions" className="hover:text-zinc-950">Public Admissions</Link></li>
                <li><Link to="/register" className="hover:text-zinc-950">Register Institution</Link></li>
                <li><Link to="/onboard" className="hover:text-zinc-950">Workspace Onboarding</Link></li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold text-zinc-950 uppercase tracking-wider mb-3">Trust</div>
              <ul className="space-y-2 text-xs text-zinc-600">
                <li>
                  <Link to="/verify" className="hover:text-zinc-950 inline-flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Verify Credential
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
            <span>&copy; {new Date().getFullYear()} EduPulse ERP Technologies.</span>
            <span>edupulseerp.in · Cloud SaaS &amp; Desktop Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
