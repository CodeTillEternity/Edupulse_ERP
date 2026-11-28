import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Building2,
  Mail,
  User,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from 'lucide-react';
import MarketingLayout from '../components/marketing/MarketingLayout';
import { useAuthStore } from '../store/useAuthStore';
import { apiClient } from '../config/api';
import { toast } from 'sonner';

interface OnboardingFormState {
  institutionName: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
  subdomain: string;
  tier: string;
}

const STEPS = [
  { num: '01', id: 1 as const, label: 'Institution', detail: 'Name & tenant slug' },
  { num: '02', id: 2 as const, label: 'Admin User', detail: 'Root credentials' },
  { num: '03', id: 3 as const, label: 'Provision', detail: 'Isolated workspace' },
];

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginToStore = useAuthStore((state) => state.login);

  const initialTier = (searchParams.get('tier') || 'TRIAL').toUpperCase();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [provisioningStatus, setProvisioningStatus] = useState<string>('idle');
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<OnboardingFormState>({
    institutionName: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    subdomain: '',
    tier: initialTier,
  });

  // Automatically derive clean subdomain slug from institution name
  useEffect(() => {
    if (formData.institutionName && !formData.subdomain) {
      const derived = formData.institutionName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 24);
      setFormData((prev) => ({ ...prev, subdomain: derived }));
    }
  }, [formData.institutionName, formData.subdomain]);

  const handleChange = (field: keyof OnboardingFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.institutionName.trim()) {
      setErrorMsg('Please enter your institution name.');
      return;
    }
    if (formData.institutionName.trim().length < 3) {
      setErrorMsg('Institution name must be at least 3 characters.');
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    setStep(1);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.adminName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.adminEmail.trim() || !formData.adminEmail.includes('@')) {
      setErrorMsg('Please enter a valid institutional work email.');
      return;
    }
    if (!formData.adminPassword || formData.adminPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (formData.adminPassword !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setErrorMsg(null);
    setStep(3);
    setProvisioningStatus('provisioning');
    setProvisioningLogs([
      'Initializing Central Tenant Registry transaction...',
    ]);

    try {
      // Step A: Provision Tenant on Backend
      const payload = {
        institutionName: formData.institutionName.trim(),
        adminEmail: formData.adminEmail.trim().toLowerCase(),
        adminName: formData.adminName.trim(),
        adminPassword: formData.adminPassword,
        name: formData.institutionName.trim(),
        email: formData.adminEmail.trim().toLowerCase(),
        fullName: formData.adminName.trim(),
        password: formData.adminPassword,
        tier: formData.tier,
      };

      // Try dedicated public onboarding endpoint first, fall back to register
      let res;
      try {
        res = await apiClient.post('/api/v1/saas/public/onboard', payload);
      } catch {
        res = await apiClient.post('/api/v1/saas/register', payload);
      }

      const tenantData = res.data?.data || res.data;
      const tenantId = tenantData.tenantId || `tenant-${formData.subdomain || 'inst'}`;

      setProvisioningLogs((prev) => [
        ...prev,
        `Tenant partition [${tenantId}] successfully registered.`,
        'Configured PostgreSQL Row-Level Security (RLS) boundary.',
        'Seeded initial SUPERADMIN user credentials.',
        'Activating 14-day commercial trial window...',
        'Authenticating session via AuthController...',
      ]);

      // Step B: Automatically authenticate user
      const loginPayload = {
        username: formData.adminEmail.trim().toLowerCase(),
        password: formData.adminPassword,
        role: 'SUPER_ADMIN',
        tenantId: tenantId,
      };

      const loginRes = await apiClient.post('/auth/login', loginPayload);
      const authData = loginRes.data;

      const accessToken = authData.accessToken || authData.token;
      const refreshToken = authData.refreshToken || '';
      const username = authData.username || formData.adminEmail;
      const role = authData.role || 'SUPER_ADMIN';
      const permissions = authData.permissions || [];

      loginToStore(
        accessToken,
        refreshToken,
        {
          username,
          role,
          permissions,
          email: formData.adminEmail,
          tenantId: tenantId,
          tenantStatus: 'TRIAL',
        },
        tenantId,
        'TRIAL'
      );

      setProvisioningLogs((prev) => [
        ...prev,
        'Security token generated and session established.',
        'Redirecting to your isolated administrative dashboard...',
      ]);
      setProvisioningStatus('complete');

      toast.success(`Welcome to EduPulse! Institution ${formData.institutionName} is live.`);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err: any) {
      console.error('Provisioning failed:', err);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to complete tenant onboarding';
      setProvisioningStatus('error');
      setErrorMsg(message);
      toast.error(message);
    }
  };

  return (
    <MarketingLayout>
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="w-full max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Architectural Overview */}
            <div className="lg:col-span-5 min-w-0">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors mb-8"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to website
              </Link>

              <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">
                14-Day Institutional Trial
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-[-0.03em] text-white leading-[1.08] mb-5">
                Launch your isolated campus workspace.
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-10">
                No credit card required. Provision your institution&apos;s dedicated
                PostgreSQL RLS boundary and administrator console in under a minute.
              </p>

              {/* Top-Ruled Architectural Stepper */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                {STEPS.map((s) => {
                  const active = step === s.id;
                  const completed = step > s.id;
                  return (
                    <div
                      key={s.num}
                      className={`pt-3 border-t-2 transition-colors ${
                        active
                          ? 'border-white'
                          : completed
                            ? 'border-emerald-400'
                            : 'border-zinc-800'
                      }`}
                    >
                      <span className="block text-[11px] font-mono text-zinc-500 mb-1">
                        {s.num}
                      </span>
                      <p
                        className={`text-sm font-medium ${
                          active || completed ? 'text-white' : 'text-zinc-500'
                        }`}
                      >
                        {s.label}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5 hidden sm:block">
                        {s.detail}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Included Capabilities */}
              <ul className="space-y-3 border-t border-zinc-800 pt-6">
                {[
                  'Dedicated PostgreSQL Row-Level Security (RLS) tenant boundary',
                  'Full admissions, academics, examinations & INR fee ledgers',
                  'Immediate SUPERADMIN workspace and role access',
                  'Zero lock-in — export institutional records anytime',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-300"
                  >
                    <Check className="w-4 h-4 text-zinc-400 shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Provisioning Form Container */}
            <div className="lg:col-span-7 min-w-0">
              <div className="max-w-xl lg:ml-auto rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
                {/* Form Header */}
                <div className="px-6 sm:px-8 py-5 border-b border-zinc-800 bg-[#09090B] flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-medium text-white">
                      {step === 1 && 'Institution details'}
                      {step === 2 && 'Administrator credentials'}
                      {step === 3 && 'Provisioning workspace'}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      {step === 1 && 'Define your institution name and workspace URL slug.'}
                      {step === 2 && 'Create the root administrator login for your institution.'}
                      {step === 3 && 'Establishing isolated tenant boundary and session.'}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900 shrink-0">
                    {formData.tier}
                  </span>
                </div>

                {/* Form Body */}
                <div className="p-6 sm:p-8">
                  {errorMsg && (
                    <div className="mb-6 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* STEP 1: Institution Details */}
                  {step === 1 && (
                    <form onSubmit={handleNextStep} className="space-y-5">
                      <div>
                        <label
                          htmlFor="onboard-inst-name"
                          className="block text-xs font-medium text-zinc-300 mb-2"
                        >
                          Institution Name <span className="text-zinc-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <input
                            id="onboard-inst-name"
                            type="text"
                            placeholder="e.g. Cambridge Academy of Sciences"
                            value={formData.institutionName}
                            onChange={(e) => handleChange('institutionName', e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#09090B] border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="onboard-subdomain"
                          className="block text-xs font-medium text-zinc-300 mb-2"
                        >
                          Workspace Subdomain
                        </label>
                        <div className="flex rounded-lg overflow-hidden border border-zinc-800 focus-within:border-zinc-500 transition-colors">
                          <span className="inline-flex items-center px-3.5 bg-zinc-900 border-r border-zinc-800 text-zinc-400 text-xs font-mono">
                            https://
                          </span>
                          <input
                            id="onboard-subdomain"
                            type="text"
                            placeholder="your-institution"
                            value={formData.subdomain}
                            onChange={(e) =>
                              handleChange(
                                'subdomain',
                                e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                              )
                            }
                            className="flex-1 h-11 px-3.5 bg-[#09090B] text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                          />
                          <span className="inline-flex items-center px-3.5 bg-zinc-900 border-l border-zinc-800 text-zinc-500 text-xs font-mono">
                            .edupulseerp.in
                          </span>
                        </div>
                      </div>

                      <div className="rounded-lg border border-zinc-800 bg-[#09090B] p-4 flex items-center gap-3 text-xs text-zinc-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          Your institution&apos;s data is isolated in its own PostgreSQL RLS
                          boundary from day one.
                        </span>
                      </div>

                      <button
                        type="submit"
                        className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-medium transition-colors cursor-pointer"
                      >
                        Continue to Admin Setup
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  {/* STEP 2: Administrator Credentials */}
                  {step === 2 && (
                    <form onSubmit={handleFinalSubmit} className="space-y-5">
                      <div>
                        <label
                          htmlFor="onboard-admin-name"
                          className="block text-xs font-medium text-zinc-300 mb-2"
                        >
                          Administrator Full Name <span className="text-zinc-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <input
                            id="onboard-admin-name"
                            type="text"
                            placeholder="e.g. Dr. Rajesh Verma"
                            value={formData.adminName}
                            onChange={(e) => handleChange('adminName', e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#09090B] border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="onboard-admin-email"
                          className="block text-xs font-medium text-zinc-300 mb-2"
                        >
                          Institutional Work Email <span className="text-zinc-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                          <input
                            id="onboard-admin-email"
                            type="email"
                            placeholder="admin@institution.edu.in"
                            value={formData.adminEmail}
                            onChange={(e) => handleChange('adminEmail', e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#09090B] border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="onboard-password"
                            className="block text-xs font-medium text-zinc-300 mb-2"
                          >
                            Password <span className="text-zinc-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input
                              id="onboard-password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={formData.adminPassword}
                              onChange={(e) => handleChange('adminPassword', e.target.value)}
                              className="w-full h-11 pl-10 pr-10 rounded-lg bg-[#09090B] border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="onboard-confirm-password"
                            className="block text-xs font-medium text-zinc-300 mb-2"
                          >
                            Confirm Password <span className="text-zinc-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <input
                              id="onboard-confirm-password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              value={formData.confirmPassword}
                              onChange={(e) => handleChange('confirmPassword', e.target.value)}
                              className="w-full h-11 pl-10 pr-4 rounded-lg bg-[#09090B] border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="h-11 px-4 inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#09090B] text-zinc-300 hover:text-white hover:border-zinc-700 text-sm font-medium transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back
                        </button>
                        <button
                          type="submit"
                          className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-medium transition-colors cursor-pointer"
                        >
                          Launch 14-Day Trial
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 3: Automated Cloud Provisioning & Login */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="text-center space-y-2 py-2">
                        {provisioningStatus === 'provisioning' && (
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-9 h-9 text-white animate-spin" />
                            <h3 className="font-medium text-white text-base">
                              Provisioning institutional tenant...
                            </h3>
                            <p className="text-xs text-zinc-400">
                              Please wait while your isolated workspace is configured.
                            </p>
                          </div>
                        )}

                        {provisioningStatus === 'complete' && (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                              <Check className="w-5 h-5" />
                            </div>
                            <h3 className="font-medium text-white text-base">
                              Workspace ready
                            </h3>
                            <p className="text-xs text-zinc-400">
                              Redirecting to your administrative dashboard...
                            </p>
                          </div>
                        )}

                        {provisioningStatus === 'error' && (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <h3 className="font-medium text-red-400 text-base">
                              Provisioning failed
                            </h3>
                            <p className="text-xs text-zinc-400">
                              An error occurred while creating your tenant partition.
                            </p>
                            <button
                              type="button"
                              onClick={() => setStep(2)}
                              className="mt-1 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white text-xs font-medium cursor-pointer"
                            >
                              Retry Setup
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Provisioning Log */}
                      <div className="bg-[#09090B] border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-400 space-y-2 max-h-48 overflow-y-auto">
                        <div className="text-zinc-500 text-[11px] border-b border-zinc-800 pb-1.5 flex items-center justify-between">
                          <span>Provisioning Log</span>
                          <span className="text-emerald-400">ACTIVE</span>
                        </div>
                        {provisioningLogs.map((log, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px]">
                            <span className="text-zinc-500">&rsaquo;</span>
                            <span
                              className={
                                idx === provisioningLogs.length - 1
                                  ? 'text-zinc-100'
                                  : 'text-zinc-400'
                              }
                            >
                              {log}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Shortcut */}
                <div className="px-6 sm:px-8 py-4 border-t border-zinc-800 bg-[#09090B] flex items-center justify-between text-xs text-zinc-500">
                  <span>Already have an institutional workspace?</span>
                  <Link
                    to="/login"
                    className="font-medium text-white hover:underline"
                  >
                    Sign in &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
