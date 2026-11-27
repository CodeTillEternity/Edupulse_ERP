import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import MarketingLayout from '../../components/marketing/MarketingLayout';

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

export default function PricingPage() {
  return (
    <MarketingLayout>
      <section className="relative pt-16 pb-14 sm:pt-24 sm:pb-16 bg-[#0C0D12] border-b border-white/[0.07] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(99,102,241,0.14),transparent)]" />
        <div className="relative max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-indigo-400 mb-3">
            Pricing
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] text-white max-w-3xl mx-auto">
            Transparent institutional pricing in INR
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Every institution starts with a 14-day full-featured trial. Commercial
            plans are billed in INR and tailored to your institution&apos;s
            student strength and campus structure.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative overflow-hidden rounded-2xl border p-8 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${
                  tier.highlight
                    ? 'border-indigo-400/60 bg-gradient-to-b from-indigo-500/[0.1] to-white/[0.02] ring-1 ring-indigo-400/25 shadow-[0_24px_60px_-20px_rgba(99,102,241,0.35)]'
                    : 'border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] hover:border-white/[0.16]'
                }`}
              >
                {tier.highlight && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                )}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h2 className="text-xl font-semibold text-white">
                      {tier.name}
                    </h2>
                    {tier.highlight && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono uppercase tracking-wider bg-indigo-500 text-white">
                        Most popular
                      </span>
                    )}
                  </div>
                  <p className="text-base text-zinc-400 mb-6">
                    {tier.audience}
                  </p>
                  <div className="mb-6 pb-6 border-b border-white/[0.08]">
                    <span className="text-2xl font-semibold text-white">
                      Custom INR quote
                    </span>
                    <p className="text-sm text-zinc-400 mt-1">
                      Based on active student count &amp; modules
                    </p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2.5 text-base text-zinc-300"
                      >
                        <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <Link
                    to="/start-trial"
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      tier.highlight
                        ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                        : 'bg-white/[0.06] text-white border border-white/[0.1] hover:bg-white/[0.12]'
                    }`}
                  >
                    Start 14-day trial
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href={`mailto:contact@edupulseerp.in?subject=${encodeURIComponent(
                      `EduPulse ${tier.name} Plan Enquiry`
                    )}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Request INR quote
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
