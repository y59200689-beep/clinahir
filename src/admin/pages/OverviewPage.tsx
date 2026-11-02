import {
  Users,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Activity,
  Clock,
} from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { ActivityChart } from '../components/ActivityChart';
import { StatusPill } from '../components/StatusPill';
import type { Snapshot, Lead } from '../types';

interface OverviewPageProps {
  data: Snapshot;
  onNavigate: (page: any) => void;
  onSelectLead: (lead: Lead) => void;
  onFilterStage: (stage: string) => void;
}

export function OverviewPage({
  data,
  onNavigate,
  onSelectLead,
  onFilterStage,
}: OverviewPageProps) {
  const number = (n: number) => new Intl.NumberFormat('en').format(n);
  const formatDate = (s: string | null) =>
    s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';
  const formatTime = (s: string) =>
    new Date(s).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Patient inquiries, recent activity, and integration health.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-500">
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          isHero
          title="New Inquiries"
          value={number(data.summary.new)}
          subtitle="Awaiting initial response"
          icon={MessageCircle}
          onClick={() => {
            onFilterStage('new');
            onNavigate('Leads');
          }}
        />

        <KpiCard
          title="Captured Leads"
          value={number(data.summary.total)}
          subtitle="Inbound website requests"
          icon={Users}
          onClick={() => onNavigate('Leads')}
        />

        <KpiCard
          title="Qualified Centers"
          value={number(data.summary.qualified)}
          subtitle="Passed clinical review"
          icon={ShieldCheck}
          onClick={() => {
            onFilterStage('qualified');
            onNavigate('Leads');
          }}
        />

        <KpiCard
          title="Clinics Won"
          value={number(data.summary.won)}
          subtitle="Onboarded partners"
          icon={CheckCircle2}
          onClick={() => {
            onFilterStage('won');
            onNavigate('Leads');
          }}
        />
      </div>

      {/* Action Banner when New Leads Await */}
      {data.summary.new > 0 && (
        <div className="p-4 sm:p-5 rounded-xl bg-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-800/60 flex items-center justify-center text-emerald-300 shrink-0">
              <MessageCircle size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">
                {data.summary.new} {data.summary.new === 1 ? 'inquiry requires' : 'inquiries require'} follow-up
              </h3>
              <p className="text-xs text-emerald-300/70 mt-0.5">
                First response within 2 hours yields the highest consultation rate.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onFilterStage('new');
              onNavigate('Leads');
            }}
            className="self-start sm:self-center px-3.5 py-2 rounded-lg bg-white text-[#0A261D] hover:bg-emerald-50 text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Review leads</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* 2-Column Command Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Recent Opportunities Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  Recent Inquiries
                </h3>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  ({data.leads.length})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest submissions from the website
              </p>
            </div>

            <button
              onClick={() => onNavigate('Leads')}
              className="text-xs font-medium text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {data.leads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/60 text-xs font-medium text-slate-500 border-b border-slate-100">
                    <th className="py-2.5 px-5">Clinic</th>
                    <th className="py-2.5 px-3">Stage</th>
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-5 text-right">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {data.leads.slice(0, 5).map((lead) => (
                    <tr
                      key={lead.external_id}
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-xs font-semibold shrink-0">
                            {lead.company_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 text-xs sm:text-sm truncate group-hover:text-emerald-800 transition-colors">
                              {lead.company_name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {lead.contact_name || lead.phone || 'Contact'} · {lead.city}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <StatusPill value={lead.admin_stage} />
                      </td>

                      <td className="py-3 px-3 text-xs text-slate-500 font-mono">
                        {lead.utm_source || 'Direct'}
                      </td>

                      <td className="py-3 px-5 text-right">
                        <div className="text-xs text-slate-700 font-mono">
                          {formatDate(lead.submitted_at)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {formatTime(lead.submitted_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 text-center">
              <Users size={28} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-700">No inquiries recorded yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Website submissions will appear here automatically.</p>
            </div>
          )}
        </div>

        {/* Right Column: Chart + Delivery Status (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Activity Chart */}
          <ActivityChart
            rows={data.analytics}
            title="Conversion Trend"
            subtitle="Demo submissions by day"
          />

          {/* Integration Health Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Deliveries & Outbox
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronizations and workers
                </p>
              </div>
              <button
                onClick={() => onNavigate('Deliveries')}
                className="text-xs font-medium text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Activity size={15} className="text-slate-400" />
                  <span className="font-medium text-slate-800">Daily Command CRM</span>
                </div>
                <StatusPill
                  value={data.integrations.dailyCommand ? 'configured' : 'needs setup'}
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <MessageCircle size={15} className="text-slate-400" />
                  <span className="font-medium text-slate-800">WhatsApp Dispatch</span>
                </div>
                <StatusPill
                  value={
                    data.integrations.whatsappConfigured && data.integrations.whatsappEnabled
                      ? 'configured'
                      : 'needs setup'
                  }
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Clock size={15} className="text-slate-400" />
                  <span className="font-medium text-slate-800">Cron Scheduler</span>
                </div>
                <StatusPill
                  value={data.heartbeat ? 'operational' : 'pending'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
