import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { axiosClient, invoke, isTauriDesktop, resolveBaseUrl } from '../api/axiosClient';
import { useAuthStore } from '../store/useAuthStore';
import { useInstitutionStore } from '../store/useInstitutionStore';
import { useTenantTheme } from '../hooks/useTenantTheme';
import {
  extractDominantColors,
  deriveThemeFromColor,
  DEFAULT_THEME,
  type ExtractedColors,
} from '../lib/colorExtractor';
import { Loader2, Eye, EyeOff, Building2 } from 'lucide-react';
import { ServerSettingsModal } from '../components/ServerSettingsModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export default function Login() {
  const [searchParams] = useSearchParams();
  const { branding, subdomain } = useTenantTheme();

  const roleParam = searchParams.get('role')?.toUpperCase();
  const initialRole: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT' | 'FINANCE' =
    roleParam === 'FACULTY' || roleParam === 'STUDENT' || roleParam === 'PARENT' || roleParam === 'FINANCE'
      ? roleParam
      : 'ADMIN';

  const [activeTab, setActiveTab] = useState<'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT' | 'FINANCE'>(initialRole);
  const [username, setUsername] = useState(searchParams.get('username') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [activeServerUrl, setActiveServerUrl] = useState<string>(() => resolveBaseUrl());

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { institution, updateInstitution } = useInstitutionStore();

  const effectiveName = (subdomain && branding?.institutionName) || institution.name || 'Central University System';
  const effectiveLogoUrl = (subdomain && branding?.logoUrl) || institution.logoUrl;
  const effectiveCampus = subdomain
    ? `${subdomain}.edupulseerp.in`
    : institution.campus || 'Main Campus • Institutional Node 01';
  const effectivePrimary = (subdomain && branding?.primaryColorHex) || institution.brandPrimary;
  const effectiveSecondary = (subdomain && branding?.secondaryColorHex) || institution.brandSecondary;

  const [theme, setTheme] = useState<ExtractedColors>(() => {
    if (effectivePrimary && effectivePrimary !== '#2563eb') {
      return deriveThemeFromColor(effectivePrimary, effectiveSecondary || undefined);
    }
    if (effectiveName.toLowerCase().includes('arya')) {
      return deriveThemeFromColor('#991b1b', '#f59e0b');
    }
    return DEFAULT_THEME;
  });

  useEffect(() => {
    let active = true;

    if (effectivePrimary && effectivePrimary !== '#2563eb') {
      setTheme(deriveThemeFromColor(effectivePrimary, effectiveSecondary || undefined));
    } else if (effectiveLogoUrl) {
      extractDominantColors(effectiveLogoUrl)
        .then((extracted) => {
          if (!active) return;
          setTheme(extracted);
          if (!institution.brandPrimary || institution.brandPrimary === '#2563eb' || !institution.bgDark) {
            updateInstitution({
              brandPrimary: extracted.primary,
              brandSecondary: extracted.secondary,
              brandPrimaryRgb: extracted.primaryRgb,
              brandSecondaryRgb: extracted.secondaryRgb,
              bgDark: extracted.bgDark,
              bgDarkest: extracted.bgDarkest,
            });
          }
        })
        .catch((err) => {
          console.warn('[Login] Theme extraction failed:', err);
        });
    } else if (effectiveName.toLowerCase().includes('arya')) {
      setTheme(deriveThemeFromColor('#991b1b', '#f59e0b'));
    } else {
      setTheme(DEFAULT_THEME);
    }

    return () => {
      active = false;
    };
  }, [effectiveLogoUrl, effectivePrimary, effectiveSecondary, effectiveName]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        setIsServerModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const role = searchParams.get('role');
    const user = searchParams.get('username');
    if (role) {
      const upper = role.toUpperCase();
      if (upper === 'ADMIN' || upper === 'FACULTY' || upper === 'STUDENT' || upper === 'PARENT' || upper === 'FINANCE') {
        setActiveTab(upper);
      }
    }
    if (user) {
      setUsername(user);
    }
  }, [searchParams]);

  const handleErpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosClient.post('/auth/login', { username, password, role: activeTab });
      const { accessToken, token: rawToken, refreshToken, username: user, role, permissions, tenantId, tenantStatus } = response.data;
      const token = accessToken || rawToken;

      if (isTauriDesktop()) {
        try {
          await invoke('store_account_tokens', {
            account: user || 'default_user',
            tokens: {
              access_token: token,
              refresh_token: refreshToken || null,
            },
          });
        } catch (vaultErr) {
          console.error('[Login] Failed to store secure token in native vault:', vaultErr);
        }
      }

      const finalRole = (role || activeTab || 'ADMIN').toUpperCase().replace(/^ROLE_/, '');
      const finalUsername = user || username || (activeTab === 'ADMIN' ? 'admin' : activeTab.toLowerCase());
      login(
        token,
        refreshToken,
        { username: finalUsername, role: finalRole, permissions: permissions || [], tenantId, tenantStatus },
        tenantId,
        tenantStatus
      );
      toast.success('Login successful!');
      if (finalRole === 'STUDENT') {
        navigate('/portal');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Invalid credentials or role mismatch.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    switch (activeTab) {
      case 'ADMIN':
        setUsername(username === 'superadmin' ? 'admin' : 'superadmin');
        setPassword('Admin@123');
        break;
      case 'FACULTY':
        setUsername('faculty');
        setPassword('Faculty@123');
        break;
      case 'FINANCE':
        setUsername('finance');
        setPassword('Finance@123');
        break;
      case 'STUDENT':
        setUsername('student');
        setPassword('Student@123');
        break;
      case 'PARENT':
        setUsername('parent');
        setPassword('Parent@123');
        break;
    }
    toast.info(`Filled demo credentials for ${activeTab}.`);
  };

  return (
    <div className="min-h-screen lg:h-full w-full overflow-hidden flex flex-col lg:flex-row font-sans select-none bg-slate-950">
      {/* LEFT PANEL: Enterprise Branding & Dynamic Institutional Atmosphere */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-7/12 text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden transition-all duration-700"
        style={{
          background: theme.gradientStyle,
          borderRight: `1px solid rgba(${theme.primaryRgb}, 0.25)`,
        }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full blur-[100px] pointer-events-none transition-all duration-700"
          style={{ background: theme.haloGlowStyle }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full blur-[65px] pointer-events-none transition-all duration-700"
          style={{ backgroundColor: `rgba(${theme.secondaryRgb}, 0.30)` }}
        />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-4 group">
            <img
              src="/logo.jpg"
              alt="EduPulse Logo"
              className="w-12 h-12 rounded-xl object-cover shadow-lg border border-white/20"
            />
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">EduPulse ERP</h1>
              <p className="text-xs text-white/70 font-medium">Unified Institutional Management Platform</p>
            </div>
          </Link>
        </div>

        {/* Center Showcase */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-12 text-center">
          <div
            className="w-32 h-32 rounded-3xl bg-white flex items-center justify-center mb-6 overflow-hidden p-3 transition-transform duration-300 hover:scale-105 relative z-10"
            style={{
              boxShadow: theme.boxShadowStyle,
              border: `2px solid rgba(${theme.secondaryRgb}, 0.5)`,
            }}
          >
            {effectiveLogoUrl ? (
              <img src={effectiveLogoUrl} alt={effectiveName} className="w-full h-full object-contain" />
            ) : (
              <Building2 className="w-16 h-16 text-blue-600 stroke-[1.5]" />
            )}
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white mb-2 max-w-md drop-shadow-md">
            {effectiveName}
          </h2>
          <p className="text-sm font-semibold text-white/80 max-w-sm drop-shadow-sm">
            {effectiveCampus}
          </p>
        </div>

        {/* Bottom Footer */}
        <div
          className="relative z-10 pt-4 flex items-center justify-between text-xs text-white/50"
          style={{ borderTop: `1px solid rgba(${theme.primaryRgb}, 0.25)` }}
        >
          <span>&copy; {new Date().getFullYear()} EduPulse ERP Technologies.</span>
          <span>{isTauriDesktop() ? 'Desktop v1.0.0 • Windows x64' : 'Cloud SaaS • Multi-Tenant Platform'}</span>
        </div>
      </div>

      {/* RIGHT PANEL: Integrated Login Facility */}
      <div className="w-full lg:w-1/2 xl:w-5/12 bg-white flex flex-col justify-between p-8 sm:p-12 xl:p-16 min-h-screen lg:min-h-0 lg:h-full overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.jpg" alt="EduPulse Logo" className="w-9 h-9 rounded-lg shadow-sm" />
            <div>
              <h1 className="text-base font-bold text-slate-900">EduPulse ERP</h1>
              <p className="text-[11px] text-slate-500">Institutional Workspace</p>
            </div>
          </Link>
        </div>

        {/* Center Container */}
        <div className="max-w-sm w-full mx-auto my-auto py-4">
          <div className="mb-7">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
            <p className="text-xs text-slate-500 mt-1">
              Select your institutional portal role and enter your authorized credentials.
            </p>
          </div>

          {/* Role Tab Selector */}
          <div className="flex bg-slate-200/75 p-1.5 rounded-full mb-6 border border-slate-300/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]">
            {(['ADMIN', 'FACULTY', 'STUDENT', 'PARENT', 'FINANCE'] as const).map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setUsername('');
                    setPassword('');
                  }}
                  className={`flex-1 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-950 font-black shadow-[0_6px_16px_-2px_rgba(0,0,0,0.14),0_2px_4px_-1px_rgba(0,0,0,0.08)] ring-1 ring-black/5 -translate-y-0.5 z-10'
                      : 'text-slate-500 font-semibold hover:text-slate-800 hover:bg-white/40'
                  }`}
                >
                  {tab === 'ADMIN'
                    ? 'Admin'
                    : tab === 'FACULTY'
                      ? 'Faculty'
                      : tab === 'STUDENT'
                        ? 'Student'
                        : tab === 'PARENT'
                          ? 'Parent'
                          : 'Finance'}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleErpSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="erp-username" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Username or Email
                </Label>
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                >
                  Use Demo Login
                </button>
              </div>
              <Input
                id="erp-username"
                type="text"
                placeholder={activeTab === 'ADMIN' ? 'admin or superadmin' : `${activeTab.toLowerCase()}`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-9 bg-slate-50/50 border-slate-200 focus:bg-white text-xs sm:text-sm rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="erp-password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </Label>
                <Link to="/forgot-password" className="text-[11px] font-medium text-slate-500 hover:text-slate-800">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="erp-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-9 bg-slate-50/50 border-slate-200 focus:bg-white pr-9 text-xs sm:text-sm rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                disabled={loading}
                size="sm"
                className="w-full sm:w-auto sm:min-w-[200px] h-9 px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  `Sign In as ${activeTab === 'ADMIN' ? 'Admin' : activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}`
                )}
              </Button>
            </div>
          </form>

          {!isTauriDesktop() && (
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                New institution?{' '}
                <Link to="/register" className="font-semibold text-slate-900 hover:underline">
                  Create workspace
                </Link>
              </span>
              <Link to="/admissions" className="font-medium text-slate-600 hover:text-slate-900">
                Admissions Portal →
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
          <span>&copy; {new Date().getFullYear()} EduPulse ERP Technologies.</span>
          <button
            type="button"
            onClick={() => setIsServerModalOpen(true)}
            title={`Backend: ${activeServerUrl} (Ctrl + Shift + S to change)`}
            className="text-[11px] font-mono text-slate-400 hover:text-slate-600 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>v1.0.0</span>
          </button>
        </div>
      </div>

      <ServerSettingsModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        onSaved={(newUrl) => setActiveServerUrl(newUrl)}
      />
    </div>
  );
}
