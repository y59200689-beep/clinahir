interface StatusPillProps {
  value: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusPill({ value, size = 'sm', className = '' }: StatusPillProps) {
  const normalized = (value || '').toLowerCase().trim();

  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200/80';
  let dotStyles = 'bg-slate-400';

  if (['won', 'completed', 'paid', 'qualified', 'configured', 'protected', 'available', 'operational'].includes(normalized)) {
    badgeStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200/70';
    dotStyles = 'bg-emerald-600';
  } else if (['new', 'in progress', 'processing', 'in-house'].includes(normalized)) {
    badgeStyles = 'bg-sky-50 text-sky-800 border-sky-200/70';
    dotStyles = 'bg-sky-600';
  } else if (['contacted', 'review', 'needs review', 'needs setup', 'pending', 'pre-booking'].includes(normalized)) {
    badgeStyles = 'bg-amber-50 text-amber-800 border-amber-200/70';
    dotStyles = 'bg-amber-600';
  } else if (['lost', 'not_a_fit', 'refunded', 'do_not_contact', 'blocked', 'exhausted', 'error'].includes(normalized)) {
    badgeStyles = 'bg-rose-50 text-rose-800 border-rose-200/70';
    dotStyles = 'bg-rose-600';
  }

  const label =
    normalized === 'review'
      ? 'Needs review'
      : normalized === 'not_a_fit'
      ? 'Not a fit'
      : normalized === 'do_not_contact'
      ? 'Do not contact'
      : normalized.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border px-2 py-0.5 tracking-normal ${
        size === 'sm' ? 'text-xs' : 'text-sm px-2.5 py-1'
      } ${badgeStyles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles}`} />
      <span>{label}</span>
    </span>
  );
}
