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
      <section className="pt-16 pb-14 sm:pt-24 sm:pb-16 bg-gray-950/70 border-b border-gray-800">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <p className="text-sm font-medium text-indigo-300 uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white max-w-3xl mx-auto">
            Transparent institutional pricing in INR
          </h1>
          <p className="mt-5 text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
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
                className={`rounded-2xl border p-7 flex flex-col justify-between ${
                  tier.highlight
                    ? 'border-indigo-400/70 bg-gray-950 ring-1 ring-indigo-400/20 shadow-lg'
                    : 'border-gray-800 bg-gray-950/60 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h2 className="text-lg font-semibold text-white">
                      {tier.name}
                    </h2>
                    {tier.highlight && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500 text-white">
                        Most popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 mb-6">
                    {tier.audience}
                  </p>
                  <div className="mb-6 pb-6 border-b border-gray-800">
                    <span className="text-2xl font-semibold text-white">
                      Custom INR quote
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      Based on active student count & modules
                    </p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2.5 text-sm text-gray-300"
                      >
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <Link
                    to="/start-trial"
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      tier.highlight
                        ? 'bg-white text-gray-950 hover:bg-gray-200'
                        : 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    Start 14-day trial
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href={`mailto:contact@edupulseerp.in?subject=${encodeURIComponent(
                      `EduPulse ${tier.name} Plan Enquiry`
                    )}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors"
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
