import { MapsSearchProgress } from '../components/MapsSearchProgress';
import { AdminSelect } from '../components/AdminSelect';
import { useEffect, useId, useState, type FormEvent } from 'react';
import { Download, MapPin, Search, LoaderCircle, ArrowUpRight, Building2, Star, SlidersHorizontal, CopyCheck, X, CircleCheck } from 'lucide-react';
import { adminApi } from '../types';
import { useAdminLocale } from '../i18n';
import '../maps.css';
import { maxMapsLocationLength } from '../../../server/maps-locations.mjs';
function publicWebsite(value: string) { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url : null; } catch { return null; } }
type Results = { job: null | { id: string; query: string; status: string; startedAt?: string; error?: string }; rows: Record<string, string>[]; total: number };
export function MapsPage({ onImported }: { onImported: (result: { inserted: number; duplicates: number }) => void }) {
  const { t, intlLocale } = useAdminLocale();
  const [keywords, setKeywords] = useState('');
  const locationsHelp = useId();
  const [city, setCity] = useState('');
  const [proxy, setProxy] = useState('none');
  const [data, setData] = useState<Results>({ job: null, rows: [], total: 0 });
  const [error, setError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sourceConfirmed, setSourceConfirmed] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  const jobActive = ['queued', 'starting', 'running'].includes(data.job?.status ?? '');
  const active = busy || jobActive;
  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      try { const result = await adminApi<Results>('maps-status'); if (!disposed) { setData(result); setStatusError(''); } }
      catch { if (!disposed) setStatusError('Status temporarily unavailable. Retrying automatically…'); }
      finally { if (!disposed) timer = setTimeout(() => void refresh(), 5000); }
    }
    void refresh();
    return () => { disposed = true; clearTimeout(timer); };
  }, [local]);
  async function start(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setImportOpen(false); setSourceConfirmed(false);
    try { const result = await adminApi<{ job: Results['job'] }>('maps-start', { keywords, city, proxy }); setData({ job: result.job, rows: [], total: 0 }); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function stop() {
    setBusy(true); setError('');
    try { await adminApi('maps-stop', {}); const result = await adminApi<Results>('maps-status'); setData(result); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function importResults() {
    setImporting(true); setError('');
    try {
      const result = await adminApi<{ inserted: number; duplicates: number }>('maps-import', { jobId: data.job?.id, sourceUseConfirmed: sourceConfirmed });
      onImported(result);
    } catch (e) { setError((e as Error).message); }
    finally { setImporting(false); }
  }
  return <section data-i18n-managed className="maps-page">
    <header className="maps-page-heading">
      <div><h1>{t('Google Maps Search')}</h1><p>{t('Find local businesses. Turn the right results into prospects.')}</p></div>
      <span className="maps-runtime"><span aria-hidden="true" />{t(local ? 'Local workspace' : 'Online searches')}</span>
    </header>

    <section className="maps-search-panel" aria-label={t('New business search')}>
      <form onSubmit={start}>
        <div className="maps-query-row">
          <label className="maps-field"><span>{t('Keywords')}</span><div className="maps-input"><Search size={17} aria-hidden="true" /><input required maxLength={120} value={keywords} onChange={e => setKeywords(e.target.value)} placeholder={t('e.g. radiology centers')} /></div></label>
          <label className="maps-field"><span>{t('Cities or areas')}</span><div className="maps-input"><MapPin size={17} aria-hidden="true" /><input required maxLength={maxMapsLocationLength} aria-describedby={locationsHelp} value={city} onChange={e => setCity(e.target.value)} placeholder={t('Casablanca; Rabat; Tangier')} /></div></label>
          <div className="maps-search-actions"><button disabled={active || importing} className="maps-button maps-primary">{active ? <LoaderCircle size={16} className="maps-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}{t(active ? 'Search in progress…' : 'Search businesses')}</button>{['queued','running'].includes(data.job?.status ?? '') && <button type="button" disabled={busy} onClick={() => void stop()} className="maps-button">{t('Stop search')}</button>}</div>
        </div>
        <p id={locationsHelp} className="maps-location-help">{t('Separate up to 5 cities or areas with semicolons.')}</p>
        <details className="maps-options"><summary><SlidersHorizontal size={14} aria-hidden="true" />{t('Search options')}<span>{t(proxy === 'none' ? 'Without proxy' : 'Configured proxy')}</span></summary><div className="maps-options-content"><div className="maps-field"><span>{t('Proxy')}</span><AdminSelect variant="field" label={t('Proxy')} value={proxy} onChange={setProxy} choices={[{ value: 'none', label: t('Continue without a proxy') }, { value: 'configured', label: t('Use the configured local proxy'), disabled: !local }]} /></div><p>{t('A proxy is optional for a small search. Configure credentials privately on this computer.')}<br />{t(local ? 'Runs locally with Docker. Shallow search, no email extraction or extra reviews. Results stay on this computer.' : 'Searches run online through GitHub Actions. Your computer can stay off.')}</p></div></details>
      </form>
      {!local && <p className="maps-hosted-note">{t('Online searches may take a few minutes to start. You can leave this page and return later.')}</p>}
    </section>
    {(error || statusError) && <p role="alert" className="maps-error">{t(error || statusError)}</p>}

    <section className="maps-results" aria-label={t('Search results')}>
      <header className="maps-results-heading">
        <div className="maps-results-title"><div><h2 aria-label={`${t('Search results')} · ${data.total}`}>{t('Search results')} <span className="maps-count">{data.total}</span></h2>{data.job && <span className={`maps-status maps-status-${data.job.status}`} role="status">{['completed','partial'].includes(data.job.status) ? <CircleCheck size={13} aria-hidden="true" /> : active ? <LoaderCircle size={13} className="maps-spin" aria-hidden="true" /> : null}{t(data.job.status)}</span>}</div><p>{data.job?.query || t('Start a search to find businesses.')}</p></div>
        {data.total > 0 && <div className="maps-result-actions"><a href="/api/admin?action=maps-export" className="maps-button"><Download size={15} aria-hidden="true" />{t('Download CSV')}</a>{!importOpen && <button type="button" className="maps-button maps-primary" disabled={active} onClick={() => setImportOpen(true)}><Building2 size={15} aria-hidden="true" />{t('Send to Prospect Directory')}</button>}</div>}
      </header>

      {importOpen && data.total > 0 && <div className="maps-import" aria-label={t('Import prospects')}>
        <div className="maps-import-intro"><span className="maps-import-icon"><CopyCheck size={19} aria-hidden="true" /></span><div><h3>{t('Add these businesses to your directory')}</h3><p>{t('All captured results will be checked against the directory. Matching business names and cities are skipped, ignoring case and extra spaces.')}</p></div><button type="button" className="maps-icon-button" onClick={() => setImportOpen(false)} aria-label={t('Close import')}><X size={18} aria-hidden="true" /></button></div>
        <div className="maps-import-confirm"><label><input type="checkbox" checked={sourceConfirmed} onChange={event => setSourceConfirmed(event.target.checked)} />{t('I confirm this source permits collecting and retaining business details for commercial prospecting.')}</label><button type="button" onClick={() => void importResults()} disabled={!sourceConfirmed || active || importing} className="maps-button maps-primary">{importing ? <LoaderCircle size={16} className="maps-spin" aria-hidden="true" /> : <Building2 size={16} aria-hidden="true" />}{t(importing ? 'Adding prospects…' : 'Send to Prospect Directory')}</button></div>
      </div>}
      {jobActive && data.job && <MapsSearchProgress key={data.job.id} status={data.job.status} startedAt={data.job.startedAt} />}
      {data.job?.error && <p role="status" className="maps-notice">{t(data.job.error)}</p>}
      {data.rows.length > 0 ? <>
        <div className="maps-table-scroll" role="region" aria-label={t('Business results')} tabIndex={0}><table className="maps-table"><caption className="sr-only">{t('Business results')}</caption><colgroup><col className="maps-col-business" /><col className="maps-col-rating" /><col className="maps-col-contact" /><col className="maps-col-address" /></colgroup><thead><tr>{['Business', 'Google rating', 'Contact details', 'Address'].map(label => <th key={label} scope="col">{t(label)}</th>)}</tr></thead><tbody>{data.rows.map((row, i) => {
          const website = publicWebsite(row.website);
          return <tr key={i}>
            <td><div className="maps-business"><span className="maps-business-icon" aria-hidden="true"><Building2 size={18} /></span><div><strong title={row.title}>{row.title || '—'}</strong><span>{row.category || t('Category unavailable')}</span></div></div></td>
            <td><div className="maps-rating"><Star size={14} aria-hidden="true" /><strong>{row.rating || '—'}</strong></div><span className="maps-secondary">{row.reviews ? (Number(row.reviews) === 1 ? t('1 review') : t('{{count}} reviews', {count: Number(row.reviews).toLocaleString(intlLocale)})) : t('No reviews captured')}</span></td>
            <td><div className="maps-contact"><span className="maps-phone">{row.phone || t('Phone not captured')}</span>{website ? <a href={website.href} target="_blank" rel="noopener noreferrer" title={website.href}>{website.hostname.replace(/^www\./, '')}<ArrowUpRight size={12} aria-hidden="true" /><span className="sr-only">{t('Opens in a new tab')}</span></a> : <span className="maps-secondary">{t('Website not captured')}</span>}</div></td>
            <td><span className="maps-address">{row.address || '—'}</span></td>
          </tr>;
        })}</tbody></table></div>
        <footer className="maps-results-footer"><span>{t('Showing {{shown}} of {{total}} businesses', {shown: data.rows.length, total: data.total})}</span><span>{t('CSV download includes all captured results.')}</span></footer>
      </> : !active && !data.job?.error && <div className="maps-empty">
        <span className="maps-empty-icon"><MapPin size={25} aria-hidden="true" /></span>
        <h3>{t(data.job ? 'No businesses captured' : 'Your next prospects start here')}</h3>
        <p>{t(data.job ? 'Try different keywords or a nearby city.' : 'Enter a business type and city above to start your search.')}</p>
      </div>}
    </section>
  </section>;
}
