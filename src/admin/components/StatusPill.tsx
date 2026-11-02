import { CheckCircle2, Clock, AlertTriangle, XCircle, ShieldCheck, HelpCircle } from 'lucide-react';

interface StatusPillProps {
  value: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusPill({ value, size = 'sm', className = '' }: StatusPillProps) {
  const normalized = (value || '').toLowerCase().trim();

  // Color mapping based on executive clinical UI palette
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200/80';
  let dotStyles = 'bg-slate-400';

  if (['won', 'completed', 'paid', 'qualified', 'configured', 'protected', 'available'].includes(normalized)) {
    badgeStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200/60';
    dotStyles = 'bg-emerald-500';
  } else if (['new', 'in progress', 'processing', 'in-house'].includes(normalized)) {
    badgeStyles = 'bg-blue-50 text-blue-800 border-blue-200/60';
    dotStyles = 'bg-blue-500 animate-pulse';
  } else if (['contacted', 'review', 'needs review', 'needs setup', 'pending', 'pre-booking'].includes(normalized)) {
    badgeStyles = 'bg-amber-50 text-amber-800 border-amber-200/60';
    dotStyles = 'bg-amber-500';
  } else if (['lost', 'not_a_fit', 'refunded', 'do_not_contact', 'blocked', 'exhausted', 'error'].includes(normalized)) {
    badgeStyles = 'bg-rose-50 text-rose-800 border-rose-200/60';
    dotStyles = 'bg-rose-500';
  }

  const label = normalized === 'review'
    ? 'Needs review'
    : normalized === 'not_a_fit'
    ? 'Not a fit'
    : normalized === 'do_not_contact'
    ? 'Do not contact'
    : normalized.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border px-2.5 py-0.5 tracking-tight transition-colors ${
        size === 'sm' ? 'text-xs' : 'text-sm px-3 py-1'
      } ${badgeStyles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles}`} />
      <span>{label}</span>
    </span>
  );
}
