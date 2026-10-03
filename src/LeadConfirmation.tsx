import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Check, X } from 'lucide-react';

export function LeadConfirmation({ open, language, onClose }: { open: boolean; language: 'en' | 'fr'; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!open || !element) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);
  const fr = language === 'fr';
  return createPortal(<dialog ref={dialog} aria-labelledby="lead-confirmation-title" aria-describedby="lead-confirmation-body"
    onCancel={event => { event.preventDefault(); onClose(); }}
    className="lead-confirmation w-[calc(100%-2rem)] max-w-md overflow-visible rounded-[32px] border border-[var(--border)] bg-white p-7 text-[var(--text-strong)] shadow-[0_32px_100px_rgba(0,0,0,.22)] sm:p-9">
    <button type="button" onClick={onClose} aria-label={fr ? 'Fermer' : 'Close'} className="absolute right-4 top-4 rounded-full p-2 text-[var(--text-body)] transition hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)]"><X size={20}/></button>
    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"><Check size={32} strokeWidth={2.5}/></div>
    <p className="mb-3 text-xs font-bold tracking-[.18em] text-[var(--brand-primary-hover)]">CLINAHIR</p>
    <h2 id="lead-confirmation-title" className="text-3xl font-semibold tracking-tight">{fr ? 'Demande bien reçue' : 'Request received'}</h2>
    <p id="lead-confirmation-body" className="mt-4 leading-relaxed text-[var(--text-body)]">{fr ? 'Merci pour votre intérêt. Nous vous contacterons à l’adresse e-mail indiquée pour organiser une démonstration adaptée à votre centre.' : 'Thank you for your interest. We’ll contact you at the email address you provided to arrange a demo tailored to your center.'}</p>
    <div className="mt-6 rounded-2xl bg-[var(--surface-muted)] p-4 text-sm leading-relaxed text-[var(--text-body)]">{fr ? 'Vous pouvez continuer à explorer la démo interactive en attendant.' : 'You can keep exploring the interactive demo while you wait.'}</div>
    <button autoFocus type="button" onClick={onClose} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-primary)] px-5 py-4 font-semibold text-white transition hover:bg-[var(--brand-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)]">{fr ? 'Continuer à explorer' : 'Continue exploring'}<ArrowRight size={18}/></button>
  </dialog>, document.body);
}
