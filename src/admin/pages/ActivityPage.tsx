import { Activity, FileText } from 'lucide-react';
import type { Snapshot } from '../types';

interface ActivityPageProps {
  data: Snapshot;
}

export function ActivityPage({ data }: ActivityPageProps) {
  const formatDate = (s: string | null) =>
    s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';
  const formatTime = (s: string) =>
    new Date(s).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Activity Log
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          History of administrative actions and content releases.
        </p>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Recent Events (Latest 50)
          </h3>
          <span className="text-xs text-slate-400">Excludes patient contact details</span>
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
                  className="p-4 flex items-start gap-3.5 hover:bg-slate-50/60 transition-colors"
                >
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                      isWebsite
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    {isWebsite ? <FileText size={15} /> : <Activity size={15} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 text-xs sm:text-sm">
                      {actionTitle}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">
                      Target: {isWebsite ? 'Public website' : `Lead ${item.target.slice(0, 16)}…`}
                    </div>
                  </div>

                  <div className="text-right text-xs font-mono shrink-0">
                    <div className="text-slate-700">
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
          <div className="p-12 text-center text-slate-400 text-xs">
            No activity recorded.
          </div>
        )}
      </div>
    </div>
  );
}
