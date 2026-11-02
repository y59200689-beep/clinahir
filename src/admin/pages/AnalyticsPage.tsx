import { BarChart3, Users, MousePointerClick, CheckCircle2 } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Visitor engagement and inquiry conversions over the last 30 days.
        </p>
      </div>

      {/* 3 Top Funnel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <KpiCard
          title="Page Views"
          value={number(views)}
          subtitle="Total impressions"
          change="Last 30 days"
          icon={Users}
        />

        <KpiCard
          title="Demo Clicks"
          value={number(clicks)}
          subtitle={`${ctr}% click-through`}
          change="Consultation intent"
          icon={MousePointerClick}
        />

        <KpiCard
          isHero
          title="Saved Inquiries"
          value={number(conversions)}
          subtitle={`${conversionRate}% conversion rate`}
          change="Captured leads"
          icon={CheckCircle2}
        />
      </div>

      {/* Timeline + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7">
          <ActivityChart
            rows={data.analytics}
            title="Inquiry Activity"
            subtitle="Historical volume across days"
          />
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Acquisition Channels
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Source attribution of captured leads
            </p>
          </div>

          {data.sources.length > 0 ? (
            <div className="space-y-3.5 pt-1">
              {data.sources.map((s) => {
                const total = Math.max(1, data.summary.total);
                const count = Number(s.count) || 0;
                const percent = Math.round((count / total) * 100);

                return (
                  <div key={s.source} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-700 capitalize">
                        {s.source || 'Direct Website'}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {number(count)} ({percent}%)
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full rounded-full bg-[#0A261D]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-lg">
              <BarChart3 size={24} className="mx-auto text-slate-300 mb-1.5" />
              <p className="text-xs text-slate-600 font-medium">No attribution data</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sources will record as campaigns drive traffic.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
