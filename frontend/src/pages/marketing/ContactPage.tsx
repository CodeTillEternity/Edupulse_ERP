import { Link } from 'react-router-dom';
import { Mail, ArrowRight, PlayCircle } from 'lucide-react';
import MarketingLayout from '../../components/marketing/MarketingLayout';

export default function ContactPage() {
  return (
    <MarketingLayout>
      <section className="relative pt-16 pb-14 sm:pt-24 sm:pb-16 bg-[#0C0D12] border-b border-white/[0.07] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(99,102,241,0.14),transparent)]" />
        <div className="relative max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-indigo-400 mb-3">
            Contact
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] text-white max-w-2xl mx-auto">
            Talk with the EduPulse team
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Questions about institutional onboarding, INR pricing, or data
            migration? Write to us directly or start a 14-day trial environment.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 grid sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 ring-1 ring-inset ring-indigo-400/25 flex items-center justify-center mb-5">
                <Mail className="w-6 h-6 text-indigo-300" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2.5">
                Sales &amp; Onboarding Enquiries
              </h2>
              <p className="text-base text-zinc-400 leading-relaxed mb-6">
                Share your institution name, approximate student strength, and
                the modules you are evaluating.
              </p>
            </div>
            <a
              href="mailto:contact@edupulseerp.in?subject=EduPulse%20Institutional%20Enquiry"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white text-zinc-950 text-base font-medium hover:bg-zinc-200 transition-colors"
            >
              contact@edupulseerp.in
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 ring-1 ring-inset ring-emerald-400/25 flex items-center justify-center mb-5">
                <PlayCircle className="w-6 h-6 text-emerald-300" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2.5">
                Evaluate on your own
              </h2>
              <p className="text-base text-zinc-400 leading-relaxed mb-6">
                Provision an isolated 14-day trial workspace for your school or
                college in seconds and explore the live ERP modules.
              </p>
            </div>
            <Link
              to="/start-trial"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white/[0.06] text-white border border-white/[0.1] text-base font-medium hover:bg-white/[0.1] transition-colors"
            >
              Start 14-day trial
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
