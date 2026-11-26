import { Link } from 'react-router-dom';
import { Monitor, Clock, ArrowRight, Check } from 'lucide-react';
import MarketingLayout from '../../components/marketing/MarketingLayout';

export default function DesktopPage() {
  return (
    <MarketingLayout>
      <section className="pt-16 pb-14 sm:pt-24 sm:pb-16 bg-gray-950/70 border-b border-gray-800">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 mb-4">
            <Clock className="w-3.5 h-3.5" />
            Pre-release · Windows Desktop
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white max-w-2xl mx-auto">
            EduPulse Desktop for Windows
          </h1>
          <p className="mt-5 text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Our native Windows Desktop client is currently in pre-release
            hardening and is not yet available for public download. Institutions
            can use the full EduPulse web application today.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="rounded-2xl border border-gray-800 bg-gray-950/60 p-8 sm:p-12">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center mb-5">
              <Monitor className="w-6 h-6 text-indigo-300" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3">
              Release readiness status
            </h2>
            <p className="text-base text-gray-300 leading-relaxed mb-6 max-w-3xl">
              Before publishing a public Windows installer, we are completing
              code signing, signed auto-updates, and production runtime
              packaging so institutional IT teams can deploy it safely.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Full ERP functionality is available immediately via the web app',
                'Windows installer distribution is currently limited to pilot enquiries',
                'Public signed installer and SHA-256 verification will be announced upon release',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-base text-gray-300"
                >
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/start-trial"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-gray-950 text-base font-medium hover:bg-gray-200 transition-colors"
              >
                Start 14-day web trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:contact@edupulseerp.in?subject=Windows%20Desktop%20Pilot%20Enquiry"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 text-base font-medium hover:bg-gray-700 transition-colors"
              >
                Enquire about desktop pilot
              </a>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
