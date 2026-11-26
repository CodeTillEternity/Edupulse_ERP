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
      <section className="pt-16 pb-14 sm:pt-24 sm:pb-16 bg-gray-950/70 border-b border-gray-800">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <p className="text-sm font-medium text-indigo-300 uppercase tracking-wider mb-3">
            Security & Architecture
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white max-w-3xl mx-auto">
            Built for institutional data isolation and accountability.
          </h1>
          <p className="mt-5 text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
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
                className="rounded-2xl border border-gray-800 bg-gray-950/60 p-8"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center mb-5">
                  <pillar.icon className="w-6 h-6 text-indigo-300" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2.5">
                  {pillar.title}
                </h2>
                <p className="text-base text-gray-300 leading-relaxed">
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-gray-800 bg-gray-950/70 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-1.5">
                Need architectural details for your IT committee?
              </h3>
              <p className="text-base text-gray-300">
                Reach out to our team for deployment documentation or a guided walkthrough.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-gray-950 text-base font-medium hover:bg-gray-200 transition-colors shrink-0"
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
