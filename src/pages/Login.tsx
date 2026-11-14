import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { axiosClient, invoke, isTauriDesktop } from '../api/axiosClient';
import { useAuthStore } from '../store/useAuthStore';
import { useInstitutionStore } from '../store/useInstitutionStore';
import { 
  extractDominantColors, 
  deriveThemeFromColor, 
  DEFAULT_THEME, 
  type ExtractedColors 
} from '../lib/colorExtractor';
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  Building2, 
  Lock 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export default function Login() {
  const [searchParams] = useSearchParams();

  const roleParam = searchParams.get('role')?.toUpperCase();
  const initialRole: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT' | 'FINANCE' =
    (roleParam === 'FACULTY' || roleParam === 'STUDENT' || roleParam === 'PARENT' || roleParam === 'FINANCE')
      ? roleParam
      : 'ADMIN';

  // Institutional ERP Form State
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'FACULTY' | 'STUDENT' | 'PARENT' | 'FINANCE'>(initialRole);
  const [username, setUsername] = useState(searchParams.get('username') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { institution, updateInstitution } = useInstitutionStore();

  // Personalized Adaptive Brand Theme State
  const [theme, setTheme] = useState<ExtractedColors>(() => {
    // If institution name or branding indicates Arya College, initialize immediately with royal maroon & gold
    if (institution.name?.toLowerCase().includes('arya')) {
      return deriveThemeFromColor('#991b1b', '#f59e0b');
    }
    if (institution.brandPrimary && institution.brandPrimary !== '#2563eb') {
      return deriveThemeFromColor(institution.brandPrimary, institution.brandSecondary);
    }
    return DEFAULT_THEME;
  });

  // Extract from logo automatically on mount or when logoUrl changes
  useEffect(() => {
    let active = true;

    if (institution.logoUrl) {
      extractDominantColors(institution.logoUrl)
        .then((extracted) => {
          if (!active) return;
          setTheme(extracted);

          // Update store if store was never personalized or still default
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
    } else if (institution.brandPrimary && institution.brandPrimary !== '#2563eb') {
      setTheme(deriveThemeFromColor(institution.brandPrimary, institution.brandSecondary));
    } else if (institution.name?.toLowerCase().includes('arya')) {
      setTheme(deriveThemeFromColor('#991b1b', '#f59e0b'));
    } else {
      setTheme(DEFAULT_THEME);
    }

    return () => {
      active = false;
    };
  }, [institution.logoUrl, institution.brandPrimary, institution.brandSecondary, institution.name]);

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

  // Handle ERP Institutional Sign In
  const handleErpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosClient.post('/auth/login', { username, password, role: activeTab });
      const { accessToken, token: rawToken, refreshToken, username: user, role, permissions } = response.data;
      const token = accessToken || rawToken;

      // Securely vault Access Token & Refresh Token in Windows DPAPI (P2.1 / P3.2)
      try {
        if (isTauriDesktop()) {
          await invoke('store_account_tokens', {
            account: user || 'default_user',
            tokens: {
              access_token: token,
              refresh_token: refreshToken || null,
            },
          });
        }
      } catch (vaultErr) {
        console.error('[Login] Failed to store secure token in native vault:', vaultErr);
      }
      
      login(token, refreshToken, { username: user, role, permissions });
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Invalid credentials or role mismatch.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    switch(activeTab) {
      case 'ADMIN':
        if (username === 'superadmin') {
          setUsername('admin');
        } else {
          setUsername('superadmin');
        }
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
    <div className="h-full w-full overflow-hidden flex flex-col lg:flex-row font-sans select-none bg-slate-950">
      
      {/* ========================================================================= */}
      {/* LEFT PANEL: Enterprise Branding & Dynamic Institutional Atmosphere         */}
      {/* ========================================================================= */}
      <div 
        className="hidden lg:flex lg:w-1/2 xl:w-7/12 text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden transition-all duration-700"
        style={{
          background: theme.gradientStyle,
          borderRight: `1px solid rgba(${theme.primaryRgb}, 0.25)`
        }}
      >
        
        {/* Dynamic primary ambient backlight halo matching the logo's dominant palette */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full blur-[100px] pointer-events-none transition-all duration-700"
          style={{
            background: theme.haloGlowStyle,
          }}
        />

        {/* Dynamic secondary luminous aura for depth */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full blur-[65px] pointer-events-none transition-all duration-700"
          style={{
            backgroundColor: `rgba(${theme.secondaryRgb}, 0.30)`,
          }}
        />

        {/* Top Header: EduPulse Logo & Title */}
        <div className="relative z-10 flex items-center space-x-4">
          <img 
            src="/logo.jpg" 
            alt="EduPulse Logo" 
            className="w-12 h-12 rounded-xl object-cover shadow-lg border border-white/20" 
          />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">EduPulse ERP</h1>
            <p className="text-xs text-white/70 font-medium">Unified Institutional Management Platform</p>
          </div>
        </div>

        {/* Center: Dedicated Institutional Showcase (Logo and Name of the Institution) */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-12 text-center">
          {/* Institution Crest / Logo Container with brand-matching glow and border */}
          <div 
            className="w-32 h-32 rounded-3xl bg-white flex items-center justify-center mb-6 overflow-hidden p-3 transition-transform duration-300 hover:scale-105 relative z-10"
            style={{
              boxShadow: theme.boxShadowStyle,
              border: `2px solid rgba(${theme.secondaryRgb}, 0.5)`
            }}
          >
            {institution.logoUrl ? (
              <img 
                src={institution.logoUrl} 
                alt={institution.name} 
                className="w-full h-full object-contain" 
              />
            ) : (
              <Building2 className="w-16 h-16 text-blue-600 stroke-[1.5]" />
            )}
          </div>

          {/* Institution Name & Details */}
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white mb-2 max-w-md drop-shadow-md">
            {institution.name || 'Central University System'}
          </h2>
          <p className="text-sm font-semibold text-white/80 max-w-sm drop-shadow-sm">
            {institution.campus || 'Main Campus • Institutional Node 01'}
          </p>
        </div>

        {/* Bottom Footer */}
        <div 
          className="relative z-10 pt-4 flex items-center justify-between text-xs text-white/50"
          style={{
            borderTop: `1px solid rgba(${theme.primaryRgb}, 0.25)`
          }}
        >
          <span>&copy; {new Date().getFullYear()} EduPulse ERP Technologies.</span>
          <span>Build 1.0.0 • Windows 10/11 x64</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: Integrated Login Facility                                    */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 xl:w-5/12 bg-white flex flex-col justify-between p-8 sm:p-12 xl:p-16 h-full overflow-y-auto">
        
        {/* Mobile Header (visible only on small viewports) */}
        <div className="lg:hidden flex items-center space-x-3 mb-6">
          <img src="/logo.jpg" alt="EduPulse Logo" className="w-10 h-10 rounded-lg shadow-sm" />
          <div>
            <h1 className="text-lg font-bold text-slate-900">EduPulse ERP</h1>
            <p className="text-xs text-slate-500">Institutional Workspace</p>
          </div>
        </div>

        {/* Center Container */}
        <div className="max-w-md w-full mx-auto my-auto py-4">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
            <p className="text-sm text-slate-500 mt-1">
              Select your institutional portal role and enter your authorized credentials.
            </p>
          </div>

          {/* Role Tab Selector (Harmonious Rounded Pill Navigation) */}
          <div className="flex bg-slate-100/90 p-1.5 rounded-full mb-6 border border-slate-200/80 shadow-inner">
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
                  className={`flex-1 py-2 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-950 shadow-sm ring-1 ring-black/5'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {tab === 'ADMIN' ? 'Admin' : tab === 'FACULTY' ? 'Faculty' : tab === 'STUDENT' ? 'Student' : tab === 'PARENT' ? 'Parent' : 'Finance'}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleErpSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="erp-username" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Username or Institutional Email
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
                className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="erp-password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="erp-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-slate-50/50 border-slate-200 focus:bg-white pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                `Sign In as ${activeTab === 'ADMIN' ? 'Admin' : activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}`
              )}
            </Button>

          </form>

          {/* Windows DPAPI Security Notice */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center space-x-2 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Protected by Windows Hardware Security Vault (DPAPI)</span>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-4">
          &copy; {new Date().getFullYear()} EduPulse ERP Technologies. All rights reserved.
        </div>

      </div>

    </div>
  );
}
