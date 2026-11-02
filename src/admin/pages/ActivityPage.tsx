import { Activity, ShieldCheck, Clock, FileText, CheckCircle2, UserCheck } from 'lucide-react';
import type { Snapshot } from '../types';

interface ActivityPageProps {
  data: Snapshot;
}

export function ActivityPage({ data }: ActivityPageProps) {
  const formatDate = (s: string | null) =>
    s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const formatTime = (s: string) =>
    new Date(s).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
            Immutable Audit Log
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-medium">Compliance & Security Trail</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Workspace Operations History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Cryptographically recorded actions, content releases, and pipeline state changes.
        </p>
      </div>

      {/* Main Timeline Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Audit Stream (Latest 50 Events)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personal patient contact details are strictly excluded from event logs
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <ShieldCheck size={18} />
          </div>
        </div>

        {data.audit.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {data.audit.map((item) => {
              const actionTitle = item.action
                .replaceAll('.', ' · ')
                .replaceAll('_', ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());

              const isWebsite = item.target === 'website';

              return (
                <div
                  key={item.id}
                  className="p-5 flex items-start gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isWebsite
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {isWebsite ? <FileText size={17} /> : <Activity size={17} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                      {actionTitle}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 font-mono">
                      Target:{' '}
                      <span className="font-semibold text-slate-700">
                        {isWebsite ? 'Public Website CMS' : `Lead ${item.target.slice(0, 16)}…`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-xs font-mono shrink-0">
                    <div className="font-semibold text-slate-700">
                      {formatDate(item.created_at)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {formatTime(item.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400 text-xs">
            No audit records created yet.
          </div>
        )}
      </div>
    </div>
  );
}
