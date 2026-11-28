import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
  QrCode,
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
            <div className="rounded-xl border border-zinc-800 bg-[#09090B] overflow-hidden shadow-2xl">
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

function FleetMapsStage() {
  return (
    <section className="py-20 sm:py-28 border-t border-zinc-800 bg-[#09090B]">
      <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Realistic Dark-Mode Google Maps Visual */}
          <div className="lg:col-span-7 order-2 lg:order-1 min-w-0">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
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

              <div className="relative bg-[#0B0F17]">
                <img
                  src="/integrations/fleet-map.jpg"
                  alt="Google Maps dark-mode campus bus route tracking showing active route and vehicle position"
                  className="w-full h-auto block object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Right Copy */}
          <div className="lg:col-span-5 order-1 lg:order-2 min-w-0">
            <div className="inline-flex items-center gap-3.5 mb-5">
              <GoogleMapsLogo className="w-9 h-9" />
              <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-zinc-400">
                Google Maps
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
            <div className="inline-flex items-center gap-3.5 mb-5">
              <NotionLogo className="w-9 h-9" />
              <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-zinc-400">
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
            <div className="rounded-xl border border-zinc-800 bg-[#191919] overflow-hidden shadow-2xl">
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
                  {/* Subtle Notion Cover Banner */}
                  <div className="h-20 sm:h-24 w-full bg-gradient-to-r from-indigo-950/70 via-zinc-900 to-sky-950/60 border-b border-zinc-800/70 relative" />

                  <div className="px-6 sm:px-8 pb-7 -mt-5 relative z-10 space-y-5">
                    {/* Overlapping Notion Page Icon */}
                    <div className="w-11 h-11 rounded-lg bg-[#252525] border border-zinc-700 flex items-center justify-center shadow-md">
                      <FileText className="w-5 h-5 text-sky-400" />
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
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">
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
                        <div className="px-3 py-2 font-mono text-sky-400">O(V + E)</div>
                      </div>
                      <div className="grid grid-cols-3 text-zinc-200">
                        <div className="px-3 py-2 border-r border-zinc-800/80">DFS</div>
                        <div className="px-3 py-2 border-r border-zinc-800/80">Stack</div>
                        <div className="px-3 py-2 font-mono text-sky-400">O(V + E)</div>
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
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
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

function RazorpayPaymentsStage({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setPaid((prev) => !prev);
    }, 3200);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <section className="py-20 sm:py-28 border-t border-zinc-800 bg-[#09090B]">
      <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Realistic Razorpay Checkout + Ledger Flow */}
          <div className="lg:col-span-7 order-2 lg:order-1 min-w-0">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
              {/* Razorpay Navy Header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#072654] border-b border-sky-900/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <RazorpayLogo className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Razorpay Checkout
                    </p>
                    <p className="text-[11px] text-sky-200/80">
                      EduPulse Institutional Fee Portal
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-sky-200">
                  Trusted Business
                </span>
              </div>

              <div className="p-5 sm:p-7 grid sm:grid-cols-12 gap-5 items-center">
                {/* Razorpay Payment Modal */}
                <div className="sm:col-span-6 rounded-xl border border-zinc-800 bg-[#09090B] overflow-hidden">
                  {/* Method Tabs */}
                  <div className="grid grid-cols-3 border-b border-zinc-800 text-xs">
                    {[
                      { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                      { id: 'card', label: 'Cards', icon: CreditCard },
                      { id: 'netbanking', label: 'Bank', icon: Building2 },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const selected = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id as 'upi' | 'card' | 'netbanking')}
                          className={`flex items-center justify-center gap-1.5 py-2.5 font-medium transition-colors cursor-pointer ${
                            selected
                              ? 'bg-sky-500/10 text-sky-400 border-b-2 border-sky-400'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Checkout Body */}
                  <div className="p-5 flex flex-col items-center justify-center min-h-[190px] text-center">
                    {paid ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center gap-2.5"
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <p className="text-sm font-medium text-white">
                          Payment Successful
                        </p>
                        <p className="text-xs text-zinc-400">
                          Synced to student fee ledger
                        </p>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-24 h-24 rounded-lg bg-white p-2 flex items-center justify-center">
                          <QrCode className="w-full h-full text-zinc-950" strokeWidth={1.5} />
                        </div>
                        <p className="text-xs text-zinc-300">
                          Scan with any UPI app
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* EduPulse Ledger */}
                <div className="sm:col-span-6 space-y-2.5">
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
            <div className="inline-flex items-center gap-3.5 mb-5">
              <RazorpayLogo className="w-9 h-9" />
              <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-zinc-400">
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

function WhatsAppAlertsStage({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  const [pulseStep, setPulseStep] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setPulseStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <section className="py-20 sm:py-28 border-t border-zinc-800 bg-zinc-950/60">
      <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Copy */}
          <div className="lg:col-span-5 min-w-0">
            <div className="inline-flex items-center gap-3.5 mb-5">
              <WhatsAppLogo className="w-9 h-9" />
              <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-zinc-400">
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

          {/* Right Authentic WhatsApp Dark Mode Chat */}
          <div className="lg:col-span-7 min-w-0">
            <div className="rounded-xl border border-zinc-800 bg-[#0B141A] overflow-hidden shadow-2xl">
              {/* WhatsApp Header */}
              <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#202C33] border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#00A884]/20 border border-[#00A884]/40 flex items-center justify-center">
                    <WhatsAppLogo className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-white">
                        EduPulse Campus Desk
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Official Institutional Account
                    </p>
                  </div>
                </div>
                <span className="text-xs text-zinc-400">online</span>
              </div>

              {/* WhatsApp Chat Canvas */}
              <div className="p-5 sm:p-6 space-y-4 bg-[#0B141A] min-h-[340px] flex flex-col justify-between">
                <div className="space-y-3.5">
                  {/* Message 1: Attendance Alert */}
                  <div
                    className={`max-w-[85%] rounded-lg rounded-tl-none bg-[#202C33] p-3.5 border transition-colors duration-300 ${
                      pulseStep === 0 ? 'border-[#25D366]/50' : 'border-transparent'
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#25D366] mb-1">
                      Attendance Update
                    </p>
                    <p className="text-sm text-zinc-100 leading-relaxed">
                      Good morning! Morning attendance for CS-301 Algorithms has been
                      recorded as Present.
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1.5 text-[11px] text-zinc-400">
                      <span>09:02 AM</span>
                      <span className="text-sky-400">✓✓</span>
                    </div>
                  </div>

                  {/* Message 2: Fee Receipt PDF */}
                  <div
                    className={`max-w-[85%] rounded-lg rounded-tl-none bg-[#202C33] p-3.5 border transition-colors duration-300 ${
                      pulseStep === 1 ? 'border-[#25D366]/50' : 'border-transparent'
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#25D366] mb-1.5">
                      Fee Receipt Issued
                    </p>
                    <div className="flex items-center gap-3 rounded-md bg-[#111B21] border border-zinc-800 p-2.5 mb-2">
                      <FileText className="w-5 h-5 text-red-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-100 truncate">
                          Semester_Tuition_Receipt.pdf
                        </p>
                        <p className="text-[11px] text-zinc-500">PDF Document</p>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-100 leading-relaxed">
                      Your semester fee payment has been reconciled to the student ledger.
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1.5 text-[11px] text-zinc-400">
                      <span>09:14 AM</span>
                      <span className="text-sky-400">✓✓</span>
                    </div>
                  </div>

                  {/* Message 3: Guardian Reply */}
                  <div className="flex justify-end">
                    <div
                      className={`max-w-[75%] rounded-lg rounded-tr-none bg-[#005C4B] p-3.5 border transition-colors duration-300 ${
                        pulseStep === 2 ? 'border-[#25D366]/60' : 'border-transparent'
                      }`}
                    >
                      <p className="text-sm text-white">
                        Received, thank you!
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[11px] text-emerald-200/80">
                        <span>09:15 AM</span>
                        <span className="text-sky-300">✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Composer Bar */}
                <div className="pt-2 flex items-center gap-2.5">
                  <div className="flex-1 rounded-lg bg-[#202C33] px-4 py-2.5 text-xs text-zinc-500 border border-zinc-800/80">
                    Automated notifications enabled
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

/* ─── Combined Export ─────────────────────────────────────────────── */

export default function IntegrationsSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <LiveClassStage prefersReducedMotion={prefersReducedMotion} />
      <FleetMapsStage />
      <NotionNotesStage prefersReducedMotion={prefersReducedMotion} />
      <RazorpayPaymentsStage prefersReducedMotion={prefersReducedMotion} />
      <WhatsAppAlertsStage prefersReducedMotion={prefersReducedMotion} />
    </>
  );
}
