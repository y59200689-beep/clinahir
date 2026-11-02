import { useState, type FormEvent } from 'react';
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  Users,
  Globe2,
  ChevronLeft,
  ArrowRight,
  LoaderCircle,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { adminApi } from '../types';

interface LoginPageProps {
  onLogin: (email: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const data = new FormData(e.currentTarget);
    try {
      const response = await adminApi<{ user: { email: string } }>('login', {
        email: data.get('email'),
        password: data.get('password'),
      });
      onLogin(response.user.email);
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid lg:grid-cols-12 min-h-[620px]">
        {/* Left Editorial Brand Showcase */}
        <div className="lg:col-span-5 bg-[#0A261D] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Radial Gradient */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-700/20 blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <a href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center text-[#0A261D] font-bold text-xl shadow-md">
                C
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight block">Clinahir</span>
                <span className="text-xs text-emerald-300/70 block -mt-0.5">Workspace</span>
              </div>
            </a>
          </div>

          {/* Center Editorial Copy */}
          <div className="my-10 relative z-10 space-y-6">
            <span className="inline-block text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">
              Executive Administration
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              One clear command center for your clinic.
            </h1>
            <p className="text-sm text-emerald-200/80 leading-relaxed">
              Review qualified patient inquiries, manage website content in English and French, and oversee integration deliveries.
            </p>

            <div className="pt-2 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <Users size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Verified Inquiry Pipeline</h4>
                  <p className="text-[12px] text-emerald-200/60">Capture and follow up with high-intent patient consultations.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <Globe2 size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Bilingual Publishing</h4>
                  <p className="text-[12px] text-emerald-200/60">Manage live clinical content with simultaneous EN/FR synchronization.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Sovereign Data Protection</h4>
                  <p className="text-[12px] text-emerald-200/60">Strict authenticated access with no third-party data tracking.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-10 text-[11px] text-emerald-300/50 flex items-center gap-1.5">
            <LockKeyhole size={13} />
            <span>End-to-end encrypted session</span>
          </div>
        </div>

        {/* Right Authentication Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft size={16} />
              <span>Back to website</span>
            </a>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70">
              Private Portal
            </span>
          </div>

          <div className="max-w-md w-full mx-auto my-auto py-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter your administrative credentials to access your clinic workspace.
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200/70 text-rose-800 text-xs font-medium flex items-start gap-3"
              >
                <AlertCircle size={18} className="shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Email address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="director@clinahir.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    maxLength={200}
                    autoComplete="current-password"
                    placeholder="Enter your security password"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#0A3A2A] hover:bg-emerald-800 text-white font-semibold text-sm shadow-md shadow-emerald-950/10 flex items-center justify-center gap-2 transition-all disabled:opacity-60 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    <span>Verifying session…</span>
                  </>
                ) : (
                  <>
                    <span>Enter workspace</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-400">
              <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
              <span>Owner provisioned only. Public registration is restricted.</span>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Clinahir Operations Ltd. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
