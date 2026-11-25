import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/button';
import { Pricing } from '../components/marketing/Pricing';
import { HeroProductComposition } from '../components/marketing/HeroProductComposition';
import { RoleBasedProductTour } from '../components/marketing/RoleBasedProductTour';
import { InteractiveWorkflows } from '../components/marketing/InteractiveWorkflows';
import { ERPDomainsBlueprint } from '../components/marketing/ERPDomainsBlueprint';
import { ArchitectureExplorer } from '../components/marketing/ArchitectureExplorer';
import { ExamSecurityExplanation } from '../components/marketing/ExamSecurityExplanation';
import { IntegrationShowcase } from '../components/marketing/IntegrationShowcase';
import { CampusTransportFleetDemo } from '../components/marketing/CampusTransportFleetDemo';
import { InstitutionalCapabilitiesWorkbench } from '../components/marketing/InstitutionalCapabilitiesWorkbench';
import {
  ArrowRight,
  Menu,
  X,
  UserCheck,
  ShieldCheck,
  Building2,
  CheckCircle2,
  FileCheck2,
  Globe,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans antialiased selection:bg-zinc-900 selection:text-white">
      {/* 1. Sticky Enterprise Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/logo.jpg"
                alt="EduPulse Logo"
                className="h-8 w-8 rounded-lg object-cover border border-zinc-200"
              />
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-zinc-950">EduPulse</span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  ERP
                </span>
              </div>
            </Link>

            {/* Primary Nav (Clean 5-item bar) */}
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
                href="#workflows"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('workflows');
                }}
                className="hover:text-zinc-950 transition-colors"
              >
                Workflows
              </a>
              <a
                href="#integrations"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('integrations');
                }}
                className="hover:text-zinc-950 transition-colors"
              >
                Integrations
              </a>
              <a
                href="#security"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('security');
                }}
                className="hover:text-zinc-950 transition-colors"
              >
                Security
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
            </nav>

            {/* Header Actions */}
            <div className="hidden md:flex items-center gap-2.5">
              <Button
                variant="ghost"
                onClick={() => navigate('/verify')}
                className="text-zinc-600 hover:text-zinc-950 text-[13px] font-medium h-9 px-3"
              >
                Verify Credential
              </Button>
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
                    variant="outline"
                    onClick={() => navigate('/login')}
                    className="border-zinc-300 text-zinc-800 hover:bg-zinc-50 text-[13px] font-medium rounded-lg h-9 px-3.5"
                  >
                    Sign in
                  </Button>
                  <Button
                    onClick={() => navigate('/onboard')}
                    className="bg-zinc-950 hover:bg-zinc-800 text-white text-[13px] font-medium rounded-lg h-9 px-4"
                  >
                    Start free trial
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
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

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-zinc-200 px-4 pt-3 pb-5 space-y-3">
            <nav className="flex flex-col space-y-1 text-sm font-medium text-zinc-700">
              {[
                ['Product', 'product'],
                ['Workflows', 'workflows'],
                ['Integrations', 'integrations'],
                ['Security', 'security'],
                ['Pricing', 'pricing'],
              ].map(([label, id]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    scrollToSection(id);
                  }}
                  className="px-3 py-2 rounded-lg hover:bg-zinc-50"
                >
                  {label}
                </a>
              ))}
              <Link
                to="/verify"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-zinc-50"
              >
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
                Start free trial
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

      {/* 2. Product Hero */}
      <section className="pt-16 pb-14 md:pt-24 md:pb-20 border-b border-zinc-200/80 bg-gradient-to-b from-zinc-50/70 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-700 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Multi-Tenant Cloud SaaS & Windows Desktop · UGC CBCS & NAAC Ready</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-950 leading-[1.08]">
            The operating system for modern universities and colleges.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Run admissions, CBCS academics, examinations, INR fee ledgers, attendance, HR payroll, and
            cryptographically verifiable transcripts from a single multi-tenant workspace.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => navigate('/onboard')}
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-sm rounded-lg h-11 px-6 shadow-sm"
            >
              Provision Institution Workspace
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-zinc-300 text-zinc-800 hover:bg-zinc-50 font-medium text-sm rounded-lg h-11 px-5"
            >
              Sign in to ERP
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/admissions')}
              className="text-zinc-600 hover:text-zinc-950 font-medium text-sm rounded-lg h-11 px-4"
            >
              Public Admissions Portal →
            </Button>
          </div>

          {/* Grounded Platform Facts Strip */}
          <div className="mt-10 pt-8 border-t border-zinc-200/70 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left max-w-4xl mx-auto">
            {[
              ['PostgreSQL RLS', 'Row-level tenant isolation across every campus'],
              ['5 Role Portals', 'Admin, Faculty, Student, Parent & Finance'],
              ['80mm POS & INR ₹', 'Thermal fee receipts & automated Razorpay ledgers'],
              ['SHA-256 Transcripts', 'QR-verifiable official CBCS mark sheets'],
            ].map(([title, desc]) => (
              <div key={title}>
                <div className="text-xs font-semibold text-zinc-950">{title}</div>
                <div className="text-xs text-zinc-500 mt-0.5 leading-snug">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Hero Product Composition */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <HeroProductComposition />
        </div>
      </section>

      {/* 3. Role-Based Product Tour */}
      <section id="product" className="py-16 md:py-24 bg-[#FAFAFA] border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
              Unified Role Workspaces
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950">
              One source of truth across every campus desk.
            </h2>
            <p className="mt-3 text-base text-zinc-600">
              Every stakeholder signs into a tailored workspace backed by the same real-time academic and
              financial ledger.
            </p>
          </div>
          <RoleBasedProductTour />
        </div>
      </section>

      {/* 4. Core Capabilities Workbench & 23-Domain Blueprint */}
      <section className="py-16 md:py-24 bg-white border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          <InstitutionalCapabilitiesWorkbench />
          <ERPDomainsBlueprint />
        </div>
      </section>

      {/* 5. End-to-End Lifecycle Workflows */}
      <section id="workflows" className="py-16 md:py-24 bg-[#FAFAFA] border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InteractiveWorkflows />
        </div>
      </section>

      {/* 6. Integrations & Campus Operations */}
      <section id="integrations" className="py-16 md:py-24 bg-white border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          <IntegrationShowcase />
          <CampusTransportFleetDemo />
        </div>
      </section>

      {/* 7. Multi-Tenant Security, Compliance & Exam Integrity */}
      <section id="security" className="py-16 md:py-24 bg-[#FAFAFA] border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          <ArchitectureExplorer />
          <ExamSecurityExplanation />
        </div>
      </section>

      {/* 8. Pricing */}
      <section id="pricing" className="py-16 md:py-24 bg-white border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Pricing />
        </div>
      </section>

      {/* 9. Final Enterprise CTA */}
      <section className="py-16 md:py-20 bg-zinc-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to launch your institution on EduPulse?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
            Provision an isolated multi-tenant workspace in minutes, configure your crest and branding, and
            invite administrators, faculty, and students.
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
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Dedicated Tenant Isolation
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Immutable Audit Trail
            </span>
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> NAAC / NIRF Compliance Exports
            </span>
          </div>
        </div>
      </section>

      {/* 10. Clean Enterprise Footer */}
      <footer className="bg-white border-t border-zinc-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-200/80">
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <img src="/logo.jpg" alt="EduPulse" className="w-7 h-7 rounded-md border border-zinc-200" />
                <span className="font-bold text-sm text-zinc-950">EduPulse ERP</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
                Unified multi-tenant institutional management platform for universities, engineering colleges,
                and autonomous campuses.
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold text-zinc-950 uppercase tracking-wider mb-3">Platform</div>
              <ul className="space-y-2 text-xs text-zinc-600">
                <li><a href="#product" onClick={(e) => { e.preventDefault(); scrollToSection('product'); }} className="hover:text-zinc-950">Product Tour</a></li>
                <li><a href="#workflows" onClick={(e) => { e.preventDefault(); scrollToSection('workflows'); }} className="hover:text-zinc-950">Academic & Fee Workflows</a></li>
                <li><a href="#integrations" onClick={(e) => { e.preventDefault(); scrollToSection('integrations'); }} className="hover:text-zinc-950">Integrations</a></li>
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
              <div className="text-xs font-semibold text-zinc-950 uppercase tracking-wider mb-3">Trust & Verification</div>
              <ul className="space-y-2 text-xs text-zinc-600">
                <li>
                  <Link to="/verify" className="hover:text-zinc-950 inline-flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Public Credential Verification
                  </Link>
                </li>
                <li><a href="#security" onClick={(e) => { e.preventDefault(); scrollToSection('security'); }} className="hover:text-zinc-950 inline-flex items-center gap-1"><Building2 className="w-3 h-3" /> Multi-Tenant Security</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
            <span>&copy; {new Date().getFullYear()} EduPulse ERP Technologies. All rights reserved.</span>
            <span>edupulseerp.in · Cloud SaaS & Desktop Edition</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
