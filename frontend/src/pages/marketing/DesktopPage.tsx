import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Monitor,
  Download,
  ShieldCheck,
  Check,
  Copy,
  X,
  FileText,
  ExternalLink,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import MarketingLayout from '../../components/marketing/MarketingLayout';

const GITHUB_RELEASES_BASE =
  'https://github.com/CodeTillEternity/Edupulse_ERP/releases/latest';

const INSTALLERS = {
  exe: {
    label: 'Windows Installer (.exe)',
    filename: 'EduPulse.ERP_1.0.0_x64-setup.exe',
    url: `${GITHUB_RELEASES_BASE}/download/EduPulse.ERP_1.0.0_x64-setup.exe`,
    format: 'NSIS Setup · 64-bit',
  },
  msi: {
    label: 'Windows Enterprise (.msi)',
    filename: 'EduPulse.ERP_1.0.0_x64_en-US.msi',
    url: `${GITHUB_RELEASES_BASE}/download/EduPulse.ERP_1.0.0_x64_en-US.msi`,
    format: 'MSI Package · 64-bit',
  },
} as const;

type InstallerType = keyof typeof INSTALLERS;

const DEMO_ACCOUNTS = [
  { role: 'Admin', username: 'superadmin', password: 'Admin@123', scope: 'Full institutional control' },
  { role: 'Faculty', username: 'faculty', password: 'Faculty@123', scope: 'Sections, attendance & exams' },
  { role: 'Finance', username: 'finance', password: 'Finance@123', scope: 'Fee ledgers & receipts' },
  { role: 'Student', username: 'student', password: 'Student@123', scope: 'Timetable, GPA & fee portal' },
  { role: 'Parent', username: 'parent', password: 'Parent@123', scope: 'Ward attendance & dues' },
];

const EULA_SECTIONS = [
  {
    heading: '1. Grant of License',
    body: 'EduPulse ERP Technologies ("Licensor") grants you a non-exclusive, non-transferable license to install and operate the EduPulse ERP Windows Desktop Edition ("Software") on authorized institutional computers for evaluation, demonstration, or licensed institutional administration.',
  },
  {
    heading: '2. Evaluation & Demo Environment',
    body: 'This release bundles a local institutional runtime seeded with sample academic, student, and financial records. Built-in demo credentials are intended strictly for evaluation and testing.',
  },
  {
    heading: '3. Restrictions',
    body: 'You may not reverse-engineer, decompile, disassemble, redistribute, or remove proprietary notices from the Software except where expressly permitted by applicable law.',
  },
  {
    heading: '4. Tenant Data & Security',
    body: 'When connected to an institutional EduPulse backend, records remain isolated within your institution’s PostgreSQL Row-Level Security (RLS) boundary.',
  },
  {
    heading: '5. Disclaimer of Warranty',
    body: 'The Software is provided "AS IS", without warranty of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement.',
  },
];

export default function DesktopPage() {
  const [pendingInstaller, setPendingInstaller] = useState<InstallerType | null>(null);
  const [acceptedEula, setAcceptedEula] = useState(false);
  const [copiedRole, setCopiedRole] = useState<string | null>(null);
  const [downloadStarted, setDownloadStarted] = useState<InstallerType | null>(null);

  const openEulaModal = (type: InstallerType) => {
    setAcceptedEula(false);
    setPendingInstaller(type);
  };

  const handleConfirmDownload = () => {
    if (!pendingInstaller || !acceptedEula) return;
    const selected = INSTALLERS[pendingInstaller];
    const link = document.createElement('a');
    link.href = selected.url;
    link.download = selected.filename;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadStarted(pendingInstaller);
    setPendingInstaller(null);
  };

  const copyCredentials = async (role: string, username: string, password: string) => {
    try {
      await navigator.clipboard.writeText(`${username} / ${password}`);
      setCopiedRole(role);
      setTimeout(() => setCopiedRole(null), 1800);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-16 pb-14 sm:pt-24 sm:pb-16 border-b border-zinc-800">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">
            <Monitor className="w-3.5 h-3.5" />
            <span>Windows Desktop · v1.0.0 (64-bit)</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-[-0.035em] text-white max-w-3xl leading-[1.08]">
            EduPulse Desktop for Windows
          </h1>
          <p className="mt-5 text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Install the native Windows desktop edition with an embedded local ERP
            engine and pre-seeded demo credentials — ready to evaluate right out
            of the box.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <button
              type="button"
              onClick={() => openEulaModal('exe')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-md bg-white text-zinc-950 text-sm sm:text-base font-medium hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download for Windows (.exe)
            </button>
            <button
              type="button"
              onClick={() => openEulaModal('msi')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-md bg-zinc-900 text-white border border-zinc-800 text-sm sm:text-base font-medium hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Download Enterprise (.msi)
            </button>
            <a
              href={GITHUB_RELEASES_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-3.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Release notes
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {downloadStarted && (
            <div className="mt-6 max-w-xl rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm text-emerald-300 flex items-center justify-between gap-3">
              <span>
                Downloading <strong>{INSTALLERS[downloadStarted].filename}</strong>.
                Run the setup wizard and accept the License Agreement to install.
              </span>
              <a
                href={INSTALLERS[downloadStarted].url}
                className="underline font-medium shrink-0 hover:text-white"
              >
                Retry
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Installer & Runtime Architecture */}
      <section className="py-16 sm:py-20 border-b border-zinc-800 bg-zinc-950/60">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-zinc-800 bg-[#09090B]">
            {[
              {
                title: 'Guided EULA Setup',
                body: 'Native Windows NSIS & MSI installers include the End-User License Agreement and desktop shortcut creation.',
              },
              {
                title: 'Bundled Local ERP',
                body: 'Ships with the embedded institutional backend service so demo workflows run immediately on port 8081.',
              },
              {
                title: 'Native Credential Vault',
                body: 'Uses Windows-native secure token storage alongside role-based session switching.',
              },
              {
                title: 'System Requirements',
                body: 'Windows 10 or Windows 11 (64-bit), Java 21 runtime, and 1280×800 minimum display resolution.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border-r border-b border-zinc-800 p-7 sm:p-8"
              >
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0" />
                  <h2 className="text-base font-medium text-white">{item.title}</h2>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Credentials Matrix */}
      <section className="py-20 sm:py-24">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Built-In Demo Access</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-[-0.03em] text-white">
                Demo credentials for the desktop &amp; web ERP
              </h2>
              <p className="mt-3 text-base text-zinc-400 max-w-2xl">
                Launch EduPulse Desktop (or sign in on the web) and use any of
                the five seeded institutional roles below — or click &ldquo;Use
                Demo Login&rdquo; on the Sign In screen.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-sm font-medium text-white hover:bg-zinc-800 transition-colors shrink-0"
            >
              Open Web Sign In
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 border-t border-l border-zinc-800">
            {DEMO_ACCOUNTS.map((acc) => (
              <div
                key={acc.role}
                className="border-r border-b border-zinc-800 p-6 flex flex-col justify-between bg-zinc-950/40"
              >
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                    {acc.role}
                  </span>
                  <p className="text-sm text-zinc-400 mt-1 mb-4">{acc.scope}</p>
                  <div className="space-y-2 rounded-lg border border-zinc-800 bg-[#09090B] p-3 font-mono text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-zinc-500">User</span>
                      <span className="text-white">{acc.username}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-zinc-500">Pass</span>
                      <span className="text-zinc-200">{acc.password}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyCredentials(acc.role, acc.username, acc.password)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedRole === acc.role ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy credentials
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* End-User License Agreement Modal */}
      {pendingInstaller && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="eula-modal-title"
        >
          <div className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 bg-[#09090B] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-zinc-400" />
                <div>
                  <h3 id="eula-modal-title" className="text-base font-medium text-white">
                    End-User License Agreement
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {INSTALLERS[pendingInstaller].label} · {INSTALLERS[pendingInstaller].format}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingInstaller(null)}
                aria-label="Close license agreement"
                className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable EULA */}
            <div className="p-6 max-h-72 overflow-y-auto space-y-4 bg-[#09090B] border-b border-zinc-800 text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {EULA_SECTIONS.map((section) => (
                <div key={section.heading}>
                  <p className="font-medium text-zinc-200 mb-1">{section.heading}</p>
                  <p>{section.body}</p>
                </div>
              ))}
            </div>

            {/* Acceptance & Download Footer */}
            <div className="p-6 space-y-4 bg-zinc-950">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptedEula}
                  onChange={(e) => setAcceptedEula(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-white cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-zinc-300">
                  I have read and accept the EduPulse ERP End-User License Agreement
                  and understand the bundled demo environment terms.
                </span>
              </label>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPendingInstaller(null)}
                  className="px-4 py-2.5 rounded-md border border-zinc-800 bg-[#09090B] text-sm font-medium text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!acceptedEula}
                  onClick={handleConfirmDownload}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    acceptedEula
                      ? 'bg-white text-zinc-950 hover:bg-zinc-200 cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Accept &amp; Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MarketingLayout>
  );
}
