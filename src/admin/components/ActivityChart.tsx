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
  title = 'Inquiry & Demo Activity',
  subtitle = 'Submissions across the recent activity window',
}: ActivityChartProps) {
  const [selectedRange, setSelectedRange] = useState<'30d' | '14d' | '7d'>('30d');

  const filteredRows = selectedRange === '7d' 
    ? rows.slice(-7) 
    : selectedRange === '14d' 
    ? rows.slice(-14) 
    : rows;

  const values = filteredRows.map(r => Number(r.demo_submissions) || 0);
  const max = Math.max(1, ...values);
  const total = values.reduce((a, b) => a + b, 0);

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return s;
    }
  };

  const getDayNum = (s: string) => {
    try {
      return new Date(s + 'T12:00:00').getDate();
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
              <TrendingUp size={12} /> Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right pr-3 border-r border-slate-100 hidden sm:block">
            <div className="text-lg font-bold text-slate-900 font-mono tabular-nums leading-none">
              {total}
            </div>
            <span className="text-[11px] text-slate-400">Total requests</span>
          </div>

          {/* Time range pills */}
          <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/50">
            {(['7d', '14d', '30d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`text-xs font-medium px-2.5 py-1 rounded-md transition-all ${
                  selectedRange === range
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '14d' ? '14 Days' : '30 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plot Area */}
      {filteredRows.length > 0 ? (
        <div className="mt-4">
          <div className="h-48 flex items-end gap-1.5 sm:gap-2 pb-6 border-b border-slate-100 relative">
            {/* Grid background lines */}
            <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-100 text-[10px] text-slate-300 font-mono">
              <span className="absolute -top-3 right-0">{max}</span>
            </div>
            <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-100 text-[10px] text-slate-300 font-mono">
              <span className="absolute -top-3 right-0">{Math.round(max / 2)}</span>
            </div>

            {filteredRows.map((row, idx) => {
              const val = Number(row.demo_submissions) || 0;
              const heightPercent = val > 0 ? Math.max(12, (val / max) * 100) : 4;
              const isPeak = val > 0 && val === max;

              return (
                <div
                  key={row.day || idx}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-medium py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-md">
                    {formatDate(row.day)}: {val} {val === 1 ? 'request' : 'requests'}
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 group-hover:opacity-90 ${
                      isPeak
                        ? 'bg-[#0A3A2A] shadow-sm'
                        : val > 0
                        ? 'bg-emerald-600/80 group-hover:bg-[#0A3A2A]'
                        : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}
                  />

                  {/* Label */}
                  <span className="absolute -bottom-5 text-[10px] text-slate-400 font-mono group-hover:text-slate-800">
                    {getDayNum(row.day)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom legend */}
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-mono">
            <span>{formatDate(filteredRows[0]?.day || '')}</span>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#0A3A2A]" />
              <span className="text-[11px] text-slate-500 font-sans">Active inquiries</span>
            </div>
            <span>{formatDate(filteredRows[filteredRows.length - 1]?.day || '')}</span>
          </div>
        </div>
      ) : (
        <div className="h-48 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
          <BarChart3 className="text-slate-300 mb-2" size={32} />
          <h4 className="text-sm font-semibold text-slate-700">No submission records yet</h4>
          <p className="text-xs text-slate-400 mt-1">Data points will populate automatically as visitors book consultations.</p>
        </div>
      )}
    </div>
  );
}
