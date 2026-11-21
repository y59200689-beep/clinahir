import { useEffect, useState } from 'react';
import { useAdminLocale } from '../i18n';
import { adminApi } from '../types';

interface SalesRow {
  source: string;
  inquiries: number;
  qualified: number;
  held: number;
  won: number;
  stalled: number;
}

export function SalesReport() {
  const { t, intlLocale, errorText } = useAdminLocale();
  const [rows, setRows] = useState<SalesRow[]>();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void adminApi<{ rows: SalesRow[] }>('sales-report')
      .then(result => { if (active) setRows(result.rows); })
      .catch((failure: Error) => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, []);

  const number = new Intl.NumberFormat(intlLocale);
  return <section className="overview-panel p-4" aria-labelledby="sales-report-title">
    <h2 id="sales-report-title" className="text-base font-semibold">{t('Sales by source')}</h2>
    <p className="mt-1 text-xs text-slate-600">{t('All-time inquiry outcomes. Stalled leads are open, have no future follow-up, and have had no logged contact in the last 7 days.')}</p>
    {error && <p role="alert" className="mt-3 text-sm text-rose-700">{errorText(error)}</p>}
    {!rows && !error && <p role="status" className="mt-3 text-sm">{t('Loading…')}</p>}
    {rows && (rows.length ? <div className="overview-table-scroll mt-3" role="region" tabIndex={0} aria-label={t('Sales by source')}>
      <table className="overview-table">
        <thead><tr>
          {['Source', 'Inquiries', 'Qualified', 'Demos held', 'Won', 'Stalled'].map(label => <th key={label} scope="col">{t(label)}</th>)}
        </tr></thead>
        <tbody>{rows.map(row => <tr key={row.source}>
          <th scope="row">{row.source === 'Direct / unknown' ? t(row.source) : row.source}</th>
          {[row.inquiries, row.qualified, row.held, row.won, row.stalled].map((value, index) => <td key={index}>{number.format(value)}</td>)}
        </tr>)}</tbody>
      </table>
    </div> : <p className="mt-3 text-sm">{t('No sales data yet.')}</p>)}
  </section>;
}
