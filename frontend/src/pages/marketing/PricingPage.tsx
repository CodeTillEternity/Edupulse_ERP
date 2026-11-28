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
      <section className="pt-16 pb-14 sm:pt-24 sm:pb-16 border-b border-zinc-800">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">
            Pricing
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-[-0.035em] text-white max-w-3xl">
            Transparent institutional pricing in INR
          </h1>
          <p className="mt-5 text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Every institution starts with a 14-day full-featured trial. Commercial
            plans are billed in INR and tailored to your institution&apos;s
            student strength and campus structure.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid md:grid-cols-3 border border-zinc-800 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`p-8 sm:p-9 flex flex-col justify-between ${
                  tier.highlight ? 'bg-zinc-900/60' : 'bg-transparent'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h2 className="text-xl font-medium text-white">
                      {tier.name}
                    </h2>
                    {tier.highlight && (
                      <span className="px-2 py-0.5 rounded text-xs font-mono uppercase tracking-wider border border-zinc-700 text-white">
                        Most popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-zinc-400 mb-6">
                    {tier.audience}
                  </p>
                  <div className="mb-6 pb-6 border-b border-zinc-800">
                    <span className="text-2xl font-medium text-white">
                      Custom INR quote
                    </span>
                    <p className="text-sm text-zinc-500 mt-1">
                      Based on active student count &amp; modules
                    </p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-300"
                      >
                        <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <Link
                    to="/start-trial"
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm sm:text-base font-medium transition-colors ${
                      tier.highlight
                        ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                        : 'bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    Start 14-day trial
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href={`mailto:contact@edupulseerp.in?subject=${encodeURIComponent(
                      `EduPulse ${tier.name} Plan Enquiry`
                    )}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-white transition-colors"
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
