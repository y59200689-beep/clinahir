import { useState } from 'react';
import {
  Send,
  Activity,
  MessageCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  ShieldAlert,
} from 'lucide-react';
import { StatusPill } from '../components/StatusPill';
import { adminApi, type Snapshot } from '../types';

interface DeliveriesPageProps {
  data: Snapshot;
  onRefresh: () => void;
  onToast: (msg: string) => void;
}

export function DeliveriesPage({ data, onRefresh, onToast }: DeliveriesPageProps) {
  const [requeueTarget, setRequeueTarget] = useState<{ id: string; channel: string } | null>(null);
  const [isRequeueing, setIsRequeueing] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (s: string | null) =>
    s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Never';
  const formatTime = (s: string) =>
    new Date(s).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  async function handleConfirmRequeue() {
    if (!requeueTarget) return;

    setIsRequeueing(true);
    setError('');
    try {
      await adminApi('replay', requeueTarget);
      onToast('Delivery successfully requeued for next batch processor run.');
      setRequeueTarget(null);
      onRefresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsRequeueing(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
            Outbox Operations
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-medium">Asynchronous Workers</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Integration Deliveries & Dispatch Queues
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor CRM synchronization, WhatsApp automated outbound templates, and cron retry schedules.
        </p>
      </div>

      {/* 3 Top Integration Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Activity size={20} />
            </div>
            <StatusPill value={data.integrations.dailyCommand ? 'configured' : 'needs setup'} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Daily Command CRM</h3>
            <p className="text-xs text-slate-500 mt-0.5">Inquiry & prospect webhook forwarding</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <MessageCircle size={20} />
            </div>
            <StatusPill
              value={
                data.integrations.whatsappConfigured && data.integrations.whatsappEnabled
                  ? 'configured'
                  : 'needs setup'
              }
            />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Meta WhatsApp API</h3>
            <p className="text-xs text-slate-500 mt-0.5">Automated confirmation & demo dispatch</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <StatusPill value={data.heartbeat ? 'operational' : 'pending'} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Scheduler Heartbeat</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              {data.heartbeat
                ? `${formatDate(data.heartbeat)} at ${formatTime(data.heartbeat)}`
                : 'Pending next cycle'}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Command Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              CRM Sync Outbox
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Status of leads synchronized to external client systems
            </p>
          </div>
        </div>

        {data.leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="py-3.5 px-6">Clinic / Lead</th>
                  <th className="py-3.5 px-4">Sync Status</th>
                  <th className="py-3.5 px-4 text-center">Attempts</th>
                  <th className="py-3.5 px-4">Last Provider Response</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.leads.map((lead) => (
                  <tr key={lead.external_id} className="hover:bg-slate-50/80">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {lead.company_name}
                    </td>

                    <td className="py-4 px-4">
                      <StatusPill value={lead.daily_command_status} />
                    </td>

                    <td className="py-4 px-4 text-center font-mono font-semibold text-xs text-slate-600">
                      {lead.daily_command_attempts}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                      {lead.daily_command_last_error || 'Synced successfully'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {['blocked', 'exhausted'].includes(lead.daily_command_status) ? (
                        <button
                          onClick={() =>
                            setRequeueTarget({
                              id: lead.external_id,
                              channel: 'daily_command',
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm"
                        >
                          <RefreshCw size={12} />
                          <span>Requeue</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No outbound deliveries recorded yet.
          </div>
        )}
      </div>

      {/* WhatsApp Delivery Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            WhatsApp Delivery Outbox
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Meta Business API automated consultation dispatch logs
          </p>
        </div>

        {data.whatsapp.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="py-3.5 px-6">Lead External Reference</th>
                  <th className="py-3.5 px-4">Delivery Status</th>
                  <th className="py-3.5 px-4 text-center">Attempts</th>
                  <th className="py-3.5 px-4">Meta API Response</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.whatsapp.map((job) => (
                  <tr key={job.external_id} className="hover:bg-slate-50/80">
                    <td className="py-4 px-6 font-mono text-xs text-slate-800">
                      {job.external_id.slice(0, 18)}…
                    </td>

                    <td className="py-4 px-4">
                      <StatusPill value={job.status} />
                    </td>

                    <td className="py-4 px-4 text-center font-mono font-semibold text-xs text-slate-600">
                      {job.attempts}
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                      {job.last_error || 'Delivered to provider'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {['blocked', 'exhausted'].includes(job.status) ? (
                        <button
                          onClick={() =>
                            setRequeueTarget({
                              id: job.external_id,
                              channel: 'whatsapp',
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm"
                        >
                          <RefreshCw size={12} />
                          <span>Requeue</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No WhatsApp dispatch jobs recorded yet.
          </div>
        )}
      </div>

      {/* Requeue Confirmation Modal */}
      {requeueTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setRequeueTarget(null)}
          />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Requeue Outbound Dispatch?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Confirm you have resolved the upstream provider issue. The existing lead identity will be maintained without generating duplicate records.
            </p>
            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRequeueTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={isRequeueing}
                onClick={() => void handleConfirmRequeue()}
                className="px-5 py-2.5 rounded-xl bg-[#0A3A2A] hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-2 shadow-sm"
              >
                {isRequeueing ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <RefreshCw size={15} />
                )}
                <span>Commit Requeue</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
