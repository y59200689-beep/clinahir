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
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden grid lg:grid-cols-12 min-h-[560px]">
        {/* Left Editorial Panel */}
        <div className="lg:col-span-5 bg-[#0A261D] text-white p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <a href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-emerald-500 flex items-center justify-center text-[#0A261D] font-bold text-base">
                C
              </div>
              <span className="font-semibold text-base tracking-normal">Clinahir</span>
            </a>
          </div>

          <div className="my-8 space-y-4">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-snug">
              Clinical operations and patient inquiry workspace.
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed">
              Manage qualified consultations, review prospects, and update bilingual website copy.
            </p>

            <div className="pt-4 space-y-3.5">
              <div className="flex items-start gap-3">
                <Users size={16} className="text-emerald-300 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-medium text-white">Inquiry Pipeline</div>
                  <div className="text-emerald-200/60 mt-0.5">Track and qualify patient requests.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe2 size={16} className="text-emerald-300 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-medium text-white">Bilingual Publishing</div>
                  <div className="text-emerald-200/60 mt-0.5">Instant English and French sync.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck size={16} className="text-emerald-300 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-medium text-white">Authenticated Access</div>
                  <div className="text-emerald-200/60 mt-0.5">Restricted owner workspace.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-emerald-300/40 flex items-center gap-1.5">
            <LockKeyhole size={12} />
            <span>Encrypted owner session</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <a
              href="/"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft size={14} />
              <span>Back to website</span>
            </a>
          </div>

          <div className="max-w-sm w-full mx-auto my-auto py-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                Sign in
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your administrative credentials to continue.
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200/70 text-rose-800 text-xs flex items-start gap-2.5"
              >
                <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="director@clinahir.tech"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 transition-colors placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    maxLength={200}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 transition-colors placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-[#0A261D] hover:bg-emerald-900 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={15} className="animate-spin" />
                    <span>Verifying…</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck size={15} className="text-emerald-700 shrink-0" />
              <span>Owner provisioned only. Registration is private.</span>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400">
            © {new Date().getFullYear()} Clinahir
          </div>
        </div>
      </div>
    </div>
  );
}
