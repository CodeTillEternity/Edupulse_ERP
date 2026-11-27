import { Link } from 'react-router-dom';
import { Shield, Lock, FileCheck2, Database, ArrowRight } from 'lucide-react';
import MarketingLayout from '../../components/marketing/MarketingLayout';

const SECURITY_PILLARS = [
  {
    icon: Shield,
    title: 'PostgreSQL Row-Level Security (RLS)',
    body: 'Each institution runs within a logical tenant boundary enforced at the database layer. Queries are scoped to the authenticated institution context so records are never mixed across tenants.',
  },
  {
    icon: Lock,
    title: 'Role-Based Access Control (RBAC)',
    body: 'Separate permissions for Institution Administrators, Faculty, Finance Managers, Librarians, Transport Managers, and Students ensure staff only view and act on authorized modules.',
  },
  {
    icon: FileCheck2,
    title: 'Administrative Audit Trails',
    body: 'Sensitive operations across admissions, fee adjustments, and user administration are recorded with actor and timestamp metadata for internal institutional review.',
  },
  {
    icon: Database,
    title: 'Full Institutional Data Ownership',
    body: 'Your student, academic, and ledger records belong to your institution. Export your data at any time without proprietary format lock-in.',
  },
];

export default function SecurityPage() {
  return (
    <MarketingLayout>
      <section className="relative pt-16 pb-14 sm:pt-24 sm:pb-16 bg-[#0C0D12] border-b border-white/[0.07] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(99,102,241,0.14),transparent)]" />
        <div className="relative max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-indigo-400 mb-3">
            Security &amp; Architecture
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] text-white max-w-3xl mx-auto">
            Built for institutional data isolation and accountability.
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            EduPulse separates every school and college at the database and
            application layers while giving administrators clear visibility and
            ownership of their records.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid sm:grid-cols-2 gap-6">
            {SECURITY_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-8 hover:border-white/[0.16] transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/15 ring-1 ring-inset ring-indigo-400/25 flex items-center justify-center mb-5">
                  <pillar.icon className="w-6 h-6 text-indigo-300" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2.5">
                  {pillar.title}
                </h2>
                <p className="text-base text-zinc-400 leading-relaxed">
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-white/[0.08] bg-[#0C0D12] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1.5">
                Need architectural details for your IT committee?
              </h3>
              <p className="text-base text-zinc-400">
                Reach out to our team for deployment documentation or a guided walkthrough.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-zinc-950 text-base font-medium hover:bg-zinc-200 transition-colors shrink-0"
            >
              Contact team
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
