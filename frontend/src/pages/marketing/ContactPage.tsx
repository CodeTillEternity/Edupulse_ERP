import { Link } from 'react-router-dom';
import { Mail, ArrowRight, PlayCircle } from 'lucide-react';
import MarketingLayout from '../../components/marketing/MarketingLayout';

export default function ContactPage() {
  return (
    <MarketingLayout>
      <section className="pt-16 pb-14 sm:pt-24 sm:pb-16 bg-gray-950/70 border-b border-gray-800">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <p className="text-sm font-medium text-indigo-300 uppercase tracking-wider mb-3">
            Contact
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white max-w-2xl mx-auto">
            Talk with the EduPulse team
          </h1>
          <p className="mt-5 text-lg text-gray-300 max-w-xl mx-auto leading-relaxed">
            Questions about institutional onboarding, INR pricing, or data
            migration? Write to us directly or start a 14-day trial environment.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 grid sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center mb-5">
                <Mail className="w-6 h-6 text-indigo-300" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2.5">
                Sales & Onboarding Enquiries
              </h2>
              <p className="text-base text-gray-300 leading-relaxed mb-6">
                Share your institution name, approximate student strength, and
                the modules you are evaluating.
              </p>
            </div>
            <a
              href="mailto:contact@edupulseerp.in?subject=EduPulse%20Institutional%20Enquiry"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white text-gray-950 text-base font-medium hover:bg-gray-200 transition-colors"
            >
              contact@edupulseerp.in
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-5">
                <PlayCircle className="w-6 h-6 text-emerald-300" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2.5">
                Evaluate on your own
              </h2>
              <p className="text-base text-gray-300 leading-relaxed mb-6">
                Provision an isolated 14-day trial workspace for your school or
                college in seconds and explore the live ERP modules.
              </p>
            </div>
            <Link
              to="/start-trial"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-gray-800 text-white border border-gray-700 text-base font-medium hover:bg-gray-700 transition-colors"
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
