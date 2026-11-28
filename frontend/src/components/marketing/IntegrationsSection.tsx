import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Check,
  Mic,
  Video,
  Users,
  Navigation,
  MapPin,
  ShieldCheck,
  Sparkles,
  CreditCard,
  CheckCircle2,
  Clock,
  FileText,
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
    domain: string;
    badge: string;
    accent: string;
    roomCode: string;
    logo: React.ReactNode;
  }
> = {
  meet: {
    name: 'Google Meet',
    domain: 'meet.google.com/edu-cs301-a',
    badge: 'HD · Workspace Sync',
    accent: '#00AC47',
    roomCode: 'edu-cs301-a',
    logo: <GoogleMeetLogo className="w-5 h-5" />,
  },
  zoom: {
    name: 'Zoom',
    domain: 'zoom.us/j/94820194812',
    badge: 'HD · Cloud Recorded',
    accent: '#0B5CFF',
    roomCode: '948 2019 4812',
    logo: <ZoomLogo className="w-5 h-5" />,
  },
  jitsi: {
    name: 'Jitsi Meet',
    domain: 'meet.jit.si/edupulse-cse-a',
    badge: 'E2EE · Open Source',
    accent: '#17A0DB',
    roomCode: 'edupulse-cse-a',
    logo: <JitsiLogo className="w-5 h-5" />,
  },
};

function LiveClassStage({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  const [provider, setProvider] = useState<VideoProviderId>('meet');
  const [elapsedSeconds, setElapsedSeconds] = useState(1462); // 24:22
  const [activeSpeaker, setActiveSpeaker] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    const speakerTimer = setInterval(() => {
      setActiveSpeaker((prev) => (prev + 1) % 3);
    }, 3200);
    return () => {
      clearInterval(timer);
      clearInterval(speakerTimer);
    };
  }, [prefersReducedMotion]);

  const current = VIDEO_PROVIDERS[provider];
  const mins = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const secs = String(elapsedSeconds % 60).padStart(2, '0');

  return (
    <section
      id="integrations"
      className="py-20 sm:py-28 border-t border-zinc-800 bg-zinc-950/60"
    >
      <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
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
              from your academic schedule. Student attendance is captured automatically
              the moment they join.
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
                    className={`inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                      selected
                        ? 'bg-zinc-900 border-zinc-600 text-white shadow-sm'
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
                'Auto-provisioned join links inside every student timetable',
                'Real-time attendance sync back to section registers',
                'Works seamlessly with Google Meet, Zoom, and Jitsi Meet',
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Animated Video Classroom Stage */}
          <div className="lg:col-span-7 min-w-0">
            <div className="rounded-xl border border-zinc-800 bg-[#09090B] overflow-hidden shadow-2xl">
              {/* Top Window Chrome */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                    {current.logo}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">
                        CS-301 · Data Structures &amp; Algorithms
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live
                      </span>
                    </div>
                    <p className="text-xs font-mono text-zinc-500 truncate">
                      {current.domain}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono text-zinc-400 px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900">
                    {mins}:{secs}
                  </span>
                  <span className="hidden sm:inline-flex text-[11px] font-mono text-zinc-400 px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900">
                    {current.badge}
                  </span>
                </div>
              </div>

              {/* Video Stage Grid */}
              <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                {/* Main Presenter Tile */}
                <div className="sm:col-span-8 relative rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 min-h-[230px] sm:min-h-[260px] flex flex-col justify-between overflow-hidden">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{
                      background: `radial-gradient(circle at 30% 25%, ${current.accent}, transparent 65%)`,
                    }}
                  />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-300 bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 rounded-md">
                      <Video className="w-3.5 h-3.5 text-zinc-400" />
                      Faculty Presenter
                    </span>
                    {/* Live Audio Waveform */}
                    <div className="flex items-end gap-1 h-4 px-2 py-1 rounded bg-zinc-950/80 border border-zinc-800" aria-hidden="true">
                      {[0.4, 0.9, 0.6, 1, 0.5].map((scale, idx) => (
                        <motion.span
                          key={idx}
                          className="w-0.5 rounded-full"
                          style={{ backgroundColor: current.accent }}
                          animate={
                            prefersReducedMotion
                              ? { height: '10px' }
                              : { height: ['4px', `${Math.round(scale * 13)}px`, '5px'] }
                          }
                          transition={{
                            duration: 0.75 + idx * 0.12,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Center Slide Preview inside Call */}
                  <div className="relative z-10 my-4 rounded-md border border-zinc-800/90 bg-[#09090B]/90 p-3.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-2">
                      <span>SCREEN SHARE · SLIDE 14</span>
                      <span>CSE-A (58 / 60 PRESENT)</span>
                    </div>
                    <p className="text-sm font-medium text-zinc-100 mb-1.5">
                      Balanced Search Trees &amp; O(log n) Guarantees
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-2.5">
                      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full w-4/5 rounded-full" style={{ backgroundColor: current.accent }} />
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-800" />
                      <div className="h-1.5 rounded-full bg-zinc-800" />
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center justify-between text-xs text-zinc-300">
                    <span className="font-medium">Prof. Ananya Nair</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Auto-attendance active
                    </span>
                  </div>
                </div>

                {/* Right Student Tiles */}
                <div className="sm:col-span-4 grid grid-cols-2 sm:grid-cols-1 gap-3">
                  {[
                    { name: 'Aarav Sharma', roll: '23CS001', initials: 'AS' },
                    { name: 'Diya Mehta', roll: '23CS002', initials: 'DM' },
                    { name: 'Rohan Iyer', roll: '23CS014', initials: 'RI' },
                  ].map((student, idx) => {
                    const speaking = activeSpeaker === idx;
                    return (
                      <div
                        key={student.roll}
                        className={`rounded-lg border p-3 flex items-center justify-between transition-colors ${
                          speaking
                            ? 'border-emerald-500/50 bg-zinc-900/90'
                            : 'border-zinc-800 bg-zinc-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-medium text-white shrink-0">
                            {student.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-zinc-100 truncate">
                              {student.name}
                            </p>
                            <p className="text-[11px] font-mono text-zinc-500">
                              {student.roll}
                            </p>
                          </div>
                        </div>
                        <Mic
                          className={`w-3.5 h-3.5 shrink-0 ${
                            speaking ? 'text-emerald-400' : 'text-zinc-600'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Call Control Bar */}
              <div className="px-4 sm:px-5 py-3 border-t border-zinc-800 bg-zinc-950/90 flex items-center justify-between gap-4 text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-zinc-300">
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                    58 joined
                  </span>
                  <span className="hidden sm:inline text-zinc-700">|</span>
                  <span className="hidden sm:inline">Room: {current.roomCode}</span>
                </div>
                <span className="text-emerald-400">
                  Attendance synced to EduPulse Register
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 2. Real-Time Vehicle & Fleet Routing (Google Maps) ──────────── */

const BUS_STOPS = [
  { name: 'Sector 14 Chowk', eta: 'Departed 08:12', status: 'done' },
  { name: 'Metro Hub Station', eta: 'Arriving in 3 min', status: 'current' },
  { name: 'Main Campus Gate 1', eta: 'ETA 08:32', status: 'upcoming' },
];

function FleetMapsStage({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  return (
    <section className="py-20 sm:py-28 border-t border-zinc-800 bg-[#09090B]">
      <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Animated Live Map Stage */}
          <div className="lg:col-span-7 order-2 lg:order-1 min-w-0">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
              {/* Map Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-zinc-800 bg-[#09090B]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <GoogleMapsLogo className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Route 04 · West Corridor Express
                    </p>
                    <p className="text-xs font-mono text-zinc-500">
                      Google Maps Live Telemetry · Bus KA-01-EP-4092
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Navigation className="w-3 h-3" />
                  34 km/h · En Route
                </span>
              </div>

              {/* Interactive Vector Map Canvas */}
              <div className="relative h-[280px] sm:h-[320px] bg-[#0B0F17] overflow-hidden">
                {/* Dark Map Street Grid */}
                <svg
                  viewBox="0 0 640 320"
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMid slice"
                  aria-hidden="true"
                >
                  <defs>
                    <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth="1" />
                    </pattern>
                    <linearGradient id="route-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#34A853" />
                      <stop offset="55%" stopColor="#4285F4" />
                      <stop offset="100%" stopColor="#FBBC04" />
                    </linearGradient>
                  </defs>

                  <rect width="640" height="320" fill="url(#map-grid)" />

                  {/* Secondary Roads */}
                  <path
                    d="M0 95 L640 130 M0 235 L640 195 M160 0 L190 320 M430 0 L405 320"
                    stroke="rgba(148,163,184,0.12)"
                    strokeWidth="6"
                    fill="none"
                  />

                  {/* Planned Route Track */}
                  <path
                    d="M 70 250 C 155 245, 175 140, 295 145 C 400 150, 445 75, 555 82"
                    stroke="rgba(66, 133, 244, 0.22)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 70 250 C 155 245, 175 140, 295 145 C 400 150, 445 75, 555 82"
                    stroke="url(#route-grad)"
                    strokeWidth="3.5"
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Stop 1: Sector 14 */}
                  <circle cx="70" cy="250" r="6" fill="#34A853" stroke="#0B0F17" strokeWidth="2.5" />
                  <text x="58" y="276" fill="#94A3B8" fontSize="11" fontFamily="monospace">
                    Sector 14
                  </text>

                  {/* Stop 2: Metro Hub */}
                  <circle cx="315" cy="145" r="7" fill="#4285F4" stroke="#0B0F17" strokeWidth="2.5" />
                  <text x="278" y="172" fill="#E2E8F0" fontSize="11" fontFamily="monospace">
                    Metro Hub
                  </text>

                  {/* Stop 3: Main Campus */}
                  <circle cx="555" cy="82" r="8" fill="#EA4335" stroke="#0B0F17" strokeWidth="2.5" />
                  <text x="488" y="64" fill="#F8FAFC" fontSize="11" fontFamily="monospace">
                    Main Campus
                  </text>

                  {/* Animated Bus Marker */}
                  <motion.g
                    animate={
                      prefersReducedMotion
                        ? { x: 265, y: 146 }
                        : {
                            x: [70, 175, 295, 425, 555, 70],
                            y: [250, 190, 145, 112, 82, 250],
                          }
                    }
                    transition={{
                      duration: 14,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <circle cx="0" cy="0" r="18" fill="rgba(66,133,244,0.22)" />
                    <circle cx="0" cy="0" r="9" fill="#4285F4" stroke="#FFFFFF" strokeWidth="2.5" />
                  </motion.g>
                </svg>

                {/* Floating Live Telemetry Card */}
                <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:w-72 rounded-lg border border-zinc-800 bg-[#09090B]/95 backdrop-blur-md p-3.5">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-medium text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      Next Stop: Metro Hub
                    </span>
                    <span className="font-mono text-emerald-400">3 min</span>
                  </div>
                  <div className="space-y-1.5">
                    {BUS_STOPS.map((stop) => (
                      <div key={stop.name} className="flex items-center justify-between text-[11px]">
                        <span
                          className={
                            stop.status === 'current'
                              ? 'text-white font-medium'
                              : 'text-zinc-400'
                          }
                        >
                          {stop.name}
                        </span>
                        <span className="font-mono text-zinc-500">{stop.eta}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Copy */}
          <div className="lg:col-span-5 order-1 lg:order-2 min-w-0">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <GoogleMapsLogo className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">
                Google Maps · Fleet Routing
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Live vehicle routing from gate to doorstep.
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-7">
              Power your campus transport desk with real-time Google Maps route
              tracking. Dispatchers monitor bus locations, optimize stop sequences,
              and notify parents automatically before pickup.
            </p>

            <ul className="space-y-3 border-t border-zinc-800 pt-6">
              {[
                'Live GPS route plotting and stop-by-stop ETA alerts',
                'Student transport pass mapping per bus and shift',
                'Instant delay notifications pushed to guardian portals',
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-300">
                  <Check className="w-4 h-4 text-sky-400 shrink-0 mt-1" />
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

/* ─── 3. Live Class Notes & Study Spaces (Notion) ─────────────────── */

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
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Copy */}
          <div className="lg:col-span-5 min-w-0">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <NotionLogo className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">
                Notion · Live Class Notes
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Every lecture turns into structured Notion notes.
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-7">
              Sync course syllabi, live whiteboard notes, code blocks, and lab
              assignments straight to Notion workspaces — organized automatically by
              department, semester, and section.
            </p>

            <ul className="space-y-3 border-t border-zinc-800 pt-6">
              {[
                'Real-time collaborative lecture notes during live classes',
                'Rich code snippets, formulas, and reading checklists',
                'Section-scoped permissions synced with student enrollment',
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-300">
                  <Check className="w-4 h-4 text-zinc-300 shrink-0 mt-1" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Animated Notion Workspace Stage */}
          <div className="lg:col-span-7 min-w-0">
            <div className="rounded-xl border border-zinc-800 bg-[#141417] overflow-hidden shadow-2xl">
              {/* Notion Top Bar */}
              <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-zinc-800 bg-[#19191D]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <NotionLogo className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-mono text-zinc-400 truncate">
                    CS-301 / Week 06 / Lecture 12 — AVL Rotations
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 px-2 py-0.5 rounded bg-zinc-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    24 reading
                  </span>
                </div>
              </div>

              {/* Notion Document Canvas */}
              <div className="p-5 sm:p-7 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Synced with Live Class · CSE-A</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  AVL Tree Rebalancing &amp; Rotation Proofs
                </h3>

                {/* Block 1: Callout */}
                <div
                  className={`rounded-lg border p-3.5 transition-all duration-300 ${
                    activeBlock === 0
                      ? 'border-zinc-500 bg-zinc-900/90'
                      : 'border-zinc-800 bg-zinc-900/40'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                        Key Takeaway
                      </p>
                      <p className="text-sm text-zinc-200 leading-relaxed">
                        Every insertion or deletion preserves{' '}
                        <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-100 text-xs">
                          |height(L) - height(R)| &lt;= 1
                        </code>{' '}
                        in O(log n) worst-case time.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Block 2: Code Block */}
                <div
                  className={`rounded-lg border p-3.5 font-mono text-xs transition-all duration-300 ${
                    activeBlock === 1
                      ? 'border-zinc-500 bg-[#09090B]'
                      : 'border-zinc-800 bg-[#09090B]/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-2">
                    <span>typescript</span>
                    <span>live-notes.ts</span>
                  </div>
                  <pre className="text-zinc-300 overflow-x-auto leading-relaxed">
                    <code>{`function balanceFactor(node: TreeNode | null): number {\n  return node ? height(node.left) - height(node.right) : 0;\n}`}</code>
                  </pre>
                </div>

                {/* Block 3: Live Checklist */}
                <div
                  className={`rounded-lg border p-3.5 transition-all duration-300 ${
                    activeBlock === 2
                      ? 'border-zinc-500 bg-zinc-900/90'
                      : 'border-zinc-800 bg-zinc-900/40'
                  }`}
                >
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2.5 text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="line-through text-zinc-500">
                        Derive LL and RR single rotation invariants
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-white">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        Complete Lab Sheet #04 before Friday 18:00
                      </span>
                      {!prefersReducedMotion && (
                        <motion.span
                          aria-hidden="true"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.9, repeat: Infinity }}
                          className="inline-block w-0.5 h-4 bg-amber-400"
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

const PAYMENT_STEPS = [
  { label: 'UPI Intent Initiated', detail: 'Student Fee Portal -> Razorpay' },
  { label: 'Payment Authorized', detail: 'Instant UPI / Card verification' },
  { label: 'Ledger Reconciled', detail: 'Receipt #EP-9042 posted to ERP' },
];

function RazorpayPaymentsStage({ prefersReducedMotion }: { prefersReducedMotion: boolean | null }) {
  const [stepIdx, setStepIdx] = useState(2);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setStepIdx((prev) => (prev + 1) % PAYMENT_STEPS.length);
    }, 2600);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <section className="py-20 sm:py-28 border-t border-zinc-800 bg-[#09090B]">
      <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Animated Razorpay -> Ledger Pipeline */}
          <div className="lg:col-span-7 order-2 lg:order-1 min-w-0">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-zinc-800 bg-[#09090B]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <RazorpayLogo className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Razorpay Checkout &rarr; EduPulse Fee Ledger
                    </p>
                    <p className="text-xs font-mono text-zinc-500">
                      Automated INR Settlement &amp; Receipting
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-sky-400 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  PCI-DSS
                </span>
              </div>

              <div className="p-5 sm:p-6 grid sm:grid-cols-2 gap-4 items-stretch">
                {/* Razorpay Payment Card */}
                <div className="rounded-lg border border-zinc-800 bg-[#09090B] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                        Checkout
                      </span>
                      <span className="text-xs font-mono text-sky-400">
                        UPI · Cards · NetBanking
                      </span>
                    </div>
                    <p className="text-sm font-medium text-white mb-1">
                      Semester Tuition &amp; Hostel Invoice
                    </p>
                    <p className="text-xs text-zinc-400 mb-4">
                      Roll #23CS001 · B.Tech Computer Science
                    </p>
                  </div>

                  <div className="space-y-2">
                    {PAYMENT_STEPS.map((step, i) => {
                      const active = i <= stepIdx;
                      return (
                        <div
                          key={step.label}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-md border text-xs transition-all duration-300 ${
                            active
                              ? 'border-sky-500/40 bg-sky-500/10 text-white'
                              : 'border-zinc-800 bg-zinc-900/40 text-zinc-500'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{step.label}</p>
                            <p className="text-[10px] font-mono text-zinc-400 truncate">
                              {step.detail}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Live Reconciled ERP Ledger Card */}
                <div className="rounded-lg border border-zinc-800 bg-[#09090B] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                        Fee Ledger Sync
                      </span>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-full border transition-colors ${
                          stepIdx === 2
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {stepIdx === 2 ? 'RECONCILED' : 'PROCESSING'}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { head: 'Tuition Fee · Sem IV', mode: 'UPI AutoPay', state: stepIdx === 2 ? 'Paid' : 'Pending' },
                        { head: 'Hostel & Mess Dues', mode: 'Razorpay Card', state: 'Paid' },
                        { head: 'Exam Registration', mode: 'NetBanking', state: 'Paid' },
                      ].map((row) => (
                        <div
                          key={row.head}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-md border border-zinc-800 bg-zinc-900/40"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-zinc-100 truncate">
                              {row.head}
                            </p>
                            <p className="text-[11px] font-mono text-zinc-500">
                              {row.mode}
                            </p>
                          </div>
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                              row.state === 'Paid'
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : 'text-amber-400 bg-amber-500/10'
                            }`}
                          >
                            {row.state}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>Receipt #EP-9042</span>
                    <span className="text-emerald-400">PDF Issued</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Copy */}
          <div className="lg:col-span-5 order-1 lg:order-2 min-w-0">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <RazorpayLogo className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">
                Razorpay · Fee Collection
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white leading-[1.08] mb-5">
              Collect fees in seconds. Reconcile ledgers automatically.
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-7">
              Accept UPI, debit/credit cards, and netbanking through Razorpay with
              zero manual bank statement matching. Every successful payment updates
              the student&apos;s INR fee ledger and issues an instant receipt.
            </p>

            <ul className="space-y-3 border-t border-zinc-800 pt-6">
              {[
                'Native INR checkout with UPI QR, cards, and netbanking',
                'Automatic fee-head reconciliation and PDF receipt generation',
                'Real-time settlement tracking for finance and accounts teams',
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-300">
                  <Check className="w-4 h-4 text-sky-400 shrink-0 mt-1" />
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
