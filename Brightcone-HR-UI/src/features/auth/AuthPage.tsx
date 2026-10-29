import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BrightconeFullLogo } from '../../components/common/BrightconeLogo';
import {
  Sun,
  Moon,
  ShieldCheck,
  Check,
  CreditCard,
  ArrowRight,
  LogOut,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const APPS = [
  { name: 'People', color: '#12A58E' },
  { name: 'Recruit', color: '#7C5CFF' },
  { name: 'Payroll', color: '#0F9F6E' },
  { name: 'Expense', color: '#E07A1D' },
  { name: 'Sign', color: '#D9466F' },
  { name: 'Connect', color: '#0BA6CC' },
  { name: 'Learn', color: '#6366F1' },
  { name: 'Shift', color: '#3B82C4' },
  { name: 'People Plus', color: '#0B87FF' },
];

export const AuthPage: React.FC = () => {
  const { user, login, register, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // View state: 'signin' | 'signup' | 'forgot'
  const [view, setView] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Sign In Form State
  const [email, setEmail] = useState<string>('admin@brightcone.ai');
  const [password, setPassword] = useState<string>('admin123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [remember, setRemember] = useState<boolean>(true);

  // Sign Up Form State
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regRole, setRegRole] = useState<string>('Technical Recruiter');

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState<string>('');

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setErrorMsg('Enter your work email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: trimmedEmail, password });
      setSuccessMsg('Signed in successfully! Redirecting...');
      setTimeout(() => {
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }, 350);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Check your email and password.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        role: regRole,
      });
      setSuccessMsg('Account registered successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try a different email.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMsg('Please enter your work email.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(`Password reset instructions sent to ${forgotEmail}.`);
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    try {
      await logout();
      setSuccessMsg('Signed out successfully.');
      setView('signin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid grid-cols-1 lg:grid-cols-[1.08fr_1fr] bg-[#F4F6FB] dark:bg-[#070E22] text-slate-800 dark:text-slate-100 overflow-y-auto font-['Figtree',sans-serif] transition-colors duration-200">
      {/* ================= LEFT SECTION: Presentation Hero (.lp) ================= */}
      <section className="relative overflow-hidden lp-hero-bg text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between min-h-[520px] lg:min-h-full">
        {/* Conic Glow in background */}
        <div className="absolute -right-44 -bottom-48 w-[640px] h-[640px] lp-conic-glow pointer-events-none rounded-full" />

        {/* Subtle grid lines overlay */}
        <div className="absolute inset-0 lp-grid-overlay pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Header with Brightcone AI Logo */}
          <div className="mb-8">
            <BrightconeFullLogo width={280} className="mb-6 hover:opacity-95 transition-opacity" />
            <div className="font-['Sora',sans-serif] font-semibold text-xs tracking-wide text-[#14B8E6] uppercase mb-2.5">
              Brightcone People Plus
            </div>
            <h2 className="font-['Sora',sans-serif] text-3xl sm:text-4xl lg:text-[42px] font-bold leading-[1.12] tracking-tight text-white max-w-[16ch] mb-4">
              Everything about work at Brightcone, in one place.
            </h2>
            <p className="text-[#C9D3EE] text-sm sm:text-base max-w-[44ch] leading-relaxed mb-6 font-normal">
              Employees apply for leave, download payslips and raise requests. HR runs payroll, approvals and hiring from one inbox.
            </p>

            {/* Apps Pill Strip */}
            <div className="flex flex-wrap gap-2 max-w-[480px] mb-8">
              {APPS.map((app) => (
                <span
                  key={app.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.07] border border-white/[0.12] text-xs text-[#DCE4F7] font-medium"
                >
                  <i className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: app.color }} />
                  <span>{app.name}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Floating Glass Notification Cards */}
          <div className="hidden sm:flex flex-col gap-3 my-auto pb-6">
            {/* Card 1: Leave Approved */}
            <div className="bg-white/[0.07] border border-white/[0.12] backdrop-blur-md rounded-2xl p-3.5 flex items-center gap-3.5 text-xs max-w-[340px] shadow-lg shadow-black/20">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-[#4BE0A5] flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </span>
              <div>
                <b className="block font-semibold text-white text-sm">Leave approved</b>
                <span className="text-[#C9D3EE] text-[11px]">Casual leave, Oct 9. Enjoy your day off.</span>
              </div>
            </div>

            {/* Card 2: Payslip Ready */}
            <div className="bg-white/[0.07] border border-white/[0.12] backdrop-blur-md rounded-2xl p-3.5 flex items-center gap-3.5 text-xs max-w-[340px] ml-7 sm:ml-9 shadow-lg shadow-black/20">
              <span className="w-8 h-8 rounded-full bg-[#14b8e6]/20 text-[#14b8e6] flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 stroke-[2]" />
              </span>
              <div>
                <b className="block font-semibold text-white text-sm">September payslip is ready</b>
                <span className="text-[#C9D3EE] text-[11px]">Credited to your account on Oct 1.</span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-6 border-t border-white/[0.08] text-[#93A0C4] text-xs flex flex-wrap gap-4 sm:gap-6 font-medium">
            <span>SOC 2 Type II aligned</span>
            <span>HIPAA-ready</span>
            <span>Need help? hello@brightcone.ai</span>
          </div>
        </div>
      </section>

      {/* ================= RIGHT SECTION: Form Card (.lf) ================= */}
      <section className="relative flex items-center justify-center p-6 sm:p-10 lg:p-14 bg-[#F4F6FB] dark:bg-[#070E22] transition-colors duration-200">
        {/* Floating Theme Switcher Button (.ltheme) */}
        <button
          onClick={toggleTheme}
          type="button"
          className="absolute top-5 right-6 w-10 h-10 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1833] hover:scale-105 active:scale-95 transition-all shadow-sm text-slate-700 dark:text-slate-200 cursor-pointer z-20"
          title={theme === 'dark' ? 'Switch to Light theme (☀️)' : 'Switch to Dark theme (🌙)'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-sky-600" />
          )}
        </button>

        {/* Central Card Container (.lcard) */}
        <div className="w-full max-w-[400px]">
          {/* CASE A: User is ALREADY Authenticated */}
          {isAuthenticated && user ? (
            <div className="space-y-6">
              <div>
                <h1 className="font-['Sora',sans-serif] text-2xl font-bold text-slate-900 dark:text-white mb-1.5">
                  Welcome back!
                </h1>
                <p className="text-slate-500 dark:text-[#93A0C4] text-sm mb-6">
                  You are currently signed in with your Brightcone work account.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1833] border border-slate-200 dark:border-[#1D2B52] shadow-sm text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#0B87FF] to-[#14B8E6] text-white text-xl font-bold flex items-center justify-center mx-auto mb-3 shadow-md shadow-sky-500/25">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="font-['Sora',sans-serif] text-base font-bold text-slate-900 dark:text-white">
                  {user.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-[#93A0C4] mt-0.5">{user.email}</div>
                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/30 text-xs font-semibold text-sky-700 dark:text-sky-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                  <span>{user.role}</span>
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5 mt-3.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Rust Loco API 5150 Connected</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  type="button"
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-[#0B87FF] hover:bg-[#0976e0] text-white flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  <span>Enter People Plus Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSignOut}
                  disabled={isSubmitting}
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl font-medium text-xs bg-slate-100 hover:bg-rose-50 dark:bg-[#0E1833] dark:hover:bg-rose-950/30 border border-slate-200 dark:border-[#1D2B52] hover:border-rose-300 text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-300 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          ) : view === 'forgot' ? (
            /* CASE B: Forgot Password View */
            <div>
              <h1 className="font-['Sora',sans-serif] text-2xl font-bold text-slate-900 dark:text-white mb-1.5">
                Reset your password
              </h1>
              <p className="text-slate-500 dark:text-[#93A0C4] text-sm mb-6">
                Enter your work email and we’ll send you a reset link.
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-200 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-200 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Work email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@brightcone.ai"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0E1833] border border-slate-300 dark:border-[#1D2B52] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#0B87FF]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-[#0B87FF] hover:bg-[#0976e0] text-white transition cursor-pointer"
                >
                  Send reset link
                </button>
              </form>

              <div className="flex items-center gap-3 my-4 text-xs text-slate-400 dark:text-slate-500">
                <span className="flex-1 h-px bg-slate-200 dark:bg-[#1D2B52]" />
                <span>or</span>
                <span className="flex-1 h-px bg-slate-200 dark:bg-[#1D2B52]" />
              </div>

              <button
                type="button"
                onClick={() => {
                  setView('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs bg-slate-100 hover:bg-slate-200 dark:bg-[#0E1833] dark:hover:bg-[#122042] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1D2B52] transition cursor-pointer"
              >
                Back to sign in
              </button>
            </div>
          ) : view === 'signup' ? (
            /* CASE C: Sign Up View */
            <div>
              <h1 className="font-['Sora',sans-serif] text-2xl font-bold text-slate-900 dark:text-white mb-1.5">
                Create an account
              </h1>
              <p className="text-slate-500 dark:text-[#93A0C4] text-sm mb-6">
                Register your profile to access Brightcone People Plus.
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-200 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-200 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Rohith Varma"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#0E1833] border border-slate-300 dark:border-[#1D2B52] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#0B87FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work email
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@brightcone.ai"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#0E1833] border border-slate-300 dark:border-[#1D2B52] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#0B87FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#0E1833] border border-slate-300 dark:border-[#1D2B52] text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#0B87FF] cursor-pointer"
                  >
                    <option value="Technical Recruiter">Technical Recruiter</option>
                    <option value="HR Admin">HR Admin</option>
                    <option value="Hiring Manager">Hiring Manager</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#0E1833] border border-slate-300 dark:border-[#1D2B52] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#0B87FF]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-[#0B87FF] hover:bg-[#0976e0] text-white transition cursor-pointer mt-1"
                >
                  {isSubmitting ? 'Registering...' : 'Create Account'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-4 text-xs text-slate-400 dark:text-slate-500">
                <span className="flex-1 h-px bg-slate-200 dark:bg-[#1D2B52]" />
                <span>or</span>
                <span className="flex-1 h-px bg-slate-200 dark:bg-[#1D2B52]" />
              </div>

              <button
                type="button"
                onClick={() => {
                  setView('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="w-full py-2 px-4 rounded-xl font-medium text-xs bg-slate-100 hover:bg-slate-200 dark:bg-[#0E1833] dark:hover:bg-[#122042] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1D2B52] transition cursor-pointer"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            /* CASE D: Sign In View (Reference: #login .lcard) */
            <div>
              <h1 className="font-['Sora',sans-serif] text-[26px] font-semibold text-slate-900 dark:text-white mb-1.5 leading-tight">
                Sign in
              </h1>
              <p className="text-slate-500 dark:text-[#93A0C4] text-sm mb-6 font-normal">
                Use your Brightcone work email. You’ll see the pages for your role.
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-200 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-200 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Work email field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Work email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@brightcone.ai"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0E1833] border border-slate-300 dark:border-[#1D2B52] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#0B87FF] transition-colors"
                  />
                </div>

                {/* Password field with Show/Hide button */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full pl-3.5 pr-16 py-2.5 rounded-xl bg-white dark:bg-[#0E1833] border border-slate-300 dark:border-[#1D2B52] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#0B87FF] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-[#0B87FF] hover:text-[#0976e0] transition-colors cursor-pointer"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot Password row */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-[#93A0C4] select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="rounded border-slate-300 dark:border-[#1D2B52] bg-white dark:bg-[#0E1833] text-[#0B87FF] focus:ring-[#0B87FF]"
                    />
                    <span>Keep me signed in</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[#0B87FF] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign in Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-[#0B87FF] hover:bg-[#0976e0] text-white flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign in</span>
                  )}
                </button>
              </form>

              {/* Or separator */}
              <div className="flex items-center gap-3 my-4 text-xs text-slate-400 dark:text-slate-500">
                <span className="flex-1 h-px bg-slate-200 dark:bg-[#1D2B52]" />
                <span>or</span>
                <span className="flex-1 h-px bg-slate-200 dark:bg-[#1D2B52]" />
              </div>

              {/* Continue with Microsoft button */}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('Microsoft single sign-on isn’t connected in this prototype. Use your email and password.');
                }}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-sm bg-white hover:bg-slate-50 dark:bg-[#0E1833] dark:hover:bg-[#122042] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1D2B52] transition flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
              >
                <svg width="16" height="16" viewBox="0 0 23 23" aria-hidden="true">
                  <path fill="#F25022" d="M1 1h10v10H1z" />
                  <path fill="#7FBA00" d="M12 1h10v10H12z" />
                  <path fill="#00A4EF" d="M1 12h10v10H1z" />
                  <path fill="#FFB900" d="M12 12h10v10H12z" />
                </svg>
                <span>Continue with Microsoft</span>
              </button>

              {/* Demo Accounts Box (.demo) */}
              <div className="mt-6 border border-dashed border-slate-300 dark:border-[#1D2B52] rounded-xl p-3.5 bg-slate-50 dark:bg-[#122042]/50">
                <p className="text-xs text-slate-500 dark:text-[#93A0C4] mb-2 font-medium">
                  Demo accounts. Click one to fill it in.
                </p>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemo('admin@brightcone.ai', 'admin123')}
                    className="w-full flex items-center justify-between gap-2 border border-slate-200 dark:border-[#1D2B52] bg-white dark:bg-[#0E1833] hover:border-[#0B87FF] rounded-lg p-2.5 text-left text-xs transition cursor-pointer"
                  >
                    <b className="font-semibold text-slate-900 dark:text-white">HR Admin</b>
                    <span className="text-slate-500 dark:text-[#93A0C4] text-[11px]">
                      admin@brightcone.ai, admin123
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillDemo('rahul.varma@brightcone.ai', 'Welcome@123')}
                    className="w-full flex items-center justify-between gap-2 border border-slate-200 dark:border-[#1D2B52] bg-white dark:bg-[#0E1833] hover:border-[#0B87FF] rounded-lg p-2.5 text-left text-xs transition cursor-pointer"
                  >
                    <b className="font-semibold text-slate-900 dark:text-white">Employee</b>
                    <span className="text-slate-500 dark:text-[#93A0C4] text-[11px]">
                      rahul.varma@brightcone.ai, Welcome@123
                    </span>
                  </button>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-[#1D2B52]/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#93A0C4]">
                  <span>Need a new account?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setView('signup');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[#0B87FF] font-semibold hover:underline cursor-pointer"
                  >
                    Create an account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AuthPage;
