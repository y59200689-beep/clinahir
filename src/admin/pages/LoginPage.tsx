import { AdminLanguageSwitch } from '../i18n';
import { useAdminLocale } from '../i18n';
import { useEffect, useState, type FormEvent } from 'react';
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
import { AdminMfa } from '../components/AdminMfa';

interface LoginPageProps {
  onLogin: (email: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { t, errorText, intlLocale } = useAdminLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mfa, setMfa] = useState<{ factorId?: string } | null>(null);
  const [ownerSetup, setOwnerSetup] = useState(false);
  const [notice, setNotice] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [recoveryLink, setRecoveryLink] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('access_token');
    if (!token) return;
    setRecoveryLink(params.get('type') === 'recovery');
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setIsSubmitting(true);
    void adminApi('activate', { accessToken: token }).then(() => setOwnerSetup(true)).catch(e => setErrorMessage((e as Error).message)).finally(() => setIsSubmitting(false));
  }, []);
  async function saveOwnerPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setErrorMessage('');
    const form = new FormData(event.currentTarget);
    const password = String(form.get('new-password') ?? '');
    if (password !== form.get('confirm-password')) { setErrorMessage('The passwords do not match.'); return; }
    setIsSubmitting(true);
    try { await adminApi('set-password', { password }); setOwnerSetup(false); setNotice('Password saved. You can now sign in.'); }
    catch (e) { setErrorMessage((e as Error).message); }
    finally { setIsSubmitting(false); }
  }

  async function requestPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setErrorMessage(''); setIsSubmitting(true);
    try { await adminApi('request-password-reset', { email: new FormData(event.currentTarget).get('email') }); setNotice('If this is the owner account, a password reset link has been requested.'); }
    catch (e) { setErrorMessage((e as Error).message); }
    finally { setIsSubmitting(false); }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const data = new FormData(e.currentTarget);
    try {
      const response = await adminApi<{ user: { email: string }; mfa?: { required: boolean; factorId?: string } }>('login', {
        email: data.get('email'),
        password: data.get('password'),
      });
      if (response.mfa?.required) setMfa({ factorId: response.mfa.factorId });
      else onLogin(response.user.email);
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-workspace min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="absolute right-4 top-4"><AdminLanguageSwitch /></div>
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden grid lg:grid-cols-12 min-h-[560px]">
        {/* Left Editorial Panel */}
        <div className="lg:col-span-5 bg-[#28233f] text-white p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <a href="/" className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-emerald-500 flex items-center justify-center text-[#0A261D] font-bold text-base"> {t("C")} </div>
              <span className="font-semibold text-base tracking-normal"> {t("Clinahir")} </span>
            </a>
          </div>

          <div className="my-8 space-y-4">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-snug"> {t("Your business leads, website and integrations.")} </h1>
            <p className="text-xs sm:text-sm text-emerald-200/70 leading-relaxed"> {t("Manage qualified consultations, review prospects, and update bilingual website copy.")} </p>

            <div className="pt-4 space-y-3.5">
              <div className="flex items-start gap-3">
                <Users size={16} className="text-emerald-300 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-medium text-white"> {t("Inquiry Pipeline")} </div>
                  <div className="text-emerald-200/60 mt-0.5"> {t("Track and qualify demo requests.")} </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe2 size={16} className="text-emerald-300 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-medium text-white"> {t("Bilingual Publishing")} </div>
                  <div className="text-emerald-200/60 mt-0.5"> {t("Instant English and French sync.")} </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck size={16} className="text-emerald-300 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-medium text-white"> {t("Authenticated Access")} </div>
                  <div className="text-emerald-200/60 mt-0.5"> {t("Restricted owner workspace.")} </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-emerald-100/80 flex items-center gap-1.5">
            <LockKeyhole size={12} />
            <span> {t("Encrypted owner session")} </span>
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
              <span> {t("Back to website")} </span>
            </a>
          </div>

          <div className="max-w-sm w-full mx-auto my-auto py-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight"> {t(ownerSetup ? recoveryLink ? "Reset your password" : "Set your owner password" : forgotPassword ? "Reset your password" : mfa ? "Authenticator verification" : "Sign in")} </h2>
              <p className="text-xs text-slate-500 mt-1"> {t("Enter your administrative credentials to continue.")} </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200/70 text-rose-800 text-xs flex items-start gap-2.5"
              >
                <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                <span>{errorText(errorMessage)}</span>
              </div>
            )}

            {notice && <p role="status" className="mb-4 text-sm text-emerald-800">{t(notice)}</p>}
            {ownerSetup ? <form onSubmit={saveOwnerPassword} className="space-y-4">
              <label className="block text-sm text-slate-700" htmlFor="owner-password">{t('New password')}</label>
              <input id="owner-password" name="new-password" type="password" autoComplete="new-password" minLength={12} maxLength={200} required className="w-full rounded-lg border border-slate-300 px-3 py-3" />
              <label className="block text-sm text-slate-700" htmlFor="confirm-owner-password">{t('Confirm new password')}</label>
              <input id="confirm-owner-password" name="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={200} required className="w-full rounded-lg border border-slate-300 px-3 py-3" />
              <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-[#6754cf] px-4 py-3 text-white">{t(isSubmitting ? 'Verifying…' : 'Save owner password')}</button>
            </form> : forgotPassword ? <form onSubmit={requestPasswordReset} className="space-y-4">
              <label className="block text-sm text-slate-700" htmlFor="recovery-email">{t('Email address')}</label>
              <input id="recovery-email" name="email" type="email" autoComplete="username" required maxLength={254} className="w-full rounded-lg border border-slate-300 px-3 py-3" />
              <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-[#6754cf] px-4 py-3 text-white">{t(isSubmitting ? 'Verifying…' : 'Send reset link')}</button>
              <button type="button" onClick={() => { setForgotPassword(false); setNotice(''); setErrorMessage(''); }} className="text-sm text-[#6754cf] underline">{t('Back to sign in')}</button>
            </form> : mfa ? <AdminMfa factorId={mfa.factorId} onVerified={onLogin} onCancel={() => setMfa(null)} /> : <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5"> {t("Email address")} </label>
                <input
                  aria-label={t("Email address")} name="email"
                  type="email"
                  required
                  autoComplete="username"
                  placeholder={t("director@clinahir.tech")}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 transition-colors placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5"> {t("Password")} </label>
                <div className="relative">
                  <input
                    aria-label={t("Password")} name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    maxLength={200}
                    autoComplete="current-password"
                    placeholder={t("Enter your password")}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 transition-colors placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? t("Hide password") : t("Show password")}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-[#6754cf] hover:bg-emerald-900 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle size={15} className="animate-spin" />
                    <span> {t("Verifying…")} </span>
                  </>
                ) : (
                  <>
                    <span> {t("Sign in")} </span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
              <button type="button" onClick={() => { setForgotPassword(true); setNotice(''); setErrorMessage(''); }} className="text-sm text-[#6754cf] underline">{t('Forgot password?')}</button>
            </form>}

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck size={15} className="text-emerald-700 shrink-0" />
              <span> {t("Owner provisioned only. Registration is private.")} </span>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400">
            © {new Date().getFullYear()} {t("Clinahir")} </div>
        </div>
      </div>
    </main>
  );
}
