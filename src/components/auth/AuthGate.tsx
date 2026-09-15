import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user';
import { PastelDigitalAtmosphere } from '../background/PastelDigitalAtmosphere';
import { CustomCursor } from './CustomCursor';
import {
  User,
  Briefcase,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Building2,
  MapPin,
  Clock,
  KeyRound,
  Check,
  Compass
} from 'lucide-react';

type AuthStep = 'role-select' | 'login' | 'register' | 'forgot' | 'reset-code';

interface AuthGateProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onSuccess, onCancel, isModal = false }) => {
  const {
    loginWithCredentials,
    registerWithCredentials,
    forgotPassword,
    resetPassword,
    authIntent,
    setIsGuestExploring,
  } = useAuth();

  // Active step in card stack
  const [step, setStep] = useState<AuthStep>('role-select');
  // Role: student = Employee / Job Seeker, employer = Employer
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Input states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Registration specifics
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Retail & Grocery');
  const [city, setCity] = useState('Bengaluru');
  const [skills, setSkills] = useState<string[]>(['Customer Support', 'Billing']);
  const [skillInput, setSkillInput] = useState('');
  const [preferredCategory, setPreferredCategory] = useState('Cafe & Restaurant');
  const [availability, setAvailability] = useState('Flexible Shifts (Evenings & Weekends)');

  // Recovery specifics
  const [recoveryCode, setRecoveryCode] = useState('');
  const [devResetCodeNotice, setDevResetCodeNotice] = useState<string | null>(null);

  // Status & validation states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle preselected role from intent (e.g. "Post a Job" clicked -> employer, "Apply" clicked -> student)
  useEffect(() => {
    if (authIntent?.preselectedRole) {
      setSelectedRole(authIntent.preselectedRole);
      setStep('login');
    }
  }, [authIntent]);

  // Real-time input detection: Email vs Indian 10-digit Phone
  const getIdentifierType = (val: string): 'empty' | 'email' | 'phone' | 'invalid-phone' => {
    const trimmed = val.trim();
    if (!trimmed) return 'empty';
    if (trimmed.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(trimmed) ? 'email' : 'empty';
    }
    // Only digits check for phone
    if (/^\d+$/.test(trimmed)) {
      return trimmed.length === 10 ? 'phone' : 'invalid-phone';
    }
    return 'empty';
  };

  const identifierType = getIdentifierType(identifier);

  // Check phone strictly
  const isPhoneStrictlyInvalid = identifier.trim().length > 0 && !identifier.includes('@') && (!/^\d+$/.test(identifier.trim()) || identifier.trim().length !== 10);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Za-z]/.test(pwd) && /\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd) || pwd.length >= 12) score += 1;
    return score; // 0 to 3
  };

  const passwordStrength = getPasswordStrength(password);

  const resetFormAlerts = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    resetFormAlerts();
    setStep('login');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormAlerts();

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage('Please enter your Gmail or 10-digit phone number');
      return;
    }

    if (isPhoneStrictlyInvalid) {
      setErrorMessage('Phone number must contain exactly 10 digits.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithCredentials(cleanId, password, selectedRole);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid credentials');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Welcome back! Loading your dashboard...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormAlerts();

    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    if (selectedRole === 'employer' && !businessName.trim()) {
      setErrorMessage('Please enter your business or organization name');
      return;
    }

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage('Please enter a Gmail address or 10-digit phone number');
      return;
    }

    if (isPhoneStrictlyInvalid) {
      setErrorMessage('Phone number must contain exactly 10 digits.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setErrorMessage('Password must contain at least one letter and one number');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const isEmail = cleanId.includes('@');
      const payload = {
        email: isEmail ? cleanId : undefined,
        phone: !isEmail ? cleanId : undefined,
        password,
        role: selectedRole,
        name: name.trim(),
        collegeOrBusiness: selectedRole === 'employer' ? businessName.trim() : (name.trim() + ' (Job Seeker)'),
        city,
        skills,
        availability,
        preferredCategories: [preferredCategory],
      };

      const res = await registerWithCredentials(payload);
      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Account created successfully! Preparing your workspace...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormAlerts();

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage('Enter your Gmail or phone number');
      return;
    }

    if (isPhoneStrictlyInvalid) {
      setErrorMessage('Phone number must contain exactly 10 digits.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await forgotPassword(cleanId);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Account not found');
        return;
      }

      setSuccessMessage(res.message || 'Reset instructions sent');
      if (res.resetCode) {
        setDevResetCodeNotice(`Verification Code: ${res.resetCode}`);
        setRecoveryCode(res.resetCode);
      }
      setStep('reset-code');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Unable to send reset instructions');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormAlerts();

    if (!recoveryCode.trim()) {
      setErrorMessage('Please enter the 6-digit verification code');
      return;
    }

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setErrorMessage('New password must be at least 8 characters with letters & numbers');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(identifier.trim(), recoveryCode.trim(), password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to reset password');
        return;
      }

      setSuccessMessage('Password reset successfully! Please sign in with your new password.');
      setPassword('');
      setConfirmPassword('');
      setStep('login');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Failed to reset password');
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (sk: string) => {
    setSkills(skills.filter(s => s !== sk));
  };

  // --------------------------------------------------------------------------
  // RENDER CARDS
  // --------------------------------------------------------------------------
  return (
    <div className={`relative w-full ${isModal ? 'min-h-[580px]' : 'h-screen min-h-screen'} flex flex-col items-center justify-center p-3 sm:p-6 overflow-hidden select-none`}>
      {/* Slow-moving abstract pastel background atmosphere */}
      {!isModal && <PastelDigitalAtmosphere />}
      
      {/* Custom magnetic contrasting cursor */}
      <CustomCursor />

      {/* Floating brand header (desktop / mobile compact) */}
      {!isModal && (
        <div className="absolute top-4 sm:top-6 left-4 sm:left-8 z-30 flex items-center gap-2.5 pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-cyan-400/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-black text-sm shadow-[0_0_15px_rgba(34,211,238,0.25)]">
            W
          </div>
          <span className="font-extrabold text-white text-base tracking-tight drop-shadow-sm">WorkFlex</span>
          <span className="hidden sm:inline-block text-[10px] text-cyan-300/70 border border-cyan-400/25 px-2 py-0.5 rounded-full font-medium ml-1">
            Verified Shifts
          </span>
        </div>
      )}

      {/* Cancel button if modal mode */}
      {isModal && onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 z-40 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition"
        >
          ✕
        </button>
      )}

      {/* Main Glass Deck Container: Strict 100vh / 100vw fitting with zero page scroll */}
      <div className="relative z-20 w-full max-w-xl max-h-[92vh] flex flex-col items-center justify-center">

        {/* ------------------------------------------------------------------ */}
        {/* CARD 1: ROLE SELECTION ("What are you here to do?")                 */}
        {/* ------------------------------------------------------------------ */}
        {step === 'role-select' && (
          <div className="w-full bg-[#0B0F1A]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-300 flex flex-col text-center">
            <div className="space-y-1 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#BAE6FD]/10 border border-[#BAE6FD]/30 text-[#BAE6FD] text-[11px] font-bold tracking-wide uppercase">
                <Sparkles className="w-3 h-3 text-[#BAE6FD]" />
                WorkFlex Authentication
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
                Welcome back
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/80">
                Let's get you where you need to go.
              </p>
            </div>

            <div className="text-left mb-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                What are you here to do?
              </h2>
            </div>

            {/* Two selectable large glass cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Employee / Job Seeker Card */}
              <div
                onClick={() => handleSelectRole('student')}
                data-magnetic="true"
                className={`role-card group relative p-5 rounded-2xl border transition-all duration-300 text-left cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'student'
                    ? 'bg-gradient-to-b from-[#BAE6FD]/20 to-[#C7D2FE]/10 border-[#BAE6FD]/70 shadow-[0_0_30px_rgba(186,230,253,0.25)] scale-[1.02]'
                    : 'bg-white/[0.03] border-white/10 hover:border-[#BAE6FD]/40 hover:bg-white/[0.06] hover:scale-[1.01]'
                }`}
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-[#BAE6FD]/20 border border-[#BAE6FD]/40 flex items-center justify-center text-[#BAE6FD] text-xl shadow-inner group-hover:scale-105 transition-transform">
                    👤
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-[#BAE6FD] transition-colors">
                      I'm looking for work
                    </h3>
                    <p className="text-xs text-slate-300/80 mt-1 leading-relaxed">
                      Find part-time and short-term jobs near you.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#BAE6FD] bg-[#BAE6FD]/10 px-2 py-0.5 rounded-md border border-[#BAE6FD]/20">
                    Employee / Job Seeker
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#BAE6FD] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Employer Card */}
              <div
                onClick={() => handleSelectRole('employer')}
                data-magnetic="true"
                className={`role-card group relative p-5 rounded-2xl border transition-all duration-300 text-left cursor-pointer flex flex-col justify-between ${
                  selectedRole === 'employer'
                    ? 'bg-gradient-to-b from-purple-500/20 to-pink-600/10 border-purple-400/70 shadow-[0_0_30px_rgba(192,132,252,0.22)] scale-[1.02]'
                    : 'bg-white/[0.03] border-white/10 hover:border-purple-400/40 hover:bg-white/[0.06] hover:scale-[1.01]'
                }`}
              >
                <div className="space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-400/20 border border-purple-400/40 flex items-center justify-center text-purple-300 text-xl shadow-inner group-hover:scale-105 transition-transform">
                    💼
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white group-hover:text-purple-200 transition-colors">
                      I'm hiring
                    </h3>
                    <p className="text-xs text-slate-300/80 mt-1 leading-relaxed">
                      Post jobs and find people for short-term work.
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 bg-purple-400/10 px-2 py-0.5 rounded-md border border-purple-400/20">
                    Employer
                  </span>
                  <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-slate-400">
                Please select your role to sign in or create an account.
              </p>
              {!isModal && (
                <button
                  type="button"
                  onClick={() => setIsGuestExploring(true)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>Explore jobs as guest</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* CARD 2: LOGIN FORM                                                 */}
        {/* ------------------------------------------------------------------ */}
        {step === 'login' && (
          <div className="w-full bg-[#0B0F1A]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.7)] animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col">
            {/* Header with back button */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => { resetFormAlerts(); setStep('role-select'); }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-2.5 py-1 rounded-lg hover:bg-white/5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Switch Role</span>
              </button>

              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                selectedRole === 'employer'
                  ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
              }`}>
                {selectedRole === 'employer' ? '💼 Employer Account' : '👤 Employee / Job Seeker'}
              </span>
            </div>

            <div className="space-y-1 mb-5">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-xs text-slate-400">
                Enter your registered details to access your dashboard.
              </p>
            </div>

            {/* Error / Success Toast Banner */}
            {errorMessage && (
              <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email or Phone Input */}
              <div className="space-y-1 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Email or phone number
                  </label>
                  {identifierType === 'phone' && (
                    <span className="text-[10px] text-cyan-400 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" /> Valid 10-Digit Mobile
                    </span>
                  )}
                  {identifierType === 'email' && (
                    <span className="text-[10px] text-cyan-400 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" /> Valid Email
                    </span>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    {identifierType === 'phone' ? (
                      <Phone className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Disallow letters if strictly starting phone entry (only digits and @ . allowed)
                      setIdentifier(val);
                      resetFormAlerts();
                    }}
                    placeholder="Enter Gmail or 10-digit phone number"
                    className={`w-full bg-[#111827]/80 border text-white text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition ${
                      isPhoneStrictlyInvalid
                        ? 'border-amber-400/60 focus:border-amber-400'
                        : 'border-white/10 focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/30'
                    }`}
                  />
                </div>

                {isPhoneStrictlyInvalid && (
                  <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    Phone number must contain exactly 10 digits.
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); resetFormAlerts(); }}
                    placeholder="Enter your password"
                    className="w-full bg-[#111827]/80 border border-white/10 text-white text-xs sm:text-sm rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/30 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password row */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-cyan-400 focus:ring-0 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => { resetFormAlerts(); setStep('forgot'); }}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Sign In Button (Magnetic feedback) */}
              <button
                type="submit"
                disabled={isLoading || isPhoneStrictlyInvalid}
                className="btn-floating-primary w-full py-3 rounded-xl text-sm font-extrabold tracking-wide transition-all disabled:opacity-50 cursor-pointer mt-2"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In →'}</span>
              </button>
            </form>

            {/* Secondary Option: Create Account */}
            <div className="mt-5 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { resetFormAlerts(); setStep('register'); }}
                  className="font-bold text-[#BAE6FD] hover:text-white transition underline underline-offset-2 ml-1 cursor-pointer"
                >
                  Create one
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* CARD 3: FORGOT PASSWORD RECOVERY                                   */}
        {/* ------------------------------------------------------------------ */}
        {step === 'forgot' && (
          <div className="w-full bg-[#0B0F1A]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.7)] animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col text-left">
            <button
              type="button"
              onClick={() => { resetFormAlerts(); setStep('login'); }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition mb-3 w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </button>

            <div className="space-y-1 mb-5">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Reset your password
              </h2>
              <p className="text-xs text-slate-400">
                Enter your registered Gmail or 10-digit phone number. We'll verify your account and issue reset instructions.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Enter your Gmail or phone number
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <KeyRound className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); resetFormAlerts(); }}
                    placeholder="Enter Gmail or 10-digit phone number"
                    className="w-full bg-[#111827]/80 border border-white/10 text-white text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
                {isPhoneStrictlyInvalid && (
                  <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    Phone number must contain exactly 10 digits.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || isPhoneStrictlyInvalid}
                className="btn-floating-primary w-full py-3 rounded-xl text-sm font-extrabold tracking-wide transition-all disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Sending...' : 'Send Reset Link / Code →'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* CARD 4: ENTER VERIFICATION CODE & NEW PASSWORD                     */}
        {/* ------------------------------------------------------------------ */}
        {step === 'reset-code' && (
          <div className="w-full bg-[#0B0F1A]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.7)] animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col text-left">
            <button
              type="button"
              onClick={() => { resetFormAlerts(); setStep('forgot'); }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition mb-3 w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <div className="space-y-1 mb-4">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Enter Verification Code
              </h2>
              <p className="text-xs text-slate-400">
                Instructions sent to <span className="text-cyan-300 font-semibold">{identifier}</span>.
              </p>
            </div>

            {devResetCodeNotice && (
              <div className="mb-3 px-3 py-2 bg-cyan-500/10 border border-cyan-400/30 rounded-xl text-cyan-300 text-xs flex items-center justify-between font-mono">
                <span>{devResetCodeNotice}</span>
                <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold">Auto-filled</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  6-Digit Verification Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.trim())}
                  placeholder="e.g. 842109"
                  className="w-full tracking-widest text-center font-mono font-bold text-lg bg-[#111827]/80 border border-white/10 text-white rounded-xl py-2 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  New Password * (Min 8 characters, letters & numbers)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-[#111827]/80 border border-white/10 text-white text-xs sm:text-sm rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:border-cyan-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Confirm New Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-[#111827]/80 border border-white/10 text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-floating-primary w-full py-3 rounded-xl text-sm font-extrabold tracking-wide transition-all cursor-pointer mt-2"
              >
                <span>{isLoading ? 'Updating Password...' : 'Save New Password & Continue →'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* CARD 5: REGISTRATION (EMPLOYEE vs EMPLOYER)                        */}
        {/* ------------------------------------------------------------------ */}
        {step === 'register' && (
          <div className="w-full bg-[#0B0F1A]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.7)] animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col max-h-[88vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => { resetFormAlerts(); setStep('login'); }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sign in instead</span>
              </button>

              {/* Role Toggle */}
              <div className="flex items-center p-0.5 bg-black/40 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    selectedRole === 'student'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  👤 Job Seeker
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('employer')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    selectedRole === 'employer'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💼 Employer
                </button>
              </div>
            </div>

            <div className="space-y-1 mb-4 text-left">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Create your account
              </h2>
              <p className="text-xs text-slate-400">
                {selectedRole === 'student'
                  ? 'Join as an Employee / Job Seeker to find verified flexible part-time work.'
                  : 'Join as an Employer to post short-term work shifts and hire verified people.'}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-left">
              {/* Common Required Field: Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {selectedRole === 'employer' ? 'Contact Person Name *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={selectedRole === 'employer' ? 'e.g. Ramesh Kumar' : 'e.g. Rahul Sharma'}
                    className="w-full bg-[#111827]/80 border border-white/10 text-white text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              {/* Employer Specific: Business / Organization Name */}
              {selectedRole === 'employer' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Business / Organization Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Venkatesh Stores & Provisions"
                      className="w-full bg-[#111827]/80 border border-white/10 text-white text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-purple-400 transition"
                    />
                  </div>
                </div>
              )}

              {/* Email or Phone Input with auto-detection */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Email / Gmail OR Phone Number *
                  </label>
                  {identifierType === 'phone' && (
                    <span className="text-[10px] text-cyan-400 font-medium">✓ Valid 10-Digit Mobile</span>
                  )}
                  {identifierType === 'email' && (
                    <span className="text-[10px] text-cyan-400 font-medium">✓ Valid Email</span>
                  )}
                </div>
                <div className="relative">
                  {identifierType === 'phone' ? (
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 w-4 h-4" />
                  ) : (
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  )}
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); resetFormAlerts(); }}
                    placeholder="Enter Gmail or 10-digit phone number"
                    className={`w-full bg-[#111827]/80 border text-white text-xs sm:text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none transition ${
                      isPhoneStrictlyInvalid
                        ? 'border-amber-400/60 focus:border-amber-400'
                        : 'border-white/10 focus:border-cyan-400'
                    }`}
                  />
                </div>
                {isPhoneStrictlyInvalid && (
                  <p className="text-[11px] text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Phone number must contain exactly 10 digits.
                  </p>
                )}
              </div>

              {/* Password & Confirm Password (Side by side on sm) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 chars"
                      className="w-full bg-[#111827]/80 border border-white/10 text-white text-xs rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-[#111827]/80 border border-white/10 text-white text-xs rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="space-y-1 pt-0.5">
                  <div className="flex gap-1.5 h-1">
                    <div className={`flex-1 rounded-full ${passwordStrength >= 1 ? 'bg-amber-400' : 'bg-slate-800'}`} />
                    <div className={`flex-1 rounded-full ${passwordStrength >= 2 ? 'bg-cyan-400' : 'bg-slate-800'}`} />
                    <div className={`flex-1 rounded-full ${passwordStrength >= 3 ? 'bg-emerald-400' : 'bg-slate-800'}`} />
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {passwordStrength === 1 && 'Weak (add numbers & letters)'}
                    {passwordStrength === 2 && 'Good password'}
                    {passwordStrength === 3 && 'Strong password'}
                  </span>
                </div>
              )}

              {/* Optional Profile Information Separator */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Optional Profile Information
                </span>

                {selectedRole === 'student' ? (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Preferred Job Category</label>
                      <select
                        value={preferredCategory}
                        onChange={(e) => setPreferredCategory(e.target.value)}
                        className="w-full bg-[#111827] border border-white/10 text-white text-xs rounded-lg p-2 focus:outline-none"
                      >
                        <option value="Cafe & Restaurant">Cafe & Restaurant</option>
                        <option value="Retail & Grocery">Retail & Supermarket</option>
                        <option value="Event Support">Event Support & Ushering</option>
                        <option value="Delivery & Errand">Delivery & Logistics</option>
                        <option value="Tutoring & Admin">Tutoring & Academic Assistant</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Your Skills (Press Enter to add)</label>
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {skills.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 text-[10px] border border-cyan-400/30 flex items-center gap-1">
                            {s}
                            <button type="button" onClick={() => removeSkill(s)} className="hover:text-white">✕</button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                        placeholder="Type skill & press Enter"
                        className="w-full bg-[#111827] border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Business Category</label>
                      <select
                        value={businessCategory}
                        onChange={(e) => setBusinessCategory(e.target.value)}
                        className="w-full bg-[#111827] border border-white/10 text-white text-xs rounded-lg p-2 focus:outline-none"
                      >
                        <option value="Retail & Grocery">Retail & Grocery Store</option>
                        <option value="Food & Hospitality">Restaurant & Food Service</option>
                        <option value="Event Management">Event Management & Catering</option>
                        <option value="Warehousing & Logistics">Logistics & Warehousing</option>
                        <option value="Office & Administration">Office & Admin Services</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isPhoneStrictlyInvalid}
                className="btn-floating-primary w-full py-3 rounded-xl text-sm font-extrabold tracking-wide transition-all disabled:opacity-50 cursor-pointer mt-2"
              >
                <span>{isLoading ? 'Creating Account...' : 'Create Account →'}</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
