import { Link } from 'react-router-dom';
import { Monitor, Clock, ArrowRight, Check } from 'lucide-react';
import MarketingLayout from '../../components/marketing/MarketingLayout';

export default function DesktopPage() {
  return (
    <MarketingLayout>
      <section className="relative pt-16 pb-14 sm:pt-24 sm:pb-16 bg-[#0C0D12] border-b border-white/[0.07] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(99,102,241,0.14),transparent)]" />
        <div className="relative max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-400/25 mb-4">
            <Clock className="w-3.5 h-3.5" />
            Pre-release · Windows Desktop
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.03em] text-white max-w-2xl mx-auto">
            EduPulse Desktop for Windows
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Our native Windows Desktop client is currently in pre-release
            hardening and is not yet available for public download. Institutions
            can use the full EduPulse web application today.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-8 sm:p-12">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 ring-1 ring-inset ring-indigo-400/25 flex items-center justify-center mb-5">
              <Monitor className="w-6 h-6 text-indigo-300" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3">
              Release readiness status
            </h2>
            <p className="text-base text-zinc-400 leading-relaxed mb-6 max-w-3xl">
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
                  className="flex items-start gap-2.5 text-base text-zinc-300"
                >
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/start-trial"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-zinc-950 text-base font-medium hover:bg-zinc-200 transition-colors"
              >
                Start 14-day web trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="mailto:contact@edupulseerp.in?subject=Windows%20Desktop%20Pilot%20Enquiry"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/[0.06] text-white border border-white/[0.1] text-base font-medium hover:bg-white/[0.1] transition-colors"
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
