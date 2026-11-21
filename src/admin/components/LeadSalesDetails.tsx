import { useEffect, useState, type FormEvent } from 'react';
import { useAdminLocale } from '../i18n';
import { adminApi } from '../types';
import { AdminSelect } from './AdminSelect';

const demoStatuses = { unscheduled: 'Unscheduled', scheduled: 'Scheduled', held: 'Demo held', missed: 'Demo missed' } as const;

interface SalesDetails {
  status: keyof typeof demoStatuses;
  date: string | null;
  lossReason: string | null;
}

export function LeadSalesDetails({ leadId, isLost, onSaved }: { leadId: string; isLost: boolean; onSaved: () => void }) {
  const { t, errorText } = useAdminLocale();
  const [details, setDetails] = useState<SalesDetails>();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    void adminApi<{ sales: SalesDetails }>('lead-sales', undefined, `&id=${encodeURIComponent(leadId)}`)
      .then(({ sales }) => { if (active) setDetails(sales); })
      .catch((failure: Error) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [leadId]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!details || saving) return;
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await adminApi('lead-sales', {
        id: leadId, status: details.status, date: details.date ?? '', lossReason: details.lossReason ?? '',
      });
      setSaved(true);
      onSaved();
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return <section className="lead-follow-up" aria-labelledby="lead-sales-title">
    <h3 id="lead-sales-title" className="text-sm font-semibold">{t('Demo and deal outcome')}</h3>
    {error && <p role="alert" className="text-xs text-rose-700">{errorText(error)}</p>}
    {!details && !error && <p role="status">{t('Loading…')}</p>}
    {details && <form onSubmit={save} className="space-y-3">
      <div className="lead-follow-up-fields">
        <div>
          <span className="text-xs font-medium">{t('Demo status')}</span>
          <AdminSelect label={t('Demo status')} variant="field" value={details.status}
            choices={Object.entries(demoStatuses).map(([value, label]) => ({ value, label: t(label) }))}
            onChange={value => {
              const status = value as SalesDetails['status'];
              setDetails({ ...details, status, date: status === 'unscheduled' ? null : details.date });
              setSaved(false);
            }} />
        </div>
        {details.status !== 'unscheduled' && <label>{t('Demo date')}
          <input type="date" required min="1000-01-01" max="9999-12-31" value={details.date ?? ''}
            onChange={event => { setDetails({ ...details, date: event.target.value }); setSaved(false); }} />
        </label>}
        {(isLost || details.lossReason) && <label className="col-span-full">{t('Loss reason')}
          <input maxLength={500} value={details.lossReason ?? ''}
            onChange={event => { setDetails({ ...details, lossReason: event.target.value }); setSaved(false); }} />
        </label>}
      </div>
      <button type="submit" disabled={saving} className="overview-text-button">{t('Save demo details')}</button>
      {saved && <p role="status" className="text-xs">{t('Lead updated.')}</p>}
    </form>}
  </section>;
}
