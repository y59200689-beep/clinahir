import { BarChart3, TrendingUp, Users, MousePointerClick, CheckCircle2, ShieldCheck } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { ActivityChart } from '../components/ActivityChart';
import type { Snapshot } from '../types';

interface AnalyticsPageProps {
  data: Snapshot;
}

export function AnalyticsPage({ data }: AnalyticsPageProps) {
  const number = (n: number) => new Intl.NumberFormat('en').format(n);

  const views = data.analytics.reduce((n, r) => n + Number(r.page_views || 0), 0);
  const clicks = data.analytics.reduce((n, r) => n + Number(r.demo_cta_clicks || 0), 0);
  const conversions = data.analytics.reduce((n, r) => n + Number(r.demo_submissions || 0), 0);

  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : '0.0';
  const conversionRate = clicks > 0 ? ((conversions / clicks) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
            Performance Metrics
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-medium">30-Day Conversion Funnel</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Conversion & Traffic Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Measure patient discovery, consultation interest, and qualified conversion attribution.
        </p>
      </div>

      {/* 3 Top Funnel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <KpiCard
          title="Total Page Views"
          value={number(views)}
          subtitle="Top-of-funnel visitors"
          change="Unique impressions"
          icon={Users}
        />

        <KpiCard
          title="Demo CTA Clicks"
          value={number(clicks)}
          subtitle={`${ctr}% engagement rate`}
          change="Consultation intent"
          icon={MousePointerClick}
        />

        <KpiCard
          isHero
          title="Saved Inquiries"
          value={number(conversions)}
          subtitle={`${conversionRate}% click-to-lead conversion`}
          change="Direct submissions"
          icon={CheckCircle2}
        />
      </div>

      {/* 2-Column Grid: Timeline Chart + Acquisition Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Activity Chart (7 cols) */}
        <div className="lg:col-span-7">
          <ActivityChart
            rows={data.analytics}
            title="Inquiry Trend Line"
            subtitle="Historical volume across marketing days"
          />
        </div>

        {/* Right Column: Acquisition Sources (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Acquisition Attribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Source channels driving verified inquiries
            </p>
          </div>

          {data.sources.length > 0 ? (
            <div className="space-y-4 pt-1">
              {data.sources.map((s) => {
                const total = Math.max(1, data.summary.total);
                const count = Number(s.count) || 0;
                const percent = Math.round((count / total) * 100);

                return (
                  <div key={s.source} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800 font-mono capitalize">
                        {s.source || 'Direct Website'}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {number(count)} ({percent}%)
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full rounded-full bg-[#0A3A2A] transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
              <BarChart3 size={28} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-700">No source attribution yet</p>
              <p className="text-[11px] text-slate-400 mt-1">
                UTM attribution will visualize as campaigns go live.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sovereign Privacy Note */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 flex items-start gap-3">
        <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Clinahir operates with privacy-by-design principles. Analytics metrics represent aggregate counter events without recording patient IP addresses or using invasive third-party trackers.
        </p>
      </div>
    </div>
  );
}
