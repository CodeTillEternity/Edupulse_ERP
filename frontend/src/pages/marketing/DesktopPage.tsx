import { Link } from 'react-router-dom';
import { Monitor, Clock, ArrowRight, Check } from 'lucide-react';
import MarketingLayout from '../../components/marketing/MarketingLayout';

export default function DesktopPage() {
  return (
    <MarketingLayout>
      <section className="pt-16 pb-14 sm:pt-24 sm:pb-16 border-b border-zinc-800">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>Pre-release · Windows Desktop</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-[-0.035em] text-white max-w-2xl">
            EduPulse Desktop for Windows
          </h1>
          <p className="mt-5 text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Our native Windows Desktop client is currently in pre-release
            hardening and is not yet available for public download. Institutions
            can use the full EduPulse web application today.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="border border-zinc-800 bg-zinc-950/60 p-8 sm:p-12">
            <div className="flex items-center gap-2.5 mb-3">
              <Monitor className="w-5 h-5 text-zinc-400" />
              <h2 className="text-2xl sm:text-3xl font-medium text-white">
                Release readiness status
              </h2>
            </div>
            <p className="text-base text-zinc-400 leading-relaxed mb-6 max-w-3xl">
              Before publishing a public Windows installer, we are completing
              code signing, signed auto-updates, and production runtime
              packaging so institutional IT teams can deploy it safely.
            </p>
            <ul className="space-y-3 mb-8 border-t border-zinc-800 pt-6">
              {[
                'Full ERP functionality is available immediately via the web app',
                'Windows installer distribution is currently limited to pilot enquiries',
                'Public signed installer and SHA-256 verification will be announced upon release',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-base text-zinc-300"
                >
                  <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/start-trial"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-white text-zinc-950 text-sm sm:text-base font-medium hover:bg-zinc-200 transition-colors"
              >
                Start 14-day web trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:contact@edupulseerp.in?subject=Windows%20Desktop%20Pilot%20Enquiry"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-zinc-900 text-white border border-zinc-800 text-sm sm:text-base font-medium hover:bg-zinc-800 transition-colors"
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
