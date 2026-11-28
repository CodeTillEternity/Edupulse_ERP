import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  Mic,
  Video,
  MonitorUp,
  PhoneOff,
  Navigation,
  FileText,
  Code2,
  ListChecks,
  CreditCard,
  Smartphone,
  Building2,
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
    logo: <GoogleMeetLogo className="w-5 h-5" />,
  },
  zoom: {
    name: 'Zoom',
    accent: '#0B5CFF',
    logo: <ZoomLogo className="w-5 h-5" />,
  },
  jitsi: {
    name: 'Jitsi Meet',
    accent: '#17A0DB',
    logo: <JitsiLogo className="w-5 h-5" />,
  },
};

function LiveClassStage({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  const [provider, setProvider] = useState<VideoProviderId>('meet');
  const [activeTile, setActiveTile] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveTile((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

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

          {/* Right Minimalist Video Stage */}
          <div className="lg:col-span-7 min-w-0">
            <div className="rounded-xl border border-zinc-800 bg-[#09090B] overflow-hidden shadow-2xl">
              {/* Minimal Chrome */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-3">
                  {current.logo}
                  <span className="text-sm font-medium text-white">
                    {current.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-zinc-400">Live session</span>
                </div>
              </div>

              {/* Clean Video Grid */}
              <div className="p-5 grid grid-cols-12 gap-3.5">
                {/* Main Presenter Stage */}
                <div className="col-span-12 sm:col-span-8 relative rounded-lg border border-zinc-800 bg-zinc-900/40 min-h-[240px] flex flex-col justify-between p-5 overflow-hidden">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-20 transition-colors duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 45%, ${current.accent}, transparent 68%)`,
                    }}
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-400">
                      Presenter
                    </span>
                    {/* Smooth Audio Equalizer */}
                    <div className="flex items-end gap-1 h-4" aria-hidden="true">
                      {[0.45, 0.9, 0.65, 1, 0.55].map((scale, idx) => (
                        <motion.span
                          key={idx}
                          className="w-0.5 rounded-full"
                          style={{ backgroundColor: current.accent }}
                          animate={
                            prefersReducedMotion
                              ? { height: '10px' }
                              : { height: ['4px', `${Math.round(scale * 14)}px`, '4px'] }
                          }
                          transition={{
                            duration: 0.7 + idx * 0.14,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Center Clean Presenter Silhouette */}
                  <div className="relative z-10 flex flex-col items-center justify-center my-6">
                    <div className="relative">
                      {!prefersReducedMotion && (
                        <motion.div
                          className="absolute -inset-3 rounded-full opacity-25"
                          style={{ border: `1.5px solid ${current.accent}` }}
                          animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0, 0.35] }}
                          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                      <div className="w-16 h-16 rounded-full bg-zinc-800/90 border border-zinc-700 flex items-center justify-center">
                        <Video className="w-6 h-6 text-zinc-200" />
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Screen sharing</span>
                    <MonitorUp className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                </div>

                {/* Participant Tiles */}
                <div className="col-span-12 sm:col-span-4 grid grid-cols-2 sm:grid-cols-1 gap-3">
                  {[0, 1, 2, 3].slice(0, 3).map((idx) => {
                    const speaking = activeTile === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-lg border bg-zinc-900/40 p-3.5 flex items-center justify-between transition-colors duration-300"
                        style={{
                          borderColor: speaking ? current.accent : 'rgb(39 39 42)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700/80" />
                          <div className="space-y-1.5">
                            <div className="w-16 h-2 rounded bg-zinc-700/70" />
                            <div className="w-10 h-1.5 rounded bg-zinc-800" />
                          </div>
                        </div>
                        <Mic
                          className="w-3.5 h-3.5 transition-colors"
                          style={{ color: speaking ? current.accent : 'rgb(82 82 91)' }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clean Call Controls Bar */}
              <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                  <Video className="w-4 h-4" />
                </div>
                <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                  <MonitorUp className="w-4 h-4" />
                </div>
                <div className="w-9 h-9 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <PhoneOff className="w-4 h-4" />
                </div>
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
  // Smooth cubic bezier road curve used both for the glowing route and animateMotion
  const routePath =
    'M 64 268 C 140 264, 168 205, 224 188 C 288 168, 316 198, 384 158 C 446 122, 474 78, 572 72';

  return (
    <section className="py-20 sm:py-28 border-t border-zinc-800 bg-[#09090B]">
      <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Realistic Dark Vector Map */}
          <div className="lg:col-span-7 order-2 lg:order-1 min-w-0">
            <div className="rounded-xl border border-zinc-800 bg-[#0B0F17] overflow-hidden shadow-2xl">
              {/* Map Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-3">
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

              {/* Realistic Dark-Mode City Map Canvas */}
              <div className="relative h-[300px] sm:h-[340px] bg-[#0B0F17] overflow-hidden">
                <svg
                  viewBox="0 0 640 340"
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMid slice"
                  aria-hidden="true"
                >
                  <defs>
                    <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Subtle Urban Land Blocks & Park/Water Geometry */}
                  <path
                    d="M -20 40 Q 130 15, 250 70 T 520 35 L 660 50 L 660 -10 L -20 -10 Z"
                    fill="#0E1522"
                  />
                  <path
                    d="M 410 215 Q 500 185, 650 235 L 650 350 L 380 350 Z"
                    fill="#0D171B"
                  />
                  <rect x="75" y="55" width="95" height="65" rx="6" fill="#101725" />
                  <rect x="210" y="75" width="110" height="55" rx="6" fill="#101725" />
                  <rect x="110" y="210" width="95" height="70" rx="6" fill="#101725" />
                  <rect x="255" y="220" width="115" height="65" rx="6" fill="#101725" />

                  {/* Minor City Street Network */}
                  <g stroke="#182235" strokeWidth="2" fill="none">
                    <path d="M 0 52 L 640 92" />
                    <path d="M 0 142 L 640 120" />
                    <path d="M 0 218 L 640 248" />
                    <path d="M 0 296 L 640 278" />
                    <path d="M 96 0 L 72 340" />
                    <path d="M 196 0 L 222 340" />
                    <path d="M 326 0 L 308 340" />
                    <path d="M 456 0 L 478 340" />
                    <path d="M 564 0 L 542 340" />
                  </g>

                  {/* Major Arterial Highways */}
                  <g stroke="#202D44" strokeWidth="7" strokeLinecap="round" fill="none">
                    <path d="M -10 182 C 160 170, 320 210, 650 150" />
                    <path d="M 390 -10 C 375 110, 395 220, 360 350" />
                  </g>

                  {/* Active Route Casing + Glowing Google Maps Blue Line */}
                  <path
                    d={routePath}
                    stroke="#1D4ED8"
                    strokeOpacity="0.35"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d={routePath}
                    stroke="#4285F4"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#route-glow)"
                  />

                  {/* Origin & Campus Destination Markers */}
                  <g transform="translate(64, 268)">
                    <circle r="7" fill="#34A853" stroke="#0B0F17" strokeWidth="3" />
                  </g>
                  <g transform="translate(304, 179)">
                    <circle r="5.5" fill="#93C5FD" stroke="#0B0F17" strokeWidth="2.5" />
                  </g>
                  <g transform="translate(572, 72)">
                    <circle r="14" fill="rgba(234, 67, 53, 0.2)" />
                    <circle r="7.5" fill="#EA4335" stroke="#FFFFFF" strokeWidth="2.5" />
                  </g>

                  {/* Smoothly Gliding Vehicle Along Exact Bezier Road Path */}
                  <g>
                    <circle r="20" fill="rgba(66, 133, 244, 0.22)" />
                    <circle r="10" fill="#4285F4" stroke="#FFFFFF" strokeWidth="3" />
                    {!prefersReducedMotion && (
                      <animateMotion
                        dur="10s"
                        repeatCount="indefinite"
                        path={routePath}
                        rotate="auto"
                      />
                    )}
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Right Copy */}
          <div className="lg:col-span-5 order-1 lg:order-2 min-w-0">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <GoogleMapsLogo className="w-5 h-5" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">
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
  const [activeBlock, setActiveBlock] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveBlock((prev) => (prev + 1) % 3);
    }, 2800);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <section className="py-20 sm:py-28 border-t border-zinc-800 bg-zinc-950/60">
      <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Copy */}
          <div className="lg:col-span-5 min-w-0">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <NotionLogo className="w-5 h-5" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">
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
              {/* Notion Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-[#141414]">
                <div className="flex items-center gap-3">
                  <NotionLogo className="w-5 h-5" />
                  <span className="text-sm font-medium text-white">Notion</span>
                </div>
                <span className="text-xs text-zinc-500">Synced workspace</span>
              </div>

              {/* Clean Document Body */}
              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-2.5 text-zinc-400 text-xs">
                  <FileText className="w-4 h-4" />
                  <span>Algorithms &amp; Data Structures</span>
                </div>

                <h3 className="text-2xl font-semibold text-white tracking-tight">
                  Balanced Search Trees
                </h3>

                {/* Block 1: Summary Callout */}
                <div
                  className={`rounded-lg border p-4 transition-colors duration-300 ${
                    activeBlock === 0
                      ? 'border-zinc-600 bg-zinc-800/60'
                      : 'border-zinc-800 bg-zinc-900/50'
                  }`}
                >
                  <p className="text-sm text-zinc-200 leading-relaxed">
                    Self-balancing trees keep lookup, insertion, and deletion bounded
                    at logarithmic height across dynamic workloads.
                  </p>
                </div>

                {/* Block 2: Code Block */}
                <div
                  className={`rounded-lg border p-4 font-mono text-xs transition-colors duration-300 ${
                    activeBlock === 1
                      ? 'border-zinc-600 bg-[#111111]'
                      : 'border-zinc-800 bg-[#111111]/80'
                  }`}
                >
                  <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>TypeScript</span>
                  </div>
                  <pre className="text-zinc-300 overflow-x-auto leading-relaxed">
                    <code>{`function balanceFactor(node: TreeNode | null): number {\n  return node ? height(node.left) - height(node.right) : 0;\n}`}</code>
                  </pre>
                </div>

                {/* Block 3: Live Checklist */}
                <div
                  className={`rounded-lg border p-4 transition-colors duration-300 ${
                    activeBlock === 2
                      ? 'border-zinc-600 bg-zinc-800/60'
                      : 'border-zinc-800 bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                    <ListChecks className="w-3.5 h-3.5" />
                    <span>Reading checklist</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2.5 text-zinc-400">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="line-through">Single &amp; double rotation invariants</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-zinc-100">
                      <span className="w-4 h-4 rounded border border-zinc-600 shrink-0" />
                      <span>Complexity proof &amp; practice problems</span>
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
    </section>
  );
}

/* ─── 4. Fee Collection & Ledger Reconciliation (Razorpay) ────────── */

function RazorpayPaymentsStage({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  const [activeMethod, setActiveMethod] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveMethod((prev) => (prev + 1) % 3);
    }, 2600);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const methods = [
    { label: 'UPI & QR', icon: Smartphone },
    { label: 'Cards', icon: CreditCard },
    { label: 'Netbanking', icon: Building2 },
  ];

  return (
    <section className="py-20 sm:py-28 border-t border-zinc-800 bg-[#09090B]">
      <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left Animated Razorpay -> Ledger Flow */}
          <div className="lg:col-span-7 order-2 lg:order-1 min-w-0">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-[#09090B]">
                <div className="flex items-center gap-3">
                  <RazorpayLogo className="w-5 h-5" />
                  <span className="text-sm font-medium text-white">Razorpay</span>
                </div>
                <span className="text-xs text-zinc-500">INR Settlement</span>
              </div>

              <div className="p-6 sm:p-8 grid sm:grid-cols-11 gap-5 items-center">
                {/* Razorpay Checkout Sheet */}
                <div className="sm:col-span-5 rounded-xl border border-zinc-800 bg-[#09090B] p-5 space-y-3">
                  <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">
                    Payment method
                  </p>
                  {methods.map((method, idx) => {
                    const Icon = method.icon;
                    const selected = activeMethod === idx;
                    return (
                      <div
                        key={method.label}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm transition-all duration-300 ${
                          selected
                            ? 'border-sky-500/50 bg-sky-500/10 text-white'
                            : 'border-zinc-800 bg-zinc-900/40 text-zinc-400'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${selected ? 'text-sky-400' : 'text-zinc-500'}`} />
                          {method.label}
                        </span>
                        {selected && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
                      </div>
                    );
                  })}
                </div>

                {/* Animated Settlement Pulse Beam */}
                <div className="hidden sm:flex sm:col-span-1 items-center justify-center" aria-hidden="true">
                  <div className="relative w-full h-0.5 bg-zinc-800 overflow-hidden rounded-full">
                    {!prefersReducedMotion && (
                      <motion.div
                        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-sky-400 to-emerald-400"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                  </div>
                </div>

                {/* EduPulse Ledger */}
                <div className="sm:col-span-5 rounded-xl border border-zinc-800 bg-[#09090B] p-5 space-y-3">
                  <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">
                    Fee ledger
                  </p>
                  {['Tuition Fee', 'Hostel & Mess', 'Exam Registration'].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-sm text-zinc-200"
                    >
                      <span>{item}</span>
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Copy */}
          <div className="lg:col-span-5 order-1 lg:order-2 min-w-0">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <RazorpayLogo className="w-5 h-5" />
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">
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
                'Native INR checkout with UPI, cards, and netbanking',
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

/* ─── Combined Export ─────────────────────────────────────────────── */

export default function IntegrationsSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <LiveClassStage prefersReducedMotion={prefersReducedMotion} />
      <FleetMapsStage prefersReducedMotion={prefersReducedMotion} />
      <NotionNotesStage prefersReducedMotion={prefersReducedMotion} />
      <RazorpayPaymentsStage prefersReducedMotion={prefersReducedMotion} />
    </>
  );
}
