import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { axiosClient, invoke, isTauriDesktop } from '../api/axiosClient';
import { useAuthStore } from '../store/useAuthStore';
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
    <div className="h-full w-full overflow-hidden flex flex-col lg:flex-row font-sans select-none bg-slate-900">
      
      {/* ========================================================================= */}
      {/* LEFT PANEL: Enterprise Branding & Institution Showcase                     */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-7/12 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden border-r border-slate-800">
        
        {/* Subtle decorative glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header: EduPulse Logo & Title (Desktop Edition tag removed) */}
        <div className="relative z-10 flex items-center space-x-4">
          <img 
            src="/logo.jpg" 
            alt="EduPulse Logo" 
            className="w-12 h-12 rounded-xl object-cover shadow-lg border border-slate-700/80" 
          />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">EduPulse ERP</h1>
            <p className="text-xs text-slate-400 font-medium">Unified Institutional Management Platform</p>
          </div>
        </div>

        {/* Center: Dedicated Institutional Showcase (Logo and Name of the Institution) */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-12 text-center">
          {/* Institution Crest / Logo Container */}
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-600/20 via-indigo-600/30 to-purple-600/20 border border-slate-700/80 shadow-2xl flex items-center justify-center mb-6 backdrop-blur-md ring-1 ring-white/10">
            <Building2 className="w-14 h-14 text-blue-400 stroke-[1.5]" />
          </div>

          {/* Institution Name & Details */}
          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white mb-2 max-w-md">
            Central University System
          </h2>
          <p className="text-sm font-medium text-slate-400 max-w-sm">
            Main Campus • Institutional Node 01
          </p>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
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
        <div className="w-full max-w-sm mx-auto my-auto space-y-6">
          <div className="space-y-1.5 text-left">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Select your institutional portal role and enter your verified credentials.
            </p>
          </div>

          {/* Tactile Elevated Role Selector Tabs */}
          <div className="grid grid-cols-5 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)] gap-1">
            {(['ADMIN', 'FACULTY', 'STUDENT', 'PARENT', 'FINANCE'] as const).map((r) => {
              const isActive = activeTab === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setActiveTab(r);
                    setUsername('');
                    setPassword('');
                  }}
                  className={`relative py-2 text-[11px] font-bold rounded-xl transition-all duration-200 ease-out cursor-pointer flex flex-col items-center justify-center ${
                    isActive
                      ? 'bg-white text-slate-950 font-extrabold shadow-[0_6px_16px_rgba(0,0,0,0.14),0_2px_4px_rgba(0,0,0,0.06)] -translate-y-0.5 border border-slate-200/90 ring-1 ring-black/[0.04] z-10 scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-800 font-semibold shadow-none translate-y-0 opacity-75 hover:opacity-100 hover:bg-slate-300/30'
                  }`}
                >
                  {isActive && (
                    <span className="absolute -top-1 w-5 h-1 bg-blue-600 rounded-full" />
                  )}
                  <span>{r.charAt(0) + r.slice(1).toLowerCase()}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleErpSubmit} className="space-y-4">
            <div className="space-y-1 text-left">
              <div className="flex justify-between items-center">
                <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Username or Email
                </Label>
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Use Demo Login
                </button>
              </div>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={`Enter ${activeTab.toLowerCase()} username`}
                className="h-11 text-sm bg-slate-50/60 border-slate-200 rounded-lg focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1 text-left">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11 text-sm bg-slate-50/60 border-slate-200 rounded-lg pr-10 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-md mt-2 cursor-pointer transition-colors"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                `Sign In as ${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}`
              )}
            </Button>
          </form>

          {/* Security Subtext */}
          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 pt-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Protected by Windows DPAPI Vault & Hardware Isolation</span>
          </div>
        </div>

        {/* Right Footer */}
        <div className="text-center text-[11px] text-slate-400 pt-6">
          EduPulse ERP Windows Client • Connected to Institution Cloud
        </div>
      </div>

    </div>
  );
}
