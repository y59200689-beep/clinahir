import { useEffect, useId, useRef, type ReactNode } from 'react';

export default function Modal({ title, closeLabel, onClose, children, tone = 'demo' }: { title: string; closeLabel: string; onClose: () => void; children: ReactNode; tone?: 'demo' | 'admin' }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog data-i18n-managed ref={ref} aria-labelledby={titleId} className={tone === 'demo' ? 'demo-modal' : 'admin-modal'} onCancel={event => { event.preventDefault(); close.current(); }}>
    <div className="flex items-center justify-between gap-4 mb-4"><h2 id={titleId} className="text-xl font-semibold">{title}</h2><button type="button" onClick={onClose} aria-label={closeLabel} className="rounded-lg px-3 py-2 hover:bg-white/10">×</button></div>
    {children}
  </dialog>;
}
