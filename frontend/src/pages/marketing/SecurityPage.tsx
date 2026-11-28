import { Link } from 'react-router-dom';
import { Shield, Lock, FileCheck2, Database, ArrowRight } from 'lucide-react';
import MarketingLayout from '../../components/marketing/MarketingLayout';
import { Reveal, StaggerGrid, StaggerItem } from '../../components/marketing/MotionPrimitives';

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
      <section className="pt-16 pb-14 sm:pt-24 sm:pb-16 border-b border-zinc-800">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">
            Security &amp; Architecture
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-[-0.035em] text-white max-w-3xl">
            Built for institutional data isolation and accountability.
          </h1>
          <p className="mt-5 text-lg text-zinc-400 max-w-2xl leading-relaxed">
            EduPulse separates every school and college at the database and
            application layers while giving administrators clear visibility and
            ownership of their records.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
          <StaggerGrid className="grid sm:grid-cols-2 border-t border-l border-zinc-800">
            {SECURITY_PILLARS.map((pillar) => (
              <StaggerItem
                key={pillar.title}
                className="group border-r border-b border-zinc-800 p-8 sm:p-10 hover:bg-zinc-900/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <pillar.icon className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:scale-110 transition-all shrink-0" />
                  <h2 className="text-xl font-medium text-white">
                    {pillar.title}
                  </h2>
                </div>
                <p className="text-base text-zinc-400 leading-relaxed">
                  {pillar.body}
                </p>
              </StaggerItem>
            ))}
          </StaggerGrid>

          <Reveal delay={0.1}>
            <div className="mt-10 border border-zinc-800 bg-zinc-950/60 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-medium text-white mb-1.5">
                Need architectural details for your IT committee?
              </h3>
              <p className="text-base text-zinc-400">
                Reach out to our team for deployment documentation or a guided walkthrough.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-white text-zinc-950 text-sm sm:text-base font-medium hover:bg-zinc-200 transition-colors shrink-0"
            >
              Contact team
              <ArrowRight className="w-4 h-4" />
            </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </MarketingLayout>
  );
}
