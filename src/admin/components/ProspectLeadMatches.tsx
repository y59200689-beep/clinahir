import { useEffect, useState } from 'react';
import { useAdminLocale } from '../i18n';
import { adminApi, type Lead } from '../types';

export function ProspectLeadMatches({ prospectId, onOpen }: { prospectId: string; onOpen: (lead: Lead) => void }) {
  const { t, errorText } = useAdminLocale();
  const [leads, setLeads] = useState<Lead[]>();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void adminApi<{ leads: Lead[] }>('prospect-matches', undefined, `&id=${encodeURIComponent(prospectId)}`)
      .then(result => { if (active) setLeads(result.leads); })
      .catch((failure: Error) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [prospectId]);

  if (error) return <p role="alert" className="text-xs text-rose-700">{errorText(error)}</p>;
  if (!leads) return <p role="status" className="text-xs text-slate-500">{t('Checking for matching inquiries…')}</p>;
  if (!leads.length) return null;
  return <section className="rounded-lg border border-amber-200 bg-amber-50 p-3">
    <h3 className="text-sm font-semibold">{t('Matching inquiries')}</h3>
    <p className="text-xs text-slate-700">{t('These inquiries share a phone number or email with this prospect.')}</p>
    <ul className="mt-2 space-y-1">
      {leads.map(lead => <li key={lead.external_id}>
        <button type="button" className="overview-text-button" onClick={() => onOpen(lead)}>
          {lead.company_name} · {t(lead.admin_stage)}
        </button>
      </li>)}
    </ul>
  </section>;
}
