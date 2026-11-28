import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { useMarketingTheme } from '../../context/MarketingThemeContext';
import {
  Check,
  Navigation,
  ChevronRight,
  FileText,
  FolderOpen,
  Code2,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  Paperclip,
  Smile,
  Mic,
  Search,
  MoreVertical,
  SendHorizonal,
} from 'lucide-react';

/* ─── Authentic Vector Brand Logos ────────────────────────────────── */

function GoogleMeetLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path fill="#00832D" d="M18.5 16l4.4 5.05 5.95 3.7c.65.4 1.15.1 1.15-.65V7.9c0-.75-.5-1.05-1.15-.65L22.9 10.95 18.5 16z" />
      <path fill="#0066DA" d="M2 21.5v4.25C2 27.0 3.0 28 4.25 28h4.25l.9-4.5-.9-3.5H2z" />
      <path fill="#EA4335" d="M8.5 4L2 10.5h6.5V4z" />
      <path fill="#2684FC" d="M8.5 10.5H2v11h6.5v-11z" />
      <path fill="#00AC47" d="M22.9 10.95V6.25C22.9 5.0 21.9 4 20.65 4H8.5v6.5h9.5v5.5l4.9-5.05z" />
      <path fill="#FFBA00" d="M8.5 21.5V28h12.15c1.25 0 2.25-1.0 2.25-2.25v-4.7L18 16v5.5H8.5z" />
    </svg>
  );
}

function ZoomLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0B5CFF" />
      <path
        fill="#FFFFFF"
        d="M7.5 11.2c0-.94.76-1.7 1.7-1.7h8.6c2.04 0 3.7 1.66 3.7 3.7v6.6c0 .94-.76 1.7-1.7 1.7H11.2c-2.04 0-3.7-1.66-3.7-3.7v-6.6zm15.2 2.45l4.45-3.2c.48-.35 1.15 0 1.15.6v9.9c0 .6-.67.95-1.15.6l-4.45-3.2v-4.7z"
      />
    </svg>
  );
}

function JitsiLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#17A0DB" />
      <path
        fill="#FFFFFF"
        d="M7.5 11.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-9zm14.2 2.1l3.6-2.55a.75.75 0 0 1 1.2.6v8.7a.75.75 0 0 1-1.2.6l-3.6-2.55v-4.8z"
      />
      <circle cx="14" cy="16" r="2.3" fill="#17A0DB" />
    </svg>
  );
}

function GoogleMapsLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path fill="#1A73E8" d="M20.6 4.4A9.5 9.5 0 0 0 8.5 7.2l5.1 4.3 7-7.1z" />
      <path fill="#EA4335" d="M8.5 7.2a9.5 9.5 0 0 0-2 5.8c0 2.2.75 4.25 2.05 5.9l5.05-7.4-5.1-4.3z" />
      <path fill="#4285F4" d="M16 10.2a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6zm4.6-5.8l-7 7.1 4.95 4.15 5.75-6.8A9.5 9.5 0 0 0 20.6 4.4z" />
      <path fill="#FBBC04" d="M8.55 18.9c1.3 1.7 3.05 3.6 4.45 5.85l5.55-6.65-5-4.2-5.0 5.0z" />
      <path fill="#34A853" d="M13 24.75c1.15 1.85 2.1 3.7 2.4 4.8.15.6 1.05.6 1.2 0 .4-1.45 1.85-4.1 3.55-6.45 2.45-3.4 5.35-6.45 5.35-10.1 0-1.5-.35-2.9-.95-4.15L13 24.75z" />
      <circle cx="16" cy="13.2" r="2.8" fill="#FFFFFF" />
    </svg>
  );
}

function NotionLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="#FFFFFF"
        d="M6.4 5.4c1.2.95 1.65.9 3.9.75l14.7-.9c.45 0 .08-.45-.08-.53L22.5 3.0c-.75-.55-1.75-1.18-3.65-1.05L4.7 2.98c-.52.05-.62.3-.42.5l2.12 1.92zm1.12 3.75v18.4c0 .98.5 1.35 1.62 1.3l16.3-.95c1.12-.05 1.25-.72 1.25-1.5V8.15c0-.77-.3-1.18-.98-1.12l-17.0 1.0c-.72.05-1.19.45-1.19 1.12zm16.48.92c.1.48 0 .95-.48 1.0l-.78.15v13.6c-.68.38-1.3.58-1.82.58-.82 0-1.02-.25-1.62-1.2l-5.0-7.85v7.6l1.62.38s0 .95-1.32.95l-3.65.2c-.1-.22 0-.75.38-.85l.95-.25V12.2l-1.32-.1c-.1-.48.15-1.18.88-1.22l3.92-.25 5.18 7.95v-7.08l-1.35-.15c-.1-.58.32-.98.85-1.02l3.55-.25z"
      />
    </svg>
  );
}

function RazorpayLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path fill="#3395FF" d="M18.6 3L12.4 25.5l4.9 3.5L26.5 3h-7.9z" />
      <path fill="#FFFFFF" d="M14.9 10.2L5.5 29h6.3l5.7-18.8h-2.6z" />
    </svg>
  );
}

function WhatsAppLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
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

/* ─── 1. Live Classroom Showcase (Google Meet · Zoom · Jitsi) ────── */

type VideoProviderId = 'meet' | 'zoom' | 'jitsi';

const VIDEO_PROVIDERS: Record<
  VideoProviderId,
  {
    name: string;
    accent: string;
    logo: React.ReactNode;
  }
> = {
  meet: {
    name: 'Google Meet',
    accent: '#00AC47',
    logo: <GoogleMeetLogo className="w-7 h-7" />,
  },
  zoom: {
    name: 'Zoom',
    accent: '#0B5CFF',
    logo: <ZoomLogo className="w-7 h-7" />,
  },
  jitsi: {
    name: 'Jitsi Meet',
    accent: '#17A0DB',
    logo: <JitsiLogo className="w-7 h-7" />,
  },
};

function LiveClassStage({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  const [provider, setProvider] = useState<VideoProviderId>('meet');
  const current = VIDEO_PROVIDERS[provider];

  return (
    <section
      id="integrations"
      className="py-20 sm:py-28 border-t border-zinc-800 bg-zinc-950/60"
    >
      <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Copy & Provider Switcher */}
          <div className="lg:col-span-5 min-w-0">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">
              Live Virtual Classrooms
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white leading-[1.08] mb-5">
              One timetable. Every live classroom.
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-7">
              Launch encrypted lectures on Google Meet, Zoom, or Jitsi Meet directly
              from your academic schedule. Attendance syncs cleanly to section
              registers without manual link sharing.
            </p>

            {/* Interactive Provider Pills */}
            <div
              role="group"
              aria-label="Select live classroom provider"
              className="flex flex-wrap gap-2.5 mb-7"
            >
              {(['meet', 'zoom', 'jitsi'] as VideoProviderId[]).map((id) => {
                const item = VIDEO_PROVIDERS[id];
                const selected = provider === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setProvider(id)}
                    className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                      selected
                        ? 'bg-zinc-900 border-zinc-600 text-white'
                        : 'bg-[#09090B] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {item.logo}
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>

            <ul className="space-y-3 border-t border-zinc-800 pt-6">
              {[
                'Instant classroom links generated from faculty timetables',
                'Seamless join experience across desktop and web portals',
                'Native support for Google Meet, Zoom, and Jitsi Meet',
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-300">
                  <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Realistic Live Classroom Visual */}
          <div className="lg:col-span-7 min-w-0">
            <div className="marketing-keep-dark rounded-xl border border-zinc-800 bg-[#09090B] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-2.5">
                  {current.logo}
                  <span className="text-sm font-medium text-white">
                    {current.name}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex items-end gap-0.5 h-3.5" aria-hidden="true">
                    {[0.45, 0.9, 0.65, 1].map((scale, idx) => (
                      <motion.span
                        key={idx}
                        className="w-0.5 rounded-full"
                        style={{ backgroundColor: current.accent }}
                        animate={
                          prefersReducedMotion
                            ? { height: '9px' }
                            : { height: ['4px', `${Math.round(scale * 13)}px`, '4px'] }
                        }
                        transition={{
                          duration: 0.7 + idx * 0.14,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-400">Live class</span>
                </div>
              </div>

              <div className="relative bg-zinc-950">
                <img
                  src="/integrations/live-class.jpg"
                  alt="Live university classroom session showing presenter slide and participating students"
                  className="w-full h-auto block object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 2. Real-Time Vehicle & Fleet Routing (Google Maps) ──────────── */

function FleetMapsStage({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  return (
    <section className="py-20 sm:py-28 border-t border-zinc-800 bg-[#09090B]">
      <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Realistic Dark-Mode Google Maps Visual */}
          <div className="lg:col-span-7 order-2 lg:order-1 min-w-0">
            <div className="marketing-keep-dark rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-2.5">
                  <GoogleMapsLogo className="w-5 h-5" />
                  <span className="text-sm font-medium text-white">
                    Google Maps
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-sky-400">
                  <Navigation className="w-3.5 h-3.5" />
                  Live routing
                </span>
              </div>

              <div className="relative bg-[#0B0F17] overflow-hidden">
                <img
                  src="/integrations/fleet-map.jpg"
                  alt="Google Maps dark-mode campus bus route tracking showing active route and vehicle position"
                  className="w-full h-auto block object-cover"
                  loading="lazy"
                />
                {!prefersReducedMotion && (
                  <>
                    {/* Dual-ring live GPS beacon on bus marker */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute left-[62.3%] top-[50%] -translate-x-1/2 -translate-y-1/2"
                    >
                      <motion.span
                        className="block w-16 h-16 rounded-full border-2 border-white/85 bg-sky-400/25 shadow-[0_0_24px_rgba(56,189,248,0.65)]"
                        animate={{ scale: [0.75, 2.3], opacity: [0.9, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                      />
                    </div>
                    {/* Subtle destination beacon on campus pin */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute left-[80.5%] top-[18.5%] -translate-x-1/2 -translate-y-1/2"
                    >
                      <motion.span
                        className="block w-10 h-10 rounded-full border border-red-400/80 bg-red-500/20"
                        animate={{ scale: [0.8, 2.0], opacity: [0.8, 0] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Copy */}
          <div className="lg:col-span-5 order-1 lg:order-2 min-w-0">
            <div className="inline-flex items-center gap-3 mb-5">
              <GoogleMapsLogo className="w-9 h-9" />
              <span className="text-xl sm:text-2xl tracking-[-0.02em] text-white font-medium">
                Google <span className="font-normal text-zinc-300">Maps</span>
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Live vehicle routing from gate to doorstep.
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-7">
              Power your campus transport desk with real-time Google Maps route
              tracking. Dispatchers monitor bus locations, optimize stop sequences,
              and keep parents informed automatically.
            </p>

            <ul className="space-y-3 border-t border-zinc-800 pt-6">
              {[
                'Real-time GPS route tracking and stop-by-stop ETAs',
                'Student transport pass mapping per route and shift',
                'Automated arrival alerts across parent and student portals',
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-300">
                  <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 3. Live Class Notes & Knowledge Base (Notion) ───────────────── */

function NotionNotesStage({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  const [selectedPage, setSelectedPage] = useState(0);

  const sidebarPages = [
    'CS-301 · Algorithms',
    'Graph Traversal',
    'Dynamic Programming',
    'Lab Submissions',
  ];

  return (
    <section className="py-20 sm:py-28 border-t border-zinc-800 bg-zinc-950/60">
      <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Copy */}
          <div className="lg:col-span-5 min-w-0">
            <div className="inline-flex items-center gap-3 mb-5">
              <NotionLogo className="w-9 h-9" />
              <span className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-white">
                Notion
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Every lecture turns into structured Notion notes.
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-7">
              Sync course syllabi, live whiteboard notes, code snippets, and reading
              checklists straight to Notion workspaces — organized automatically by
              department and subject.
            </p>

            <ul className="space-y-3 border-t border-zinc-800 pt-6">
              {[
                'Collaborative lecture notes updated live during class',
                'Rich code blocks, equations, and structured study guides',
                'Automatic access control synced with course enrollment',
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-300">
                  <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Authentic Notion Dark Workspace */}
          <div className="lg:col-span-7 min-w-0">
            <div className="marketing-keep-dark rounded-xl border border-zinc-800 bg-[#191919] overflow-hidden shadow-2xl">
              {/* Notion Top Chrome */}
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-zinc-800 bg-[#141414]">
                <div className="flex items-center gap-2.5 text-xs text-zinc-400">
                  <NotionLogo className="w-4 h-4" />
                  <span>EduPulse Academics</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="text-zinc-200">{sidebarPages[selectedPage]}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span>Share</span>
                  <span>Updates</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-12 min-h-[540px]">
                {/* Authentic Notion Sidebar */}
                <div className="hidden sm:flex sm:col-span-4 flex-col justify-between border-r border-zinc-800 bg-[#202020] p-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-2 py-2 text-xs font-medium text-zinc-300 mb-2">
                      <div className="w-4 h-4 rounded bg-zinc-700 flex items-center justify-center text-[10px] text-white font-semibold">
                        E
                      </div>
                      <span>EduPulse Workspace</span>
                    </div>

                    <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Course Spaces</span>
                    </div>
                    {sidebarPages.map((page, idx) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setSelectedPage(idx)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-left transition-colors cursor-pointer ${
                          selectedPage === idx
                            ? 'bg-zinc-800 text-white font-medium'
                            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                        <span className="truncate">{page}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-zinc-800/80 px-2 text-[11px] text-zinc-500">
                    Synced with Timetable
                  </div>
                </div>

                {/* Main Notion Page Body */}
                <div className="sm:col-span-8 flex flex-col">
                  {/* Authentic Muted Notion Cover Banner */}
                  <div className="h-20 sm:h-24 w-full bg-gradient-to-r from-[#232325] via-[#2A2A2D] to-[#1F2022] border-b border-zinc-800/80 relative" />

                  <div className="px-6 sm:px-8 pb-7 -mt-5 relative z-10 space-y-5">
                    {/* Authentic Monochrome Notion Page Icon */}
                    <div className="w-11 h-11 rounded-lg bg-[#252525] border border-zinc-700/80 flex items-center justify-center shadow-md">
                      <FileText className="w-5 h-5 text-zinc-300" />
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {sidebarPages[selectedPage]}
                    </h3>

                    {/* Page Properties Table */}
                    <div className="grid grid-cols-3 gap-y-2.5 py-3 border-y border-zinc-800 text-xs">
                      <div className="text-zinc-500">Department</div>
                      <div className="col-span-2 text-zinc-200">Computer Science &amp; Engineering</div>
                      <div className="text-zinc-500">Instructor</div>
                      <div className="col-span-2 text-zinc-200">Prof. Rajesh Verma</div>
                      <div className="text-zinc-500">Sync Status</div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#2C2C2C] text-zinc-200 font-medium border border-zinc-700/70">
                          Live Class Notes
                        </span>
                      </div>
                    </div>

                    {/* Callout Block */}
                    <div className="rounded-lg bg-[#252525] border border-zinc-800 p-4 text-xs sm:text-sm text-zinc-200 leading-relaxed">
                      Breadth-first traversal explores level by level using a queue,
                      guaranteeing shortest unweighted paths across connected graphs.
                    </div>

                    {/* Notion Comparison Table */}
                    <div className="rounded-lg border border-zinc-800 overflow-hidden text-xs">
                      <div className="grid grid-cols-3 bg-[#202020] border-b border-zinc-800 text-zinc-400 font-medium">
                        <div className="px-3 py-2 border-r border-zinc-800">Algorithm</div>
                        <div className="px-3 py-2 border-r border-zinc-800">Structure</div>
                        <div className="px-3 py-2">Complexity</div>
                      </div>
                      <div className="grid grid-cols-3 border-b border-zinc-800/80 text-zinc-200">
                        <div className="px-3 py-2 border-r border-zinc-800/80">BFS</div>
                        <div className="px-3 py-2 border-r border-zinc-800/80">Queue</div>
                        <div className="px-3 py-2 font-mono text-zinc-300">O(V + E)</div>
                      </div>
                      <div className="grid grid-cols-3 text-zinc-200">
                        <div className="px-3 py-2 border-r border-zinc-800/80">DFS</div>
                        <div className="px-3 py-2 border-r border-zinc-800/80">Stack</div>
                        <div className="px-3 py-2 font-mono text-zinc-300">O(V + E)</div>
                      </div>
                    </div>

                    {/* Code Snippet */}
                    <div className="rounded-lg bg-[#141414] border border-zinc-800 p-4 font-mono text-xs text-zinc-300">
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mb-2">
                        <Code2 className="w-3.5 h-3.5" />
                        <span>TypeScript</span>
                      </div>
                      <pre className="overflow-x-auto leading-relaxed">
                        <code>{`const queue: Node[] = [root];\nwhile (queue.length > 0) visit(queue.shift()!);`}</code>
                      </pre>
                    </div>

                    {/* Checklist */}
                    <div className="space-y-2.5 text-xs sm:text-sm pt-1">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Check className="w-4 h-4 text-zinc-400 shrink-0" />
                        <span className="line-through">Queue invariant &amp; time complexity</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-100">
                        <span className="w-3.5 h-3.5 rounded border border-zinc-600 shrink-0" />
                        <span>Topological sort practice set</span>
                        {!prefersReducedMotion && (
                          <motion.span
                            aria-hidden="true"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.9, repeat: Infinity }}
                            className="inline-block w-0.5 h-4 bg-white"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 4. Fee Collection & Ledger Reconciliation (Razorpay) ────────── */

function DenseQrMatrix() {
  return (
    <svg viewBox="0 0 29 29" className="w-20 h-20 text-slate-900" aria-hidden="true">
      {/* Top-left finder */}
      <path fill="currentColor" d="M1 1h7v7H1V1zm1 1v5h5V2H2zm1 1h3v3H3V3z" />
      {/* Top-right finder */}
      <path fill="currentColor" d="M21 1h7v7h-7V1zm1 1v5h5V2h-5zm1 1h3v3h-3V3z" />
      {/* Bottom-left finder */}
      <path fill="currentColor" d="M1 21h7v7H1v-7zm1 1v5h5v-5H2zm1 1h3v3H3v-3z" />
      {/* Data modules */}
      <path
        fill="currentColor"
        d="M10 2h2v2h-2V2zm4 0h3v1h-3V2zm4 1h2v2h-2V3zm-6 3h2v3h-2V6zm4 1h3v2h-3V7zm-6 3h1v2h-1v-2zm3 0h3v2h-3v-2zm5 0h2v2h-2v-2zm4 0h3v2h-3v-2zm-19 2h2v2H3v-2zm4 0h2v2H7v-2zm4 2h3v2h-3v-2zm5 0h2v3h-2v-3zm4 1h3v2h-3v-2zm4 0h2v3h-2v-3zM2 16h2v2H2v-2zm4 0h3v2H6v-2zm5 1h2v2h-2v-2zm4 0h2v2h-2v-2zm4 1h3v2h-3v-2zm5 0h2v2h-2v-2zm-14 3h2v2h-2v-2zm4 0h2v3h-2v-3zm4 1h3v2h-3v-2zm4 0h2v2h-2v-2zm-8 3h2v2h-2v-2zm4 1h3v2h-3v-2zm4 0h2v2h-2v-2z"
      />
    </svg>
  );
}

function RazorpayPaymentsStage({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.2 });
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion || !isInView) return;
    const interval = setInterval(() => {
      setPaid((prev) => !prev);
    }, 3400);
    return () => clearInterval(interval);
  }, [prefersReducedMotion, isInView]);

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 border-t border-zinc-800 bg-[#09090B]">
      <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Authentic White Razorpay Checkout + Ledger Flow */}
          <div className="lg:col-span-7 order-2 lg:order-1 min-w-0">
            <div className="marketing-keep-dark rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 shadow-2xl">
              <div className="grid sm:grid-cols-12 gap-5 items-center">
                {/* Authentic Light-Mode Razorpay Standard Checkout Modal */}
                <div className="sm:col-span-7 rounded-xl overflow-hidden bg-white text-slate-900 shadow-xl border border-slate-200">
                  {/* Iconic Razorpay Deep Navy Header */}
                  <div className="px-4 py-3.5 bg-[#072654] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
                        <RazorpayLogo className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">
                          EduPulse University
                        </p>
                        <p className="text-[11px] text-sky-200/90">
                          Razorpay Trusted Business
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Body (fixed height prevents any layout shift) */}
                  <div className="p-4 bg-[#F8FAFC] h-[320px] flex flex-col justify-center">
                    {paid ? (
                      <motion.div
                        initial={{ scale: 0.94, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center text-center gap-2"
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                        </div>
                        <p className="text-sm font-semibold text-slate-900">
                          Payment Successful
                        </p>
                        <p className="text-xs text-slate-500">
                          Fee ledger updated automatically
                        </p>
                      </motion.div>
                    ) : (
                      <div className="space-y-3">
                        {/* Recommended UPI QR Box */}
                        <div className="rounded-lg bg-white border border-slate-200 p-3.5">
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="text-xs font-semibold text-slate-800">
                              UPI QR
                            </span>
                            <span className="text-[11px] font-medium text-blue-600">
                              GPay · PhonePe · Paytm
                            </span>
                          </div>
                          <div className="flex items-center gap-3.5">
                            <div className="p-1.5 rounded border border-slate-200 bg-white shrink-0">
                              <DenseQrMatrix />
                            </div>
                            <div className="text-xs text-slate-600 space-y-1">
                              <p className="font-medium text-slate-800">
                                Scan QR with any UPI app
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Instant confirmation &amp; receipt
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Payment Method Rows */}
                        <div className="rounded-lg bg-white border border-slate-200 divide-y divide-slate-100">
                          {[
                            { id: 'upi', label: 'UPI / QR', sub: 'Google Pay, PhonePe, BHIM', icon: Smartphone },
                            { id: 'card', label: 'Card', sub: 'Visa, MasterCard, RuPay', icon: CreditCard },
                            { id: 'netbanking', label: 'Netbanking', sub: 'All Indian banks', icon: Building2 },
                          ].map((row) => {
                            const Icon = row.icon;
                            const selected = activeTab === row.id;
                            return (
                              <button
                                key={row.id}
                                type="button"
                                onClick={() => setActiveTab(row.id as 'upi' | 'card' | 'netbanking')}
                                className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors cursor-pointer ${
                                  selected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <Icon className="w-4 h-4 text-blue-600 shrink-0" />
                                  <div>
                                    <p className="text-xs font-medium text-slate-800">
                                      {row.label}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      {row.sub}
                                    </p>
                                  </div>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Razorpay Footer CTA */}
                  <div className="px-4 py-3 bg-white border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Secured by Razorpay
                    </span>
                    <span className="px-3.5 py-1.5 rounded bg-[#2B84EA] text-white text-xs font-semibold">
                      Pay Now
                    </span>
                  </div>
                </div>

                {/* EduPulse Ledger */}
                <div className="sm:col-span-5 space-y-2.5">
                  <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
                    Institutional Fee Ledger
                  </p>
                  {['Tuition Fee', 'Hostel & Mess', 'Exam Registration'].map((head, idx) => {
                    const settled = paid || idx > 0;
                    return (
                      <div
                        key={head}
                        className="flex items-center justify-between px-4 py-3 rounded-lg border border-zinc-800 bg-[#09090B]"
                      >
                        <span className="text-sm text-zinc-200">{head}</span>
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            settled ? 'text-emerald-400' : 'text-sky-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          {settled ? 'Settled' : 'Processing'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Copy */}
          <div className="lg:col-span-5 order-1 lg:order-2 min-w-0">
            <div className="inline-flex items-center gap-3 mb-5">
              <RazorpayLogo className="w-9 h-9" />
              <span className="text-xl sm:text-2xl font-bold italic tracking-[-0.03em] text-white">
                Razorpay
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Collect fees in seconds. Reconcile ledgers automatically.
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-7">
              Accept UPI, debit/credit cards, and netbanking through Razorpay with
              zero manual bank statement matching. Every payment posts directly to
              the student&apos;s INR fee ledger.
            </p>

            <ul className="space-y-3 border-t border-zinc-800 pt-6">
              {[
                'Native INR checkout with UPI QR, cards, and netbanking',
                'Instant fee-head reconciliation and digital receipts',
                'Real-time settlement visibility for finance teams',
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-300">
                  <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 5. Parent & Student Alerts (WhatsApp) ──────────────────────── */

const SENDER_REPLY = 'Received, thank you!';

function WhatsAppAlertsStage({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.2 });
  const { theme } = useMarketingTheme();
  const isDarkChat = theme === 'light';

  // Timeline ticks (every 100ms across an 8.5s cycle):
  // 0..8:    Msg 1 (EduPulse automated) visible
  // 9..20:   Msg 2 (EduPulse automated PDF) visible
  // 22..44:  Sender typing character-by-character in composer
  // 45..76:  Sender message sent (#D9FDD3 bubble); read ticks turn blue at tick 54
  // 77..85:  Brief pause before next cycle
  const [tick, setTick] = useState(prefersReducedMotion ? 60 : 0);

  useEffect(() => {
    if (prefersReducedMotion || !isInView) return;
    const timer = setInterval(() => {
      setTick((prev) => (prev + 1) % 85);
    }, 100);
    return () => clearInterval(timer);
  }, [prefersReducedMotion, isInView]);

  const showMsg1 = prefersReducedMotion || tick >= 2;
  const showMsg2 = prefersReducedMotion || tick >= 11;
  const isTyping = !prefersReducedMotion && tick >= 22 && tick < 45;
  const typedCount = isTyping
    ? Math.min(SENDER_REPLY.length, Math.floor(((tick - 22) / 20) * SENDER_REPLY.length) + 1)
    : 0;
  const draftText = isTyping ? SENDER_REPLY.slice(0, typedCount) : '';
  const showReply = prefersReducedMotion || tick >= 45;
  const replyRead = prefersReducedMotion || tick >= 54;

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 border-t border-zinc-800 bg-zinc-950/60">
      <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Copy */}
          <div className="lg:col-span-5 min-w-0">
            <div className="inline-flex items-center gap-3 mb-5">
              <WhatsAppLogo className="w-9 h-9" />
              <span className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-white">
                WhatsApp
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Instant campus updates where parents already read.
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-7">
              Deliver attendance alerts, fee payment receipts, bus arrival notices,
              and examination circulars straight to verified parent and student
              WhatsApp threads automatically.
            </p>

            <ul className="space-y-3 border-t border-zinc-800 pt-6">
              {[
                'Automated attendance & absentee alerts to guardians',
                'Instant fee confirmation with downloadable PDF receipts',
                'Verified institutional sender thread for official circulars',
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-300">
                  <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Authentic WhatsApp Chat (Light in Dark Mode, Dark in Light Mode) */}
          <div className="lg:col-span-7 min-w-0">
            <div
              className={`marketing-keep-dark rounded-xl border overflow-hidden shadow-2xl ${
                isDarkChat ? 'border-zinc-300 bg-[#0B141A]' : 'border-zinc-800 bg-[#EFEAE2]'
              }`}
            >
              {/* Authentic WhatsApp Web Header */}
              <div
                className={`flex items-center justify-between px-4 py-2.5 border-b ${
                  isDarkChat
                    ? 'bg-[#202C33] border-zinc-700/60'
                    : 'bg-[#F0F2F5] border-[#D1D7DB]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src="/logo.jpg"
                    alt="EduPulse Campus Desk"
                    className={`w-10 h-10 rounded-full object-cover border shrink-0 ${
                      isDarkChat ? 'border-zinc-700' : 'border-[#D1D7DB]'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[15px] font-medium truncate ${
                          isDarkChat ? 'text-[#E9EDEF]' : 'text-[#111B21]'
                        }`}
                      >
                        EduPulse Campus Desk
                      </span>
                      <svg viewBox="0 0 18 18" className="w-4 h-4 shrink-0" aria-hidden="true">
                        <circle cx="9" cy="9" r="8" fill="#25D366" />
                        <path
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5.6 9.2l2.1 2.1 4.7-4.7"
                        />
                      </svg>
                    </div>
                    <p
                      className={`text-xs truncate ${
                        isDarkChat ? 'text-[#8696A0]' : 'text-[#667781]'
                      }`}
                    >
                      Official business account
                    </p>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-4 shrink-0 pr-1 ${
                    isDarkChat ? 'text-[#AEBAC1]' : 'text-[#54656F]'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <MoreVertical className="w-4 h-4" />
                </div>
              </div>

              {/* Classic WhatsApp Wallpaper - fixed height prevents layout shift */}
              <div
                className="p-5 sm:p-6 h-[395px] overflow-hidden flex flex-col justify-start relative"
                style={{
                  backgroundColor: isDarkChat ? '#0B141A' : '#EFEAE2',
                  backgroundImage: isDarkChat
                    ? 'radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)'
                    : 'radial-gradient(rgba(17, 27, 33, 0.045) 1px, transparent 1px)',
                  backgroundSize: '18px 18px',
                }}
              >
                <div className="space-y-3">
                  {/* Date Chip */}
                  <div className="flex justify-center mb-1">
                    <span
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium shadow-sm ${
                        isDarkChat
                          ? 'bg-[#182229] text-[#8696A0]'
                          : 'bg-white/95 text-[#54656F]'
                      }`}
                    >
                      TODAY
                    </span>
                  </div>

                  {/* Message 1: Automated Business Alert */}
                  {showMsg1 && (
                    <motion.div
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`max-w-[84%] rounded-lg rounded-tl-none px-3.5 py-2.5 shadow-sm ${
                        isDarkChat ? 'bg-[#202C33]' : 'bg-white'
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold mb-1 ${
                          isDarkChat ? 'text-[#25D366]' : 'text-[#008069]'
                        }`}
                      >
                        Attendance Update
                      </p>
                      <p
                        className={`text-sm leading-relaxed ${
                          isDarkChat ? 'text-[#E9EDEF]' : 'text-[#111B21]'
                        }`}
                      >
                        Good morning! Morning attendance for CS-301 Algorithms has been
                        recorded as Present.
                      </p>
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[11px] ${
                          isDarkChat ? 'text-[#8696A0]' : 'text-[#667781]'
                        }`}
                      >
                        <span>09:02 AM</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Message 2: Automated Business PDF Receipt */}
                  {showMsg2 && (
                    <motion.div
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`max-w-[84%] rounded-lg rounded-tl-none px-3.5 py-2.5 shadow-sm ${
                        isDarkChat ? 'bg-[#202C33]' : 'bg-white'
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold mb-1.5 ${
                          isDarkChat ? 'text-[#25D366]' : 'text-[#008069]'
                        }`}
                      >
                        Fee Receipt Issued
                      </p>
                      <div
                        className={`flex items-center gap-3 rounded-md border p-2.5 mb-2 ${
                          isDarkChat
                            ? 'bg-[#111B21] border-zinc-700/60'
                            : 'bg-[#F0F2F5] border-[#E2E8F0]'
                        }`}
                      >
                        <FileText className="w-5 h-5 text-red-500 shrink-0" />
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-medium truncate ${
                              isDarkChat ? 'text-[#E9EDEF]' : 'text-[#111B21]'
                            }`}
                          >
                            Semester_Tuition_Receipt.pdf
                          </p>
                          <p
                            className={`text-[11px] ${
                              isDarkChat ? 'text-[#8696A0]' : 'text-[#667781]'
                            }`}
                          >
                            142 KB · PDF
                          </p>
                        </div>
                      </div>
                      <p
                        className={`text-sm leading-relaxed ${
                          isDarkChat ? 'text-[#E9EDEF]' : 'text-[#111B21]'
                        }`}
                      >
                        Your semester fee payment has been reconciled to the student ledger.
                      </p>
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[11px] ${
                          isDarkChat ? 'text-[#8696A0]' : 'text-[#667781]'
                        }`}
                      >
                        <span>09:14 AM</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Message 3: Sender Reply (sent after typing in composer) */}
                  {showReply && (
                    <motion.div
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.18 }}
                      className="flex justify-end"
                    >
                      <div
                        className={`max-w-[75%] rounded-lg rounded-tr-none px-3.5 py-2 shadow-sm ${
                          isDarkChat ? 'bg-[#005C4B]' : 'bg-[#D9FDD3]'
                        }`}
                      >
                        <p className={`text-sm ${isDarkChat ? 'text-[#E9EDEF]' : 'text-[#111B21]'}`}>
                          {SENDER_REPLY}
                        </p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-0.5 text-[11px] ${
                            isDarkChat ? 'text-[#8696A0]' : 'text-[#667781]'
                          }`}
                        >
                          <span>09:15 AM</span>
                          <span className={replyRead ? 'text-[#53BDEB] font-semibold' : 'text-[#8696A0]'}>
                            ✓✓
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Authentic WhatsApp Composer Bar (live sender typing + send) */}
              <div
                className={`px-3.5 py-2.5 border-t flex items-center gap-2.5 ${
                  isDarkChat
                    ? 'bg-[#202C33] border-zinc-700/60'
                    : 'bg-[#F0F2F5] border-[#D1D7DB]'
                }`}
              >
                <Smile className={`w-5 h-5 shrink-0 ${isDarkChat ? 'text-[#8696A0]' : 'text-[#54656F]'}`} />
                <Paperclip className={`w-5 h-5 shrink-0 ${isDarkChat ? 'text-[#8696A0]' : 'text-[#54656F]'}`} />
                <div
                  className={`flex-1 rounded-lg px-3.5 py-2 text-sm min-h-[36px] flex items-center ${
                    isDarkChat ? 'bg-[#2A3942]' : 'bg-white'
                  }`}
                >
                  {isTyping ? (
                    <span className={isDarkChat ? 'text-[#E9EDEF]' : 'text-[#111B21]'}>
                      {draftText}
                      <span
                        className={`inline-block w-0.5 h-4 align-middle ml-0.5 animate-pulse ${
                          isDarkChat ? 'bg-[#25D366]' : 'bg-[#008069]'
                        }`}
                      />
                    </span>
                  ) : (
                    <span className={`text-xs ${isDarkChat ? 'text-[#8696A0]' : 'text-[#667781]'}`}>
                      Type a message
                    </span>
                  )}
                </div>
                <div className="w-9 h-9 rounded-full bg-[#00A884] flex items-center justify-center shrink-0 transition-transform">
                  {isTyping ? (
                    <SendHorizonal className="w-4 h-4 text-white" />
                  ) : (
                    <Mic className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Combined Export ─────────────────────────────────────────────── */

export default function IntegrationsSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <LiveClassStage prefersReducedMotion={prefersReducedMotion} />
      <FleetMapsStage prefersReducedMotion={prefersReducedMotion} />
      <NotionNotesStage prefersReducedMotion={prefersReducedMotion} />
      <RazorpayPaymentsStage prefersReducedMotion={prefersReducedMotion} />
      <WhatsAppAlertsStage prefersReducedMotion={prefersReducedMotion} />
    </>
  );
}
