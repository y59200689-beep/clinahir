import { useAdminLocale } from '../i18n';
import React, { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface AdminDrawerProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}

export function AdminDrawer({
  title,
  subtitle,
  isOpen,
  onClose,
  children,
  width = 'max-w-xl',
}: AdminDrawerProps) {
  const { t, errorText, intlLocale } = useAdminLocale();
  const titleId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => Array.from(drawerRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]') ?? []).filter(element => element.tabIndex >= 0 && element.getClientRects().length);
    focusable()[0]?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); onClose(); }
      if (e.key !== 'Tab') return;
      const controls = focusable(), first = controls[0], last = controls[controls.length - 1];
      if (!first) { e.preventDefault(); drawerRef.current?.focus(); return; }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = overflow; previous?.focus(); };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={drawerRef}
          role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
          className={`w-screen ${width} bg-white shadow-2xl flex flex-col border-l border-slate-200/80 animate-in slide-in-from-right duration-300`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/80 sticky top-0 z-10 backdrop-blur-md">
            <div>
              <h2 id={titleId} className="text-lg font-bold text-slate-900 tracking-tight">{t(title)}</h2>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{t(subtitle)}</p>}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label={t("Close panel")}
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

