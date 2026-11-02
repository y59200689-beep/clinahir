import {
  Users,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Send,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Calendar,
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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
              Operations Center
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">Real-time pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Welcome to Clinahir HQ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track inquiries, oversee patient conversions, and keep integrations running seamlessly.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-sm text-xs font-semibold text-slate-700">
          <Calendar size={14} className="text-emerald-700" />
          <span>
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Top 4 KPI Cards (with Forest Green Hero Card inspired by BARONT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          isHero
          title="New Inquiries"
          value={number(data.summary.new)}
          subtitle="Awaiting first consultation follow-up"
          change="+12% this week"
          icon={MessageCircle}
          onClick={() => {
            onFilterStage('new');
            onNavigate('Leads');
          }}
        />

        <KpiCard
          title="Total Captured Leads"
          value={number(data.summary.total)}
          subtitle="Inbound website requests"
          change="+8% vs last month"
          icon={Users}
          onClick={() => onNavigate('Leads')}
        />

        <KpiCard
          title="Qualified Centers"
          value={number(data.summary.qualified)}
          subtitle="Actively in clinical review"
          change="High fit profile"
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
          change="100% verified"
          icon={CheckCircle2}
          onClick={() => {
            onFilterStage('won');
            onNavigate('Leads');
          }}
        />
      </div>

      {/* Action Banner if New Leads Require Attention */}
      {data.summary.new > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-900 to-[#0A261D] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-emerald-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-800/80 border border-emerald-600/40 flex items-center justify-center text-emerald-200 shrink-0">
              <MessageCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-white">
                {data.summary.new} {data.summary.new === 1 ? 'patient lead is' : 'patient leads are'} waiting for your response
              </h3>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                First-response speed significantly improves consultation qualification and booking rates.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onFilterStage('new');
              onNavigate('Leads');
            }}
            className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-white text-[#0A261D] hover:bg-emerald-50 text-xs font-bold transition-all shadow-sm flex items-center gap-2 whitespace-nowrap active:scale-[0.98]"
          >
            <span>Review New Leads</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* 2-Column Command Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Opportunities Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Recent Inquiries
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                  {data.leads.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                The latest consultations captured through the public portal.
              </p>
            </div>

            <button
              onClick={() => onNavigate('Leads')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {data.leads.length > 0 ? (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-6">Clinic / Patient</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Origin</th>
                    <th className="py-3 px-6 text-right">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {data.leads.slice(0, 5).map((lead, idx) => (
                    <tr
                      key={lead.external_id}
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0 ${
                              idx % 3 === 0
                                ? 'bg-emerald-800'
                                : idx % 3 === 1
                                ? 'bg-teal-700'
                                : 'bg-slate-700'
                            }`}
                          >
                            {lead.company_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate group-hover:text-emerald-800 transition-colors">
                              {lead.company_name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {lead.contact_name || lead.phone || 'Inquiry details'} · {lead.city}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusPill value={lead.admin_stage} />
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                        {lead.utm_source || 'Direct'}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="text-xs font-semibold text-slate-700 font-mono">
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
            <div className="p-12 text-center">
              <Users size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No inbound leads captured yet</p>
              <p className="text-xs text-slate-400 mt-1">Inquiries submitted on your public site will appear here.</p>
            </div>
          )}
        </div>

        {/* Right Column: Chart + Delivery Status (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Activity Chart */}
          <ActivityChart
            rows={data.analytics}
            title="Conversion Trend"
            subtitle="Demo submissions & consultation volume"
          />

          {/* Integration Health Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Delivery System
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronizations & dispatch queues
                </p>
              </div>
              <button
                onClick={() => onNavigate('Deliveries')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
                    <Activity size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Daily Command CRM</div>
                    <div className="text-[11px] text-slate-500">Real-time webhook sync</div>
                  </div>
                </div>
                <StatusPill
                  value={data.integrations.dailyCommand ? 'configured' : 'needs setup'}
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
                    <MessageCircle size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">WhatsApp Delivery</div>
                    <div className="text-[11px] text-slate-500">Automated demo dispatch</div>
                  </div>
                </div>
                <StatusPill
                  value={
                    data.integrations.whatsappConfigured && data.integrations.whatsappEnabled
                      ? 'configured'
                      : 'needs setup'
                  }
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Scheduler Heartbeat</div>
                    <div className="text-[11px] text-slate-500">
                      {data.heartbeat ? `Last run ${formatDate(data.heartbeat)}` : '03:00 UTC Daily'}
                    </div>
                  </div>
                </div>
                <StatusPill
                  value={data.heartbeat ? 'completed' : 'pending'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
