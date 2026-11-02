import React, { type ReactNode } from 'react';
import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
  actionLabel,
}: KpiCardProps) {
  const Component = onClick ? 'button' : 'div';

  if (isHero) {
    return (
      <Component
        onClick={onClick}
        className={`relative w-full text-left p-6 rounded-2xl transition-all duration-200 border overflow-hidden ${
          onClick ? 'cursor-pointer hover:shadow-lg hover:border-emerald-600/40 active:scale-[0.99]' : ''
        } bg-[#0A3A2A] border-emerald-800 text-white shadow-sm`}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-emerald-200/90 text-sm font-medium tracking-tight flex items-center gap-2">
            {Icon && <Icon size={18} className="text-emerald-300" />}
            {title}
          </span>
          <div className="w-8 h-8 rounded-full bg-emerald-800/80 flex items-center justify-center text-emerald-200">
            <ArrowUpRight size={16} />
          </div>
        </div>

        <div className="mb-4">
          <div className="text-3xl lg:text-4xl font-bold tracking-tight text-white font-mono tabular-nums">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-emerald-200/80 mt-1">{subtitle}</p>
          )}
        </div>

        {change && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-800/90 text-emerald-100 border border-emerald-700/60">
            <TrendingUp size={13} className="text-emerald-300" />
            <span>{change}</span>
          </div>
        )}
      </Component>
    );
  }

  return (
    <Component
      onClick={onClick}
      className={`relative w-full text-left p-6 rounded-2xl transition-all duration-200 border bg-white ${
        isActive
          ? 'border-emerald-700 ring-2 ring-emerald-700/10 shadow-sm'
          : 'border-slate-200/80 hover:border-slate-300 shadow-[0_1px_3px_rgba(15,23,42,0.03)]'
      } ${onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.99]' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-600 text-sm font-medium tracking-tight flex items-center gap-2">
          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Icon size={16} />
            </div>
          )}
          {title}
        </span>
        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-600">
          <ArrowUpRight size={14} />
        </div>
      </div>

      <div className="mb-3">
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>

      {change && (
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              changeType === 'positive'
                ? 'bg-emerald-50 text-emerald-700'
                : changeType === 'negative'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {changeType === 'positive' ? (
              <TrendingUp size={12} />
            ) : changeType === 'negative' ? (
              <TrendingDown size={12} />
            ) : (
              <Minus size={12} />
            )}
            {change}
          </span>
        </div>
      )}
    </Component>
  );
}
