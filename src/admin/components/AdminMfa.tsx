import { useEffect, useRef, useState, type FormEvent } from 'react';
import { adminApi } from '../types';
import { useAdminLocale } from '../i18n';

export function AdminMfa({ factorId: existingFactor, onVerified, onCancel }: { factorId?: string; onVerified: (email: string) => void; onCancel: () => void }) {
  const { t, errorText } = useAdminLocale();
  const [factorId, setFactorId] = useState(existingFactor ?? '');
  const [setup, setSetup] = useState<{ qrCode: string; secret?: string } | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const enrollRef = useRef<HTMLButtonElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (factorId) codeRef.current?.focus(); else enrollRef.current?.focus(); }, [factorId]);
  async function enroll() {
    setBusy(true); setError('');
    try { const result = await adminApi<{ factorId: string; qrCode: string; secret?: string }>('mfa-enroll', {}); setFactorId(result.factorId); setSetup(result); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function verify(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { const result = await adminApi<{ user: { email: string } }>('mfa-verify', { factorId, code }); setSetup(null); setCode(''); onVerified(result.user.email); }
    catch (e) { setError((e as Error).message); codeRef.current?.focus(); codeRef.current?.select(); }
    finally { setBusy(false); }
  }
  return <div className="space-y-4">
    <p className="text-sm text-slate-700">{t('Use your authenticator app to finish signing in.')}</p>
    {error && <p id="mfa-error" role="alert" className="text-sm text-red-800">{errorText(error)}</p>}
    {!factorId ? <button ref={enrollRef} type="button" className="w-full rounded-lg bg-[#6754cf] px-4 py-3 text-white" disabled={busy} onClick={() => void enroll()}>{t(busy ? 'Verifying…' : 'Set up authenticator')}</button> : <>
      {setup && <div className="space-y-3">
        <p className="text-sm text-slate-700">{t('Scan this QR code with your authenticator. Keep the setup key private.')}</p>
        <img src={setup.qrCode} alt={t('Authenticator setup QR code')} width={200} height={200} className="mx-auto" />
        {setup.secret && <details className="text-sm text-slate-700"><summary>{t('Enter the setup key manually')}</summary><code className="mt-2 block break-all select-all">{setup.secret}</code></details>}
      </div>}
      <form onSubmit={verify} className="space-y-3">
        <label className="block text-sm text-slate-700" htmlFor="mfa-code">{t('Authenticator code')}</label>
        <input ref={codeRef} id="mfa-code" name="code" inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{6}" minLength={6} maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} aria-invalid={Boolean(error)} aria-describedby={error ? 'mfa-error' : undefined} className="w-full rounded-lg border border-slate-300 px-3 py-3 text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6754cf]" />
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-[#6754cf] px-4 py-3 text-white">{t(busy ? 'Verifying…' : 'Verify authenticator')}</button>
      </form>
    </>}
    <button type="button" disabled={busy} onClick={async () => { setBusy(true); try { await adminApi('logout', {}); onCancel(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } }} className="text-sm text-slate-700 underline">{t('Cancel and sign out')}</button>
  </div>;
}
