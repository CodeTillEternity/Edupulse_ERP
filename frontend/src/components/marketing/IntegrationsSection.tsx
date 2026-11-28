import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

type IntegrationCategory = 'All' | 'Live Class' | 'Campus Ops' | 'Notes & Docs' | 'Payments';

interface IntegrationItem {
  id: string;
  name: string;
  category: Exclude<IntegrationCategory, 'All'>;
  tag: string;
  description: string;
  workflow: string;
  glowColor: string;
  logo: React.ReactNode;
}

/* ─── Authentic Vector Brand Logos ────────────────────────────────── */

function GoogleMeetLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
      <path fill="#00832D" d="M18.5 16l4.4 5.05 5.95 3.7c.65.4 1.15.1 1.15-.65V7.9c0-.75-.5-1.05-1.15-.65L22.9 10.95 18.5 16z" />
      <path fill="#0066DA" d="M2 21.5v4.25C2 27.0 3.0 28 4.25 28h4.25l.9-4.5-.9-3.5H2z" />
      <path fill="#EA4335" d="M8.5 4L2 10.5h6.5V4z" />
      <path fill="#2684FC" d="M8.5 10.5H2v11h6.5v-11z" />
      <path fill="#00AC47" d="M22.9 10.95V6.25C22.9 5.0 21.9 4 20.65 4H8.5v6.5h9.5v5.5l4.9-5.05z" />
      <path fill="#FFBA00" d="M8.5 21.5V28h12.15c1.25 0 2.25-1.0 2.25-2.25v-4.7L18 16v5.5H8.5z" />
    </svg>
  );
}

function ZoomLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0B5CFF" />
      <path
        fill="#FFFFFF"
        d="M7.5 11.2c0-.94.76-1.7 1.7-1.7h8.6c2.04 0 3.7 1.66 3.7 3.7v6.6c0 .94-.76 1.7-1.7 1.7H11.2c-2.04 0-3.7-1.66-3.7-3.7v-6.6zm15.2 2.45l4.45-3.2c.48-.35 1.15 0 1.15.6v9.9c0 .6-.67.95-1.15.6l-4.45-3.2v-4.7z"
      />
    </svg>
  );
}

function JitsiLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#17A0DB" />
      <path
        fill="#FFFFFF"
        d="M7.5 11.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-9zm14.2 2.1l3.6-2.55a.75.75 0 0 1 1.2.6v8.7a.75.75 0 0 1-1.2.6l-3.6-2.55v-4.8z"
      />
      <circle cx="14" cy="16" r="2.3" fill="#17A0DB" />
    </svg>
  );
}

function GoogleMapsLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
      <path fill="#1A73E8" d="M20.6 4.4A9.5 9.5 0 0 0 8.5 7.2l5.1 4.3 7-7.1z" />
      <path fill="#EA4335" d="M8.5 7.2a9.5 9.5 0 0 0-2 5.8c0 2.2.75 4.25 2.05 5.9l5.05-7.4-5.1-4.3z" />
      <path fill="#4285F4" d="M16 10.2a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6zm4.6-5.8l-7 7.1 4.95 4.15 5.75-6.8A9.5 9.5 0 0 0 20.6 4.4z" />
      <path fill="#FBBC04" d="M8.55 18.9c1.3 1.7 3.05 3.6 4.45 5.85l5.55-6.65-5-4.2-5.0 5.0z" />
      <path fill="#34A853" d="M13 24.75c1.15 1.85 2.1 3.7 2.4 4.8.15.6 1.05.6 1.2 0 .4-1.45 1.85-4.1 3.55-6.45 2.45-3.4 5.35-6.45 5.35-10.1 0-1.5-.35-2.9-.95-4.15L13 24.75z" />
      <circle cx="16" cy="13.2" r="2.8" fill="#FFFFFF" />
    </svg>
  );
}

function NotionLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
      <path
        fill="#FFFFFF"
        d="M6.4 5.4c1.2.95 1.65.9 3.9.75l14.7-.9c.45 0 .08-.45-.08-.53L22.5 3.0c-.75-.55-1.75-1.18-3.65-1.05L4.7 2.98c-.52.05-.62.3-.42.5l2.12 1.92zm1.12 3.75v18.4c0 .98.5 1.35 1.62 1.3l16.3-.95c1.12-.05 1.25-.72 1.25-1.5V8.15c0-.77-.3-1.18-.98-1.12l-17.0 1.0c-.72.05-1.19.45-1.19 1.12zm16.48.92c.1.48 0 .95-.48 1.0l-.78.15v13.6c-.68.38-1.3.58-1.82.58-.82 0-1.02-.25-1.62-1.2l-5.0-7.85v7.6l1.62.38s0 .95-1.32.95l-3.65.2c-.1-.22 0-.75.38-.85l.95-.25V12.2l-1.32-.1c-.1-.48.15-1.18.88-1.22l3.92-.25 5.18 7.95v-7.08l-1.35-.15c-.1-.58.32-.98.85-1.02l3.55-.25z"
      />
    </svg>
  );
}

function RazorpayLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
      <path fill="#3395FF" d="M18.6 3L12.4 25.5l4.9 3.5L26.5 3h-7.9z" />
      <path fill="#FFFFFF" d="M14.9 10.2L5.5 29h6.3l5.7-18.8h-2.6z" />
    </svg>
  );
}

function GoogleCalendarLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
      <path fill="#FFFFFF" d="M8.5 8.5h15v15h-15z" />
      <path fill="#4285F4" d="M23.5 8.5V4H6.5C5.1 4 4 5.1 4 6.5v17h4.5v-15h15z" />
      <path fill="#1967D2" d="M23.5 4H28v4.5h-4.5z" opacity="0.85" />
      <path fill="#FBBC04" d="M23.5 8.5H28v15h-4.5z" />
      <path fill="#34A853" d="M8.5 23.5h15V28h-15z" />
      <path fill="#188038" d="M4 23.5h4.5V28H6.5C5.1 28 4 26.9 4 25.5v-2z" />
      <path fill="#EA4335" d="M23.5 28L28 23.5h-4.5V28z" />
      <path
        fill="#1967D2"
        d="M12.3 19.6c-.48-.32-.8-.78-.96-1.35l1.28-.52c.12.4.32.7.6.9.28.2.6.3.96.3.38 0 .7-.1.96-.32.26-.22.39-.5.39-.84 0-.36-.14-.65-.42-.86-.28-.22-.64-.33-1.08-.33h-.68v-1.22h.61c.38 0 .7-.09.94-.28.24-.19.36-.45.36-.78 0-.3-.11-.54-.33-.72-.22-.18-.5-.27-.84-.27-.33 0-.6.09-.82.26-.22.17-.37.4-.46.68l-1.24-.52c.16-.46.46-.84.9-1.15.44-.31.98-.47 1.63-.47.52 0 .98.1 1.38.3.4.2.72.47.94.82.22.35.33.74.33 1.18 0 .45-.11.83-.32 1.15-.21.32-.5.56-.84.72v.08c.45.18.81.46 1.08.84.27.38.4.82.4 1.34 0 .48-.12.9-.37 1.28-.25.38-.59.67-1.02.88-.43.21-.92.32-1.46.32-.6 0-1.15-.16-1.64-.48zm6.46.28v-5.74l-1.46 1.04-.7-1.06 2.54-1.82h1.02v7.58h-1.4z"
      />
    </svg>
  );
}

function WhatsAppLogo() {
  return (
    <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden="true">
      <path
        fill="#25D366"
        d="M16 3C8.82 3 3 8.82 3 16c0 2.3.6 4.54 1.74 6.52L3 29l6.65-1.74A12.93 12.93 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3z"
      />
      <path
        fill="#FFFFFF"
        d="M22.38 19.38c-.34-.17-2.02-.99-2.34-1.11-.31-.11-.54-.17-.77.17-.23.34-.88 1.11-1.08 1.34-.2.23-.4.25-.74.08-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.7-2.02-1.9-2.36-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.08-.17-.77-1.85-1.05-2.53-.28-.66-.56-.57-.77-.58h-.65c-.23 0-.6.08-.91.43-.31.34-1.19 1.17-1.19 2.84s1.22 3.3 1.39 3.53c.17.23 2.4 3.67 5.82 5.14.81.35 1.45.56 1.94.72.82.26 1.56.22 2.15.13.66-.1 2.02-.83 2.31-1.62.28-.8.28-1.48.2-1.62-.09-.14-.31-.23-.65-.4z"
      />
    </svg>
  );
}

/* ─── Integration Catalog ─────────────────────────────────────────── */

const CATEGORIES: IntegrationCategory[] = [
  'All',
  'Live Class',
  'Campus Ops',
  'Notes & Docs',
  'Payments',
];

const INTEGRATIONS: IntegrationItem[] = [
  {
    id: 'google-meet',
    name: 'Google Meet',
    category: 'Live Class',
    tag: 'Live Class',
    description:
      'Generate instant classroom links directly from academic timetables with automated attendance capture.',
    workflow: 'Timetable -> Meet room',
    glowColor: 'rgba(0, 172, 71, 0.18)',
    logo: <GoogleMeetLogo />,
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'Live Class',
    tag: 'Live Class',
    description:
      'Run HD department lectures, guest webinars, and cloud-recorded sessions from your faculty portal.',
    workflow: 'Lecture -> HD webinar',
    glowColor: 'rgba(11, 92, 255, 0.2)',
    logo: <ZoomLogo />,
  },
  {
    id: 'jitsi',
    name: 'Jitsi Meet',
    category: 'Live Class',
    tag: 'Live Class',
    description:
      'Host encrypted, open-source video classrooms in the browser with zero per-seat licensing overhead.',
    workflow: 'Section -> Instant room',
    glowColor: 'rgba(23, 160, 219, 0.2)',
    logo: <JitsiLogo />,
  },
  {
    id: 'google-maps',
    name: 'Google Maps',
    category: 'Campus Ops',
    tag: 'Fleet Routing',
    description:
      'Monitor campus buses in real time, plan stop-by-stop vehicle routes, and share live ETAs with guardians.',
    workflow: 'GPS -> Route & ETA',
    glowColor: 'rgba(66, 133, 244, 0.18)',
    logo: <GoogleMapsLogo />,
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Notes & Docs',
    tag: 'Class Notes',
    description:
      'Publish live class notes, syllabus handbooks, and collaborative study pages linked to every course.',
    workflow: 'Session -> Synced notes',
    glowColor: 'rgba(255, 255, 255, 0.12)',
    logo: <NotionLogo />,
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    category: 'Payments',
    tag: 'Fee Collection',
    description:
      'Accept UPI, cards, and netbanking for tuition and hostel invoices with instant INR ledger reconciliation.',
    workflow: 'UPI / Card -> Fee ledger',
    glowColor: 'rgba(51, 149, 255, 0.22)',
    logo: <RazorpayLogo />,
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    category: 'Campus Ops',
    tag: 'Scheduling',
    description:
      'Sync class timetables, examination windows, and academic holidays straight to faculty and student calendars.',
    workflow: 'Schedule -> Calendar sync',
    glowColor: 'rgba(251, 188, 4, 0.16)',
    logo: <GoogleCalendarLogo />,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'Campus Ops',
    tag: 'Alerts & Notices',
    description:
      'Deliver attendance alerts, fee payment receipts, and exam circulars directly to parents and students.',
    workflow: 'Trigger -> Parent alert',
    glowColor: 'rgba(37, 211, 102, 0.18)',
    logo: <WhatsAppLogo />,
  },
];

/* ─── Component ───────────────────────────────────────────────────── */

export default function IntegrationsSection() {
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory>('All');

  const visibleIntegrations =
    activeCategory === 'All'
      ? INTEGRATIONS
      : INTEGRATIONS.filter((item) => item.category === activeCategory);

  return (
    <section
      id="integrations"
      className="py-20 sm:py-28 border-t border-zinc-800 bg-zinc-950/60"
    >
      <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        {/* Header + Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 sm:mb-14">
          <div className="max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">
              Connected Ecosystem
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white leading-[1.08]">
              Works with the tools your campus already runs on.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed">
              Connect live classrooms, fleet routing, collaborative lecture notes,
              and instant INR fee collection into one unified institutional workflow.
            </p>
          </div>

          <div
            role="group"
            aria-label="Filter integrations by category"
            className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-[#09090B] border border-zinc-800 self-start lg:self-auto"
          >
            {CATEGORIES.map((category) => {
              const selected = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    selected
                      ? 'bg-white text-zinc-950'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hairline Architectural Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-zinc-800 bg-[#09090B]">
          {visibleIntegrations.map((item) => (
            <div
              key={item.id}
              className="group relative border-r border-b border-zinc-800 p-7 sm:p-8 flex flex-col justify-between transition-colors duration-200 hover:bg-zinc-900/40 overflow-hidden"
            >
              {/* Subtle brand-colored ambient radial glow on hover */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-12 -left-12 w-44 h-44 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl"
                style={{ background: item.glowColor }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-zinc-900/90 border border-zinc-800 group-hover:border-zinc-700 flex items-center justify-center shrink-0 transition-colors">
                    {item.logo}
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 px-2.5 py-1 rounded border border-zinc-800 bg-zinc-950/80">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-1.5">
                  {item.name}
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </h3>

                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-zinc-500 group-hover:text-zinc-300 transition-colors">
                  {item.workflow}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
