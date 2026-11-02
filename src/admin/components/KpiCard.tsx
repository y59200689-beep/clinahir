import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  isHero?: boolean;
  isActive?: boolean;
  icon?: React.ElementType;
  onClick?: () => void;
  actionLabel?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  change,
  changeType = 'positive',
  isHero = false,
  isActive = false,
  icon: Icon,
  onClick,
}: KpiCardProps) {
  const Component = onClick ? 'button' : 'div';

  if (isHero) {
    return (
      <Component
        onClick={onClick}
        className={`w-full text-left p-6 rounded-xl border transition-colors ${
          onClick ? 'cursor-pointer hover:border-emerald-600/50' : ''
        } bg-[#0A261D] border-emerald-900/60 text-white`}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-emerald-200/90 text-sm font-medium tracking-normal flex items-center gap-2">
            {Icon && <Icon size={16} className="text-emerald-300" />}
            {title}
          </span>
          {onClick && (
            <div className="w-6 h-6 rounded-md bg-emerald-900/80 flex items-center justify-center text-emerald-300">
              <ArrowUpRight size={14} />
            </div>
          )}
        </div>

        <div className="mb-3">
          <div className="text-3xl font-semibold tracking-tight text-white font-mono tabular-nums">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-emerald-300/70 mt-1">{subtitle}</p>
          )}
        </div>

        {change && (
          <div className="text-xs text-emerald-300 font-mono mt-2">
            {change}
          </div>
        )}
      </Component>
    );
  }

  return (
    <Component
      onClick={onClick}
      className={`w-full text-left p-6 rounded-xl border bg-white transition-colors ${
        isActive
          ? 'border-emerald-700 ring-1 ring-emerald-700/20'
          : 'border-slate-200/90 hover:border-slate-300'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-600 text-sm font-medium tracking-normal flex items-center gap-2">
          {Icon && <Icon size={16} className="text-slate-400" />}
          {title}
        </span>
        {onClick && (
          <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
            <ArrowUpRight size={14} />
          </div>
        )}
      </div>

      <div className="mb-3">
        <div className="text-3xl font-semibold tracking-tight text-slate-900 font-mono tabular-nums">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>

      {change && (
        <div className="text-xs font-mono mt-2 text-slate-500">
          <span
            className={
              changeType === 'positive'
                ? 'text-emerald-700'
                : changeType === 'negative'
                ? 'text-rose-600'
                : 'text-slate-600'
            }
          >
            {change}
          </span>
        </div>
      )}
    </Component>
  );
}
