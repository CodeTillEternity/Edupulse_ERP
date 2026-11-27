import { Link } from 'react-router-dom';
import { Mail, ArrowRight, PlayCircle } from 'lucide-react';
import MarketingLayout from '../../components/marketing/MarketingLayout';

export default function ContactPage() {
  return (
    <MarketingLayout>
      <section className="pt-16 pb-14 sm:pt-24 sm:pb-16 border-b border-zinc-800">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">
            Contact
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-[-0.035em] text-white max-w-2xl">
            Talk with the EduPulse team
          </h1>
          <p className="mt-5 text-lg text-zinc-400 max-w-xl leading-relaxed">
            Questions about institutional onboarding, INR pricing, or data
            migration? Write to us directly or start a 14-day trial environment.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 grid sm:grid-cols-2 border-t border-l border-zinc-800">
          <div className="border-r border-b border-zinc-800 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <Mail className="w-4 h-4 text-zinc-400" />
                <h2 className="text-2xl font-medium text-white">
                  Sales &amp; Onboarding Enquiries
                </h2>
              </div>
              <p className="text-base text-zinc-400 leading-relaxed mb-8">
                Share your institution name, approximate student strength, and
                the modules you are evaluating.
              </p>
            </div>
            <a
              href="mailto:contact@edupulseerp.in?subject=EduPulse%20Institutional%20Enquiry"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-white text-zinc-950 text-sm sm:text-base font-medium hover:bg-zinc-200 transition-colors"
            >
              contact@edupulseerp.in
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="border-r border-b border-zinc-800 p-8 sm:p-10 flex flex-col justify-between bg-zinc-950/60">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <PlayCircle className="w-4 h-4 text-zinc-400" />
                <h2 className="text-2xl font-medium text-white">
                  Evaluate on your own
                </h2>
              </div>
              <p className="text-base text-zinc-400 leading-relaxed mb-8">
                Provision an isolated 14-day trial workspace for your school or
                college in seconds and explore the live ERP modules.
              </p>
            </div>
            <Link
              to="/start-trial"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-zinc-900 text-white border border-zinc-800 text-sm sm:text-base font-medium hover:bg-zinc-800 transition-colors"
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
