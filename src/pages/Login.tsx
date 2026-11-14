import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { axiosClient, invoke, isTauriDesktop } from '../api/axiosClient';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
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
    <div className="h-screen w-screen bg-slate-900 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden select-none">
      
      {/* Subtle Desktop Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 z-0"></div>

      <Card className="w-full max-w-md shadow-2xl border border-slate-700/50 rounded-2xl p-2 sm:p-4 z-10 bg-white">
        <CardHeader className="flex flex-col items-center mb-0 pb-3 text-center">
          <div className="flex flex-col items-center">
            <img 
              src="/logo.jpg" 
              alt="EduPulse Logo" 
              className="w-14 h-14 rounded-xl object-cover mb-2 shadow-md border border-slate-100" 
            />
            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">EduPulse ERP</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
            Unified Institutional Management Platform
          </CardDescription>

          {/* Role selector tabs */}
          <div className="w-full grid grid-cols-5 p-1 bg-slate-100 rounded-xl mt-3 border border-slate-200">
            {(['ADMIN', 'FACULTY', 'STUDENT', 'PARENT', 'FINANCE'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setActiveTab(r);
                  setUsername('');
                  setPassword('');
                }}
                className={`py-1 text-[11px] font-bold rounded-lg transition-all ${
                  activeTab === r 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          <form onSubmit={handleErpSubmit} className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Username or Email
                </Label>
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="text-xs text-amber-600 hover:text-amber-800 font-semibold cursor-pointer"
                >
                  Use Demo Login
                </button>
              </div>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="h-10 text-sm bg-slate-50/50"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="h-10 text-sm bg-slate-50/50 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg mt-2 cursor-pointer"
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
        </CardContent>
      </Card>
      
      <div className="mt-4 text-xs text-slate-400 z-10 flex items-center gap-2">
        <span>&copy; {new Date().getFullYear()} EduPulse ERP Technologies.</span>
        <span>•</span>
        <span>Windows Desktop Edition v1.0</span>
      </div>
    </div>
  );
}
