import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVideo } from '../../context/VideoContext';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';
import {
  Copy,
  PhoneOff,
  Maximize2,
  Check,
  ExternalLink,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  ScreenShare,
  Hand,
  MessageSquare,
  Users,
  Send,
  X,
  ShieldCheck,
  Monitor
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  role: 'INSTRUCTOR' | 'STUDENT';
  text: string;
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'Dr. Aris Thorne',
    role: 'INSTRUCTOR',
    text: 'Welcome everyone. Today we are diving into Raft Consensus and distributed state machines.',
    time: '10:02 AM'
  },
  {
    id: 'm2',
    sender: 'Aarav Sharma',
    role: 'STUDENT',
    text: 'Sir, are the slide decks already synchronized on the Notion Faculty Notes portal?',
    time: '10:05 AM'
  },
  {
    id: 'm3',
    sender: 'Dr. Aris Thorne',
    role: 'INSTRUCTOR',
    text: 'Yes Aarav, the markdown blocks are live under CS-302 notes.',
    time: '10:06 AM'
  }
];

export const ClassroomCallOverlay: React.FC = () => {
  const { activeSession, leaveSession } = useVideo();
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Control states
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [activeView, setActiveView] = useState<'stage' | 'grid'>('stage');
  const [secondsElapsed, setSecondsElapsed] = useState(1450); // ~24 mins

  // In-call chat
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  if (!activeSession) return null;

  const isClassroomRoute =
    location.pathname === '/dashboard/classroom' ||
    location.pathname === '/dashboard/academic/classroom' ||
    location.pathname === '/portal/classroom';

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    const link = `https://meet.jit.si/${activeSession.roomName}`;
    navigator.clipboard?.writeText(link);
    setCopied(true);
    toast.success('Lecture URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenExternal = () => {
    const url = `https://meet.jit.si/${activeSession.roomName}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.info('Opened live room in external web browser');
  };

  const handleLeave = () => {
    leaveSession();
    toast.info('Left virtual classroom session');
  };

  const handleExpand = () => {
    if (location.pathname.startsWith('/portal')) {
      navigate('/portal/classroom');
    } else {
      navigate('/dashboard/classroom');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: user?.username || 'You',
      role: user?.role === 'STUDENT' ? 'STUDENT' : 'INSTRUCTOR',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  const toggleHandRaise = () => {
    setIsHandRaised((prev) => {
      const next = !prev;
      if (next) {
        toast.info('Hand raised. Instructor notified.');
      }
      return next;
    });
  };

  // FULL SCREEN CLASSROOM VIEW
  if (isClassroomRoute) {
    return (
      <div
        data-testid="jitsi-full-classroom"
        className="w-full h-full flex-1 flex flex-col bg-slate-950 min-h-[640px] relative z-10 select-none"
      >
        {/* Top Control Header Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-white shrink-0 backdrop-blur-md">
          <div className="flex items-center space-x-3 truncate">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="truncate">
              <span className="text-xs font-bold text-white tracking-wide">
                {activeSession.courseCode}: {activeSession.title || activeSession.courseName || 'Live Lecture'}
              </span>
              <span className="hidden sm:inline text-xs text-slate-500 mx-2">•</span>
              <span className="hidden sm:inline text-xs text-slate-400 font-mono">
                {activeSession.roomName}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-[10px] font-mono text-indigo-300">
              <ShieldCheck className="w-3 h-3 text-indigo-400" /> WebRTC E2EE
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* View Switcher */}
            <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setActiveView('stage')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  activeView === 'stage' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Presentation Stage
              </button>
              <button
                onClick={() => setActiveView('grid')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  activeView === 'grid' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Participant Grid
              </button>
            </div>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              title="Copy session link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleOpenExternal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              title="Open full browser window"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Open in Browser</span>
            </button>

            <button
              onClick={handleLeave}
              data-testid="jitsi-hangup-btn"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Leave</span>
            </button>
          </div>
        </div>

        {/* Main Stage & Right Panel Split */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Central Live Video Presentation Canvas */}
          <div className="flex-1 flex flex-col p-3 sm:p-4 bg-slate-950 overflow-hidden relative">
            {activeView === 'stage' ? (
              <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0">
                {/* Main Shared Screen / Presentation Board */}
                <div className="flex-1 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col relative shadow-2xl">
                  {/* Presentation Header */}
                  <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-semibold text-slate-200">
                        Dr. Aris Thorne is presenting: Lecture Slide Deck (Term 5)
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      1080p 60fps WebRTC
                    </span>
                  </div>

                  {/* High-Fidelity Lecture Canvas Graphic */}
                  <div className="flex-1 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-950 p-6 flex flex-col justify-between relative overflow-hidden font-mono text-xs text-slate-300">
                    <div className="space-y-4 max-w-2xl relative z-10">
                      <div className="inline-block px-3 py-1 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold tracking-wide">
                        MODULE 4: DISTRIBUTED REPLICATION &amp; CONSENSUS
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-sans">
                        Raft Protocol: Leader Election, Heartbeats &amp; Log Compaction
                      </h2>
                      <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800 space-y-2 text-slate-300 font-mono text-[11px]">
                        <p className="text-emerald-400">// Raft Consensus Term Heartbeat RPC</p>
                        <p className="text-slate-400">
                          <span className="text-purple-400">async fn</span> <span className="text-amber-300">append_entries</span>(term: <span className="text-cyan-400">u64</span>, leader_id: <span className="text-cyan-400">NodeId</span>) -&gt; <span className="text-cyan-400">Result&lt;Response&gt;</span> &#123;
                        </p>
                        <p className="pl-4 text-slate-300">
                          <span className="text-purple-400">if</span> term &lt; current_term &#123; <span className="text-purple-400">return</span> <span className="text-rose-400">Err</span>(StaleTerm); &#125;
                        </p>
                        <p className="pl-4 text-slate-300">
                          reset_election_timer(); <span className="text-emerald-500">// Heartbeat verified from canonical coordinator</span>
                        </p>
                        <p className="text-slate-400">&#125;</p>
                      </div>
                    </div>

                    {/* Bottom Slide Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
                      <span>Department of Computer Science &bull; EduPulse Enterprise Edition</span>
                      <span>Slide 18 of 42</span>
                    </div>

                    {/* Subtle Background Circuit Mesh */}
                    <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
                  </div>
                </div>

                {/* Right Side Video Feeds (Instructor + Students) */}
                <div className="w-full md:w-64 flex flex-row md:flex-col gap-2.5 shrink-0 overflow-y-auto">
                  {/* Instructor Tile */}
                  <div className="flex-1 md:flex-none h-36 md:h-44 rounded-xl overflow-hidden bg-slate-900 border-2 border-emerald-500 relative shadow-md">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                      alt="Dr. Aris Thorne"
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-white border border-slate-700/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      INSTRUCTOR
                    </div>
                    <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-slate-950">
                      <Mic className="w-3 h-3" />
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                      <span className="text-xs font-bold text-white truncate drop-shadow">
                        Dr. Aris Thorne
                      </span>
                      <div className="flex items-center gap-0.5 text-emerald-400">
                        <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse delay-75" />
                        <span className="w-1 h-1.5 bg-emerald-400 rounded-full animate-pulse delay-150" />
                      </div>
                    </div>
                  </div>

                  {/* Student Aarav Sharma */}
                  <div className="flex-1 md:flex-none h-36 md:h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative shadow-md">
                    <img
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80"
                      alt="Aarav Sharma"
                      className="absolute inset-0 w-full h-full object-cover opacity-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
                    <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-300 bg-slate-950/80 px-1.5 py-0.5 rounded">
                      23CSM001
                    </div>
                    <div className="absolute top-2 right-2 p-1 rounded-full bg-slate-800/90 text-slate-400">
                      <MicOff className="w-3 h-3" />
                    </div>
                    <div className="absolute bottom-2 left-2 text-xs font-semibold text-white drop-shadow">
                      Aarav Sharma
                    </div>
                  </div>

                  {/* Self Tile (Local User) */}
                  <div className="flex-1 md:flex-none h-36 md:h-36 rounded-xl overflow-hidden bg-slate-900 border border-indigo-600/60 relative shadow-md">
                    {!isCameraOff ? (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center relative">
                        <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                          {user?.username?.substring(0, 2).toUpperCase() || 'YOU'}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-500">
                        <VideoOff className="w-6 h-6 mb-1 text-slate-600" />
                        <span className="text-[10px]">Camera Off</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 text-[10px] font-bold text-indigo-300 bg-indigo-950/90 px-1.5 py-0.5 rounded border border-indigo-800/80">
                      YOU (Active)
                    </div>
                    <div className="absolute top-2 right-2 p-1 rounded-full bg-slate-800/90 text-slate-300">
                      {isMuted ? <MicOff className="w-3 h-3 text-rose-400" /> : <Mic className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <div className="absolute bottom-2 left-2 text-xs font-semibold text-white">
                      {user?.username || 'You'} {isHandRaised && '✋'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Multi-Participant Grid View */
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3 min-h-0 overflow-y-auto">
                {/* 6 participant tiles */}
                <div className="rounded-xl overflow-hidden bg-slate-900 border-2 border-emerald-500 relative min-h-[160px]">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                    alt="Dr. Aris Thorne"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute bottom-2 left-2 text-xs font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded">
                    Dr. Aris Thorne (Instructor)
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative min-h-[160px]">
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80"
                    alt="Aarav Sharma"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute bottom-2 left-2 text-xs font-semibold text-white bg-slate-950/80 px-2 py-0.5 rounded">
                    Aarav Sharma (23CSM001)
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative min-h-[160px]">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80"
                    alt="Sophia Chen"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute bottom-2 left-2 text-xs font-semibold text-white bg-slate-950/80 px-2 py-0.5 rounded">
                    Sophia Chen
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative min-h-[160px]">
                  <img
                    src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80"
                    alt="Aanya Patel"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute bottom-2 left-2 text-xs font-semibold text-white bg-slate-950/80 px-2 py-0.5 rounded">
                    Aanya Patel
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative min-h-[160px]">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                    alt="Prof. David Miller"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute bottom-2 left-2 text-xs font-semibold text-white bg-slate-950/80 px-2 py-0.5 rounded">
                    Prof. David Miller
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden bg-slate-900 border border-indigo-600 relative min-h-[160px] flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                    {user?.username?.substring(0, 2).toUpperCase() || 'YOU'}
                  </div>
                  <div className="absolute bottom-2 left-2 text-xs font-bold text-white bg-slate-950/80 px-2 py-0.5 rounded">
                    {user?.username || 'You'} (You)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible In-Call Chat Drawer */}
          {isChatOpen && (
            <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col shrink-0">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-white">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>In-Call Messages</span>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                {messages.map((m) => (
                  <div key={m.id} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-300">{m.sender}</span>
                      <span>{m.time}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-800/90 text-slate-200 border border-slate-700/60 leading-relaxed">
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-2.5 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Send a message to class..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Collapsible Roster Drawer */}
          {isRosterOpen && (
            <div className="w-72 border-l border-slate-800 bg-slate-900 flex flex-col shrink-0 text-xs">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between font-bold text-white">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Participants (48)</span>
                </div>
                <button
                  onClick={() => setIsRosterOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-2">
                <div className="flex items-center justify-between p-2 rounded bg-slate-800/60">
                  <span className="font-semibold text-white">Dr. Aris Thorne (Host)</span>
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                  <span className="text-slate-300">Aarav Sharma (23CSM001)</span>
                  <MicOff className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                  <span className="text-slate-300">Sophia Chen</span>
                  <MicOff className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                  <span className="text-slate-300">Aanya Patel</span>
                  <MicOff className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-800/40">
                  <span className="text-slate-300">Diya Mehta</span>
                  <MicOff className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-indigo-950/60 border border-indigo-800/60 text-indigo-200">
                  <span className="font-semibold">{user?.username || 'You'} (You)</span>
                  {isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Hardware & Call Control Dock */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
          {/* Left Timer / Status */}
          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Time in Session: {formatTimer(secondsElapsed)}</span>
          </div>

          {/* Center Action Dock */}
          <div className="flex items-center gap-3 mx-auto sm:mx-0">
            {/* Mic Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-full transition shadow-md cursor-pointer ${
                isMuted
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Camera Toggle */}
            <button
              onClick={() => setIsCameraOff(!isCameraOff)}
              className={`p-3 rounded-full transition shadow-md cursor-pointer ${
                isCameraOff
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
              title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
            >
              {isCameraOff ? <VideoOff className="w-4 h-4" /> : <VideoIcon className="w-4 h-4" />}
            </button>

            {/* Screen Share */}
            <button
              onClick={() => {
                setIsScreenSharing(!isScreenSharing);
                toast.info(isScreenSharing ? 'Screen sharing stopped' : 'Screen sharing active');
              }}
              className={`p-3 rounded-full transition shadow-md cursor-pointer ${
                isScreenSharing
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
              title="Toggle screen share"
            >
              <ScreenShare className="w-4 h-4" />
            </button>

            {/* Raise Hand */}
            <button
              onClick={toggleHandRaise}
              className={`p-3 rounded-full transition shadow-md cursor-pointer ${
                isHandRaised
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
              title="Raise hand"
            >
              <Hand className="w-4 h-4" />
            </button>

            {/* Leave Call */}
            <button
              onClick={handleLeave}
              className="p-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md cursor-pointer transition"
              title="Leave classroom"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsChatOpen(!isChatOpen);
                if (isRosterOpen) setIsRosterOpen(false);
              }}
              className={`p-2.5 rounded-lg border transition cursor-pointer ${
                isChatOpen
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Toggle chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setIsRosterOpen(!isRosterOpen);
                if (isChatOpen) setIsChatOpen(false);
              }}
              className={`p-2.5 rounded-lg border transition cursor-pointer ${
                isRosterOpen
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Participants list"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FLOATING PICTURE-IN-PICTURE (PiP) WINDOW WHEN BROWSING OUTSIDE CLASSROOM
  return (
    <div
      data-testid="jitsi-persistent-container"
      className="fixed bottom-6 right-6 w-[420px] h-[280px] rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-700 bg-slate-950 flex flex-col select-none"
    >
      {/* Floating PiP Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-3.5 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs font-semibold text-slate-200 truncate">
            {activeSession.courseCode} — {activeSession.title || activeSession.courseName || 'Live Lecture'}
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
            PiP
          </span>
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={handleExpand}
            title="Expand to Full Classroom View"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleLeave}
            title="Leave Session"
            className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/50 transition-colors cursor-pointer"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PiP Active Speaker Tile */}
      <div className="w-full flex-1 relative bg-slate-950 overflow-hidden flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
          alt="Instructor presentation"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-mono border border-slate-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Dr. Aris Thorne (Speaking)
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs text-white">
          <span className="font-semibold text-[11px] drop-shadow">Module 4: Raft Consensus</span>
          <button
            onClick={handleExpand}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
          >
            Click to expand
          </button>
        </div>
      </div>
    </div>
  );
};
