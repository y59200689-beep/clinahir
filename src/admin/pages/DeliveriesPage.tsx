import Modal from '../../components/Modal';
import { useAdminLocale } from '../i18n';
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
  const { t, errorText, intlLocale } = useAdminLocale();
  const [requeueTarget, setRequeueTarget] = useState<{ id: string; channel: string } | null>(null);
  const [isRequeueing, setIsRequeueing] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (s: string | null) =>
    s ? new Date(s).toLocaleDateString(intlLocale, { day: 'numeric', month: 'short' }) : 'Never';
  const formatTime = (s: string) =>
    new Date(s).toLocaleTimeString(intlLocale, { hour: '2-digit', minute: '2-digit' });

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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900"> {t("Deliveries")} </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5"> {t("CRM webhook synchronization and WhatsApp automated message status.")} </p>
      </div>

<p className="text-sm text-slate-600"> {t("Configuration indicates settings are present, not verified delivery. CRM failures keep saved leads; WhatsApp acceptance is not delivery. Ambiguous sends require manual review.")} </p>
      {/* 3 Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <Activity size={18} className="text-slate-400" />
            <StatusPill value={data.integrations.dailyCommand ? 'configured' : 'needs setup'} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm"> {t("Daily Command CRM")} </h3>
            <p className="text-xs text-slate-500 mt-0.5"> {t("Webhook synchronization")} </p>
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
            <h3 className="font-semibold text-slate-900 text-sm"> {t("Meta WhatsApp API")} </h3>
            <p className="text-xs text-slate-500 mt-0.5"> {t("Outbound demo dispatch")} </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <Clock size={18} className="text-slate-400" />
            <StatusPill value={data.heartbeat && Date.now() - Date.parse(data.heartbeat) < 30 * 60 * 60 * 1000 ? 'recent run' : 'needs review'} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm"> {t("Scheduler Heartbeat")} </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              {data.heartbeat
                ? `${formatDate(data.heartbeat)} ${formatTime(data.heartbeat)}`
                : t("Pending next run")}
            </p>
          </div>
        </div>
      </div>

      {/* Daily Command Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900"> {t("CRM Deliveries")} </h3>
          <p className="text-xs text-slate-500 mt-0.5"> {t("Leads forwarded to external systems")} </p>
        </div>

        {data.leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/60 text-xs font-medium text-slate-500 border-b border-slate-100">
                  <th className="py-2.5 px-5"> {t("Clinic")} </th>
                  <th className="py-2.5 px-3"> {t("Sync status")} </th>
                  <th className="py-2.5 px-3 text-center"> {t("Attempts")} </th>
                  <th className="py-2.5 px-4"> {t("Last response")} </th>
                  <th className="py-2.5 px-5 text-right"> {t("Action")} </th>
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
                      {lead.daily_command_last_error || t("Success")}
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
                          <span> {t("Requeue")} </span>
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
          <div className="p-8 text-center text-slate-400 text-xs"> {t("No deliveries recorded.")} </div>
        )}
      </div>

      {/* WhatsApp Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900"> {t("WhatsApp Outbox")} </h3>
          <p className="text-xs text-slate-500 mt-0.5"> {t("Meta API automated message logs")} </p>
        </div>

        {data.whatsapp.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/60 text-xs font-medium text-slate-500 border-b border-slate-100">
                  <th className="py-2.5 px-5"> {t("Lead reference")} </th>
                  <th className="py-2.5 px-3"> {t("Status")} </th>
                  <th className="py-2.5 px-3 text-center"> {t("Attempts")} </th>
                  <th className="py-2.5 px-4"> {t("Result")} </th>
                  <th className="py-2.5 px-5 text-right"> {t("Action")} </th>
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
                      {job.last_error || t(job.status)}
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
                          <span> {t("Requeue")} </span>
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
          <div className="p-8 text-center text-slate-400 text-xs"> {t("No WhatsApp jobs recorded.")} </div>
        )}
      </div>

      {/* Requeue Modal */}
      {requeueTarget && <Modal tone="admin" title={t('Requeue delivery?')} closeLabel={t('Close')} onClose={() => setRequeueTarget(null)}><p className="text-sm text-slate-600">{t('Ensure the upstream issue is resolved. The existing lead identity will be reused.')}</p>{error&&<p role="alert">{errorText(error)}</p>}<div className="mt-5 flex justify-end gap-3"><button type="button" onClick={()=>setRequeueTarget(null)}>{t('Cancel')}</button><button type="button" disabled={isRequeueing} onClick={()=>void handleConfirmRequeue()} className="rounded-lg bg-[#6754cf] px-4 py-2 text-white">{t('Requeue')}</button></div></Modal>}

    </div>
  );
}
