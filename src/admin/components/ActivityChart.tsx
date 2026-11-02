import { useState } from 'react';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

interface ActivityDataPoint {
  day: string;
  demo_submissions: number | string;
  page_views?: number | string;
}

interface ActivityChartProps {
  rows: ActivityDataPoint[];
  title?: string;
  subtitle?: string;
}

export function ActivityChart({
  rows,
  title = 'Conversion Trend',
  subtitle = 'Demo submissions & consultation volume',
}: ActivityChartProps) {
  // Default to 7d for spacious, clean visual hierarchy like BARONT
  const [selectedRange, setSelectedRange] = useState<'7d' | '14d' | '30d'>('7d');

  const filteredRows =
    selectedRange === '7d'
      ? rows.slice(-7)
      : selectedRange === '14d'
      ? rows.slice(-14)
      : rows;

  const values = filteredRows.map((r) => Number(r.demo_submissions) || 0);
  const max = Math.max(1, ...values);
  const total = values.reduce((a, b) => a + b, 0);

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return s;
    }
  };

  const getDayLabel = (s: string, isWeekly: boolean) => {
    try {
      const d = new Date(s + 'T12:00:00');
      if (isWeekly) {
        return d.toLocaleDateString('en-GB', { weekday: 'narrow' }); // M, T, W, T, F, S, S
      }
      return String(d.getDate());
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] w-full overflow-hidden">
      {/* Responsive Header */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live
            </span>
          </div>

          {/* Time range switcher pills */}
          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
            {(['7d', '14d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                  selectedRange === range
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '14d' ? '14 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <p className="text-xs text-slate-400 truncate">{subtitle}</p>
          <div className="font-mono text-slate-700 font-semibold shrink-0">
            {total} {total === 1 ? 'request' : 'requests'}
          </div>
        </div>
      </div>

      {/* Plot Area */}
      {total > 0 ? (
        <div className="mt-2">
          <div className="h-44 flex items-end gap-2 sm:gap-3 pb-6 border-b border-slate-100 relative">
            {/* Grid line indicator */}
            <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-100 text-[10px] text-slate-300 font-mono">
              <span className="absolute -top-3 right-0">{max}</span>
            </div>
            <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-100 text-[10px] text-slate-300 font-mono">
              <span className="absolute -top-3 right-0">{Math.round(max / 2)}</span>
            </div>

            {filteredRows.map((row, idx) => {
              const val = Number(row.demo_submissions) || 0;
              const heightPercent = val > 0 ? Math.max(16, (val / max) * 100) : 6;
              const isPeak = val > 0 && val === max;
              const isWeekly = selectedRange === '7d';
              const showLabel =
                selectedRange === '7d'
                  ? true
                  : selectedRange === '14d'
                  ? idx % 2 === 0
                  : idx % 5 === 0 || idx === filteredRows.length - 1;

              return (
                <div
                  key={row.day || idx}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-medium py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-md">
                    {formatDate(row.day)}: {val} {val === 1 ? 'request' : 'requests'}
                  </div>

                  {/* Rounded Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[32px] rounded-t-lg transition-all duration-300 ${
                      isPeak
                        ? 'bg-[#0A3A2A] shadow-sm'
                        : val > 0
                        ? 'bg-emerald-600/80 group-hover:bg-[#0A3A2A]'
                        : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}
                  />

                  {/* X-axis Label */}
                  {showLabel ? (
                    <span className="absolute -bottom-5 text-[10px] text-slate-400 font-mono font-medium group-hover:text-slate-800">
                      {getDayLabel(row.day, isWeekly)}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Bottom timeline range */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 font-mono">
            <span>{formatDate(filteredRows[0]?.day || '')}</span>
            <div className="flex items-center gap-1.5 font-sans">
              <span className="w-2 h-2 rounded-sm bg-[#0A3A2A]" />
              <span className="text-slate-500 text-[11px]">Consultation inquiries</span>
            </div>
            <span>{formatDate(filteredRows[filteredRows.length - 1]?.day || '')}</span>
          </div>
        </div>
      ) : (
        /* Clean Zero State when no inquiries recorded yet */
        <div className="h-44 flex flex-col items-center justify-center text-center p-6 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
            <BarChart3 size={18} />
          </div>
          <h4 className="text-xs font-bold text-slate-800">Awaiting Consultation Inquiries</h4>
          <p className="text-[11px] text-slate-400 max-w-xs mt-1 leading-relaxed">
            Inquiries booked through your website will plot automatically across this {selectedRange === '7d' ? '7-day' : selectedRange === '14d' ? '14-day' : '30-day'} window.
          </p>
        </div>
      )}
    </div>
  );
}
