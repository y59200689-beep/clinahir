import { useState } from 'react';
import {
  Activity,
  MessageCircle,
  Clock,
  RefreshCw,
  LoaderCircle,
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
      onToast('Delivery requeued.');
      setRequeueTarget(null);
      onRefresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsRequeueing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Deliveries
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          CRM webhook synchronization and WhatsApp automated message status.
        </p>
      </div>

      {/* 3 Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <Activity size={18} className="text-slate-400" />
            <StatusPill value={data.integrations.dailyCommand ? 'configured' : 'needs setup'} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Daily Command CRM</h3>
            <p className="text-xs text-slate-500 mt-0.5">Webhook synchronization</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <MessageCircle size={18} className="text-slate-400" />
            <StatusPill
              value={
                data.integrations.whatsappConfigured && data.integrations.whatsappEnabled
                  ? 'configured'
                  : 'needs setup'
              }
            />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Meta WhatsApp API</h3>
            <p className="text-xs text-slate-500 mt-0.5">Outbound demo dispatch</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <Clock size={18} className="text-slate-400" />
            <StatusPill value={data.heartbeat ? 'operational' : 'pending'} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Scheduler Heartbeat</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              {data.heartbeat
                ? `${formatDate(data.heartbeat)} ${formatTime(data.heartbeat)}`
                : 'Pending next run'}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Command Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            CRM Deliveries
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Leads forwarded to external systems
          </p>
        </div>

        {data.leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/60 text-xs font-medium text-slate-500 border-b border-slate-100">
                  <th className="py-2.5 px-5">Clinic</th>
                  <th className="py-2.5 px-3">Sync status</th>
                  <th className="py-2.5 px-3 text-center">Attempts</th>
                  <th className="py-2.5 px-4">Last response</th>
                  <th className="py-2.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.leads.map((lead) => (
                  <tr key={lead.external_id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-5 font-medium text-slate-900 text-xs sm:text-sm">
                      {lead.company_name}
                    </td>

                    <td className="py-3 px-3">
                      <StatusPill value={lead.daily_command_status} />
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-xs text-slate-600">
                      {lead.daily_command_attempts}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                      {lead.daily_command_last_error || 'Success'}
                    </td>

                    <td className="py-3 px-5 text-right">
                      {['blocked', 'exhausted'].includes(lead.daily_command_status) ? (
                        <button
                          onClick={() =>
                            setRequeueTarget({
                              id: lead.external_id,
                              channel: 'daily_command',
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-xs font-medium hover:bg-slate-50 text-slate-700"
                        >
                          <RefreshCw size={11} />
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
          <div className="p-8 text-center text-slate-400 text-xs">
            No deliveries recorded.
          </div>
        )}
      </div>

      {/* WhatsApp Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            WhatsApp Outbox
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Meta API automated message logs
          </p>
        </div>

        {data.whatsapp.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/60 text-xs font-medium text-slate-500 border-b border-slate-100">
                  <th className="py-2.5 px-5">Lead reference</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Attempts</th>
                  <th className="py-2.5 px-4">Result</th>
                  <th className="py-2.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.whatsapp.map((job) => (
                  <tr key={job.external_id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-5 font-mono text-xs text-slate-800">
                      {job.external_id.slice(0, 16)}…
                    </td>

                    <td className="py-3 px-3">
                      <StatusPill value={job.status} />
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-xs text-slate-600">
                      {job.attempts}
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                      {job.last_error || 'Delivered'}
                    </td>

                    <td className="py-3 px-5 text-right">
                      {['blocked', 'exhausted'].includes(job.status) ? (
                        <button
                          onClick={() =>
                            setRequeueTarget({
                              id: job.external_id,
                              channel: 'whatsapp',
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 text-xs font-medium hover:bg-slate-50 text-slate-700"
                        >
                          <RefreshCw size={11} />
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
          <div className="p-8 text-center text-slate-400 text-xs">
            No WhatsApp jobs recorded.
          </div>
        )}
      </div>

      {/* Requeue Modal */}
      {requeueTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/30"
            onClick={() => setRequeueTarget(null)}
          />
          <div className="relative bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Requeue delivery?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ensure the upstream issue is resolved. The existing lead identity will be reused.
            </p>
            {error && <p className="text-xs text-rose-600">{error}</p>}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRequeueTarget(null)}
                className="px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                disabled={isRequeueing}
                onClick={() => void handleConfirmRequeue()}
                className="px-3.5 py-1.5 rounded-lg bg-[#0A261D] hover:bg-emerald-900 text-white font-medium text-xs flex items-center gap-1.5"
              >
                {isRequeueing ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                <span>Requeue</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
