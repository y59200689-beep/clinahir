import { DeleteRecordButton, type RecordTarget } from '../components/DeleteRecordDialog';
import { MapsSearchProgress } from '../components/MapsSearchProgress';
import { AdminSelect } from '../components/AdminSelect';
import { useEffect, useId, useRef, useState } from 'react';
import { Download, MapPin, Search, LoaderCircle, ArrowUpRight, Building2, Star, SlidersHorizontal, CopyCheck, X, CircleCheck, Clock3, Globe, Filter } from 'lucide-react';
import { adminApi } from '../types';
import { useAdminLocale } from '../i18n';
import '../maps.css';
import { maxMapsLocationLength } from '../../../server/maps-locations.mjs';
function publicWebsite(value: string) { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url : null; } catch { return null; } }
type SearchJob = {
  id: string; query: string; status: string; startedAt?: string; lastWorkerUpdate?: string;
  error?: string; keywords?: string; locations?: string[]; milestones?: string[]; total?: number;
};
type ResultRow = {
  title: string; category: string; rating: string; reviews: string; phone: string;
  website: string; address: string; city: string; location?: string; directoryMatch?: boolean | null; prospectId?: string | null;
};
type Results = { job: SearchJob | null; rows: ResultRow[]; total: number };
const activeStatus = (status?: string) => ['queued', 'starting', 'running'].includes(status ?? '');
const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
const normalizeLocation = (value: string) => normalize(value).normalize('NFD').replace(/\p{M}/gu, '');
const resultLocation = (row: ResultRow, locations: string[]) => row.location
  || (locations.length === 1 ? locations[0] : locations.find(location =>
    normalizeLocation(location.split(',')[0]) === normalizeLocation(row.city)));
export function MapsPage({ onImported, onDelete, deletedProspects }: {
  onImported: (result: { inserted: number; duplicates: number }) => void;
  onDelete: (record: RecordTarget) => void;
  deletedProspects?: ReadonlySet<string>;
}) {
  const { t, intlLocale } = useAdminLocale();
  const [keywords, setKeywords] = useState('');
  const locationsHelp = useId();
  const [city, setCity] = useState('');
  const [proxy, setProxy] = useState('none');
  const [latest, setLatest] = useState<Results>({ job: null, rows: [], total: 0 });
  const [archive, setArchive] = useState<Results | null>(null);
  const data = archive ?? latest;
  const [history, setHistory] = useState<SearchJob[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [category, setCategory] = useState('');
  const [website, setWebsite] = useState('');
  const [match, setMatch] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [visibleLimit, setVisibleLimit] = useState(25);
  const revision = useRef(0);
  const [error, setError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sourceConfirmed, setSourceConfirmed] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  const jobActive = activeStatus(data.job?.status);
  const active = busy || activeStatus(latest.job?.status);
  const locations = data.job?.locations ?? [];
  const categories = [...new Set(data.rows.map(row => row.category).filter(Boolean))].sort((a,b) => a.localeCompare(b,intlLocale));
  const countsByCity = new Map<string, number>();
  for (const row of data.rows) {
    const location = resultLocation(row, locations);
    if (location) countsByCity.set(location, (countsByCity.get(location) ?? 0) + 1);
  }
  const filtered = data.rows.map((row, index) => ({ row, index })).filter(({ row }) =>
    (!cityFilter || resultLocation(row, locations) === cityFilter)
    && (!category || row.category === category)
    && (!website || Boolean(publicWebsite(row.website)) === (website === 'with'))
    && (!match || row.directoryMatch === (match === 'existing')));
  const selectedSet = new Set(selected);
  const allFilteredSelected = filtered.length > 0 && filtered.every(({ index }) => selectedSet.has(index));
  const intended = selected.length ? selected.map(index => data.rows[index]).filter(Boolean) : data.rows;
  const matchKnown = intended.length > 0 && intended.every(row => typeof row.directoryMatch === 'boolean');
  const expected = new Set(intended.filter(row => !row.directoryMatch && row.title.trim() && row.city.trim())
    .map(row => JSON.stringify([normalize(row.title), normalize(row.city)]))).size;

  function resetResults() {
    setSelected([]); setCityFilter(''); setCategory(''); setWebsite(''); setMatch(''); setVisibleLimit(25);
    setImportOpen(false); setSourceConfirmed(false);
  }

  useEffect(() => { resetResults(); }, [data.job?.id]);

  async function loadHistory() {
    setHistoryLoading(true); setHistoryError('');
    try { setHistory((await adminApi<{ jobs: SearchJob[] }>('maps-history')).jobs); }
    catch { setHistoryError('Recent searches are temporarily unavailable.'); }
    finally { setHistoryLoading(false); }
  }

  async function openSearch(id: string) {
    if (id === latest.job?.id) { setArchive(null); return; }
    setBusy(true); setError('');
    try { setArchive(await adminApi<Results>('maps-status', undefined, '&job=' + encodeURIComponent(id))); }
    catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      const generation = revision.current;
      try { const result = await adminApi<Results>('maps-status'); if (!disposed && generation === revision.current) { setLatest(result); setStatusError(''); } }
      catch { if (!disposed) setStatusError('Status temporarily unavailable. Retrying automatically…'); }
      finally { if (!disposed) timer = setTimeout(() => void refresh(), 5000); }
    }
    void refresh();
    return () => { disposed = true; clearTimeout(timer); };
  }, [local, deletedProspects]);

  useEffect(() => {
    if (!deletedProspects) return;
    const removeMatch = (result: Results): Results => ({
      ...result, rows: result.rows.map(row => row.prospectId && deletedProspects.has(row.prospectId)
        ? { ...row, directoryMatch: false, prospectId: null } : row),
    });
    setLatest(removeMatch);
    setArchive(current => current && removeMatch(current));
  }, [deletedProspects]);
  async function startSearch(nextKeywords: string, nextCity: string, nextProxy: string) {
    ++revision.current;
    setBusy(true); setError(''); setImportOpen(false); setSourceConfirmed(false);
    try {
      const result = await adminApi<{ job: SearchJob }>('maps-start', { keywords: nextKeywords, city: nextCity, proxy: nextProxy });
      ++revision.current;
      setArchive(null);
      setLatest({ job: result.job, rows: [], total: 0 });
      if (historyOpen) void loadHistory();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  async function stop() {
    ++revision.current;
    setBusy(true); setError('');
    try {
      await adminApi('maps-stop', { jobId: latest.job?.id });
      const result = await adminApi<Results>('maps-status');
      ++revision.current;
      setLatest(result);
      if (historyOpen) void loadHistory();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }
  async function importResults() {
    setImporting(true); setError('');
    try {
      const result = await adminApi<{ inserted: number; duplicates: number }>('maps-import', { jobId: data.job?.id, sourceUseConfirmed: sourceConfirmed, indices: selected.length ? selected : undefined });
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
      <form onSubmit={event => { event.preventDefault(); void startSearch(keywords, city, proxy); }}>
        <div className="maps-query-row">
          <label className="maps-field"><span>{t('Keywords')}</span><div className="maps-input"><Search size={17} aria-hidden="true" /><input required maxLength={120} value={keywords} onChange={e => setKeywords(e.target.value)} placeholder={t('e.g. radiology centers')} /></div></label>
          <label className="maps-field"><span>{t('Cities or areas')}</span><div className="maps-input"><MapPin size={17} aria-hidden="true" /><input required maxLength={maxMapsLocationLength} aria-describedby={locationsHelp} value={city} onChange={e => setCity(e.target.value)} placeholder={t('Casablanca; Rabat; Tangier')} /></div></label>
          <div className="maps-search-actions"><button disabled={active || importing} className="maps-button maps-primary">{active ? <LoaderCircle size={16} className="maps-spin" aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}{t(active ? 'Search in progress…' : 'Search businesses')}</button>{['queued','running'].includes(latest.job?.status ?? '') && <button type="button" disabled={busy} onClick={() => void stop()} className="maps-button">{t('Stop search')}</button>}</div>
        </div>
        <p id={locationsHelp} className="maps-location-help">{t('Separate up to 5 cities or areas with semicolons.')}</p>
        <details className="maps-options"><summary><SlidersHorizontal size={14} aria-hidden="true" />{t('Search options')}<span>{t(proxy === 'none' ? 'Without proxy' : 'Configured proxy')}</span></summary><div className="maps-options-content"><div className="maps-field"><span>{t('Proxy')}</span><AdminSelect variant="field" label={t('Proxy')} value={proxy} onChange={setProxy} choices={[{ value: 'none', label: t('Continue without a proxy') }, { value: 'configured', label: t('Use the configured local proxy'), disabled: !local }]} /></div><p>{t('A proxy is optional for a small search. Configure credentials privately on this computer.')}<br />{t(local ? 'Runs locally with Docker. Shallow search, no email extraction or extra reviews. Results stay on this computer.' : 'Searches run online through GitHub Actions. Your computer can stay off.')}</p></div></details>
      </form>
      {!local && <p className="maps-hosted-note">{t('Online searches may take a few minutes to start. You can leave this page and return later.')}</p>}
    </section>
    <details className="maps-history" onToggle={event => {
      const open = event.currentTarget.open;
      setHistoryOpen(open);
      if (open) void loadHistory();
    }}>
      <summary><Clock3 size={16} aria-hidden="true" />{t('Recent searches')}</summary>
      {historyLoading && <p role="status">{t('Loading…')}</p>}
      {historyError && <p role="alert">{t(historyError)} <button type="button" onClick={() => void loadHistory()}>{t('Try again')}</button></p>}
      {!historyLoading && !historyError && history.length === 0 && <p>{t('No recent searches yet.')}</p>}
      <ul>
        {history.map(job => {
          const current = job.id === latest.job?.id ? latest.job : job;
          return <li key={job.id}>
            <button type="button" className="maps-history-query" disabled={busy} aria-current={job.id === data.job?.id ? 'true' : undefined}
              onClick={() => void openSearch(job.id)}>{job.query}</button>
            <span>{t(current?.status ?? job.status)}{(current?.total ?? job.total) != null ? ` · ${new Intl.NumberFormat(intlLocale).format((current?.total ?? job.total) ?? 0)}` : ''}</span>
            {job.startedAt && <time dateTime={job.startedAt}>{new Date(job.startedAt).toLocaleString(intlLocale, { dateStyle:'short', timeStyle:'short' })}</time>}
            {job.keywords && !!job.locations?.length && <button type="button" className="maps-button" disabled={active || importing}
              onClick={() => {
                const cities = job.locations!.join(';');
                setKeywords(job.keywords!); setCity(cities); setProxy('none');
                void startSearch(job.keywords!, cities, 'none');
              }}>{t('Rerun')}</button>}
          </li>;
        })}
      </ul>
    </details>
    {archive && <button type="button" className="maps-button maps-latest" onClick={() => setArchive(null)}>{t('Back to latest search')}</button>}
    {(error || statusError) && <p role="alert" className="maps-error">{t(error || statusError)}</p>}

    <section className="maps-results" aria-label={t('Search results')}>
      <header className="maps-results-heading">
        <div className="maps-results-title"><div><h2 aria-label={`${t('Search results')} · ${data.total}`}>{t('Search results')} <span className="maps-count">{data.total}</span></h2>{data.job && <span className={`maps-status maps-status-${data.job.status}`} role="status">{['completed','partial'].includes(data.job.status) ? <CircleCheck size={13} aria-hidden="true" /> : active ? <LoaderCircle size={13} className="maps-spin" aria-hidden="true" /> : null}{t(data.job.status)}</span>}</div><p>{data.job?.query || t('Start a search to find businesses.')}</p></div>
        {data.total > 0 && <div className="maps-result-actions"><a href={'/api/admin?action=maps-export' + (data.job ? '&job=' + encodeURIComponent(data.job.id) : '')} className="maps-button"><Download size={15} aria-hidden="true" />{t('Download CSV')}</a>{!importOpen && <button type="button" className="maps-button maps-primary" disabled={jobActive || busy} onClick={() => setImportOpen(true)}><Building2 size={15} aria-hidden="true" />{t('Send to Prospect Directory')}</button>}</div>}
      </header>

      {importOpen && data.total > 0 && <div className="maps-import" aria-label={t('Import prospects')}>
        <div className="maps-import-intro"><span className="maps-import-icon"><CopyCheck size={19} aria-hidden="true" /></span><div><h3>{t('Add these businesses to your directory')}</h3><p>{t('Import {{count}} results.', { count: intended.length })}
          {' '}{matchKnown && t('About {{count}} are new to the directory.', { count: expected })}
          {' '}{t('Duplicates are skipped when you confirm the import.')}</p></div><button type="button" className="maps-icon-button" onClick={() => setImportOpen(false)} aria-label={t('Close import')}><X size={18} aria-hidden="true" /></button></div>
        <div className="maps-import-confirm"><label><input type="checkbox" checked={sourceConfirmed} onChange={event => setSourceConfirmed(event.target.checked)} />{t('I confirm this source permits collecting and retaining business details for commercial prospecting.')}</label><button type="button" onClick={() => void importResults()} disabled={!sourceConfirmed || jobActive || busy || importing} className="maps-button maps-primary">{importing ? <LoaderCircle size={16} className="maps-spin" aria-hidden="true" /> : <Building2 size={16} aria-hidden="true" />}{t(importing ? 'Adding prospects…' : 'Send to Prospect Directory')}</button></div>
      </div>}
      {jobActive && data.job && <MapsSearchProgress key={data.job.id} status={data.job.status} startedAt={data.job.startedAt}
        lastWorkerUpdate={data.job.lastWorkerUpdate} total={data.total}
        preparing={data.job.status === 'running' && data.job.milestones?.every(value => value === 'pending')} />}
      {locations.length > 0 && (
        <div className="maps-cities">
          <div className="maps-section-line">
            <strong>{t('Per-city results')}</strong>
            {data.job?.milestones && <span>{t('{{finished}} of {{total}} cities finished', {
              finished: data.job.milestones.filter(value => value === 'finished').length, total: locations.length,
            })}</span>}
          </div>
          <div className="maps-city-list">
            {locations.map((location, index) => {
              const recorded = data.job?.milestones?.[index];
              const phase = recorded === 'finished' ? 'City finished' : !jobActive
                ? data.job?.status === 'completed' ? 'City finished' : 'City incomplete'
                : recorded === 'searching' ? 'City searching' : recorded === 'incomplete' ? 'City incomplete'
                : data.job?.status === 'queued' || recorded === 'pending' ? 'City waiting' : 'City status unavailable';
              return <button type="button" key={location} aria-pressed={cityFilter === location}
                onClick={() => { setCityFilter(cityFilter === location ? '' : location); setVisibleLimit(25); }}>
                <strong>{location}</strong><span>{countsByCity.get(location) ?? 0}</span><small>{t(phase)}</small>
              </button>;
            })}
          </div>
        </div>
      )}
      {data.job?.error && <p role="status" className="maps-notice">{t(data.job.error)}</p>}
      {data.rows.length > 0 ? <>
        <div className="maps-result-filters">
          <Filter size={15} aria-hidden="true" />
          <AdminSelect label={t('Category')} value={category} highlight onChange={value => { setCategory(value); setVisibleLimit(25); }}
            choices={[{ value:'', label:t('All categories') }, ...categories.map(value => ({ value, label:value }))]} />
          <AdminSelect label={t('Website filter')} icon={<Globe size={14} aria-hidden="true" />} value={website} highlight onChange={value => { setWebsite(value); setVisibleLimit(25); }}
            choices={[{ value:'', label:t('All listings') }, { value:'with', label:t('Has website') }, { value:'without', label:t('Missing website') }]} />
          <AdminSelect label={t('Directory match')} value={match} highlight onChange={value => { setMatch(value); setVisibleLimit(25); }}
            choices={[{ value:'', label:t('All matches') }, { value:'new', label:t('New to directory') }, { value:'existing', label:t('Already in directory') }]} />
          <button type="button" className="maps-button" aria-pressed={match === 'new' && website === 'without'} onClick={() => {
            const active = match === 'new' && website === 'without';
            setMatch(active ? '' : 'new'); setWebsite(active ? '' : 'without'); setVisibleLimit(25);
          }}>{t('New · No website')}</button>
          {cityFilter && <button type="button" className="maps-button" onClick={() => setCityFilter('')}>{t('Clear city filter')}</button>}
        </div>
        <div className="maps-selection">
          <label><input type="checkbox" checked={allFilteredSelected} disabled={!filtered.length} onChange={() => {
            const filteredIds = new Set(filtered.map(({ index }) => index));
            setSelected(allFilteredSelected ? selected.filter(index => !filteredIds.has(index)) : [...new Set([...selected, ...filteredIds])]);
          }} /> {t('Select filtered results')}</label>
          {selected.length > 0 && <><span>{t('{{count}} selected', { count:selected.length })}</span>
            <button type="button" onClick={() => setSelected([])}>{t('Clear selection')}</button></>}
        </div>
        {filtered.length === 0 && <p className="maps-filter-empty">{t('No businesses match these filters.')}</p>}
        <div className="maps-table-scroll" role="region" aria-label={t('Business results')} tabIndex={0}><table className="maps-table"><caption className="sr-only">{t('Business results')}</caption><colgroup><col className="maps-col-business" /><col className="maps-col-rating" /><col className="maps-col-contact" /><col className="maps-col-address" /></colgroup><thead><tr>{['Business', 'Google rating', 'Contact details', 'Address'].map(label => <th key={label} scope="col">{t(label)}</th>)}</tr></thead><tbody>{filtered.slice(0, visibleLimit).map(({ row, index }) => {
          const website = publicWebsite(row.website);
          return <tr key={index}>
            <td><div className="maps-business">
              <input type="checkbox" checked={selectedSet.has(index)} aria-label={t('Select {{business}}', { business: row.title })}
                onChange={() => setSelected(selectedSet.has(index) ? selected.filter(value => value !== index) : [...selected, index])} />
              <div><strong title={row.title}>{row.title || '—'}</strong><span>{row.category || t('Category unavailable')}</span>
                {typeof row.directoryMatch === 'boolean' && <span className="maps-match" data-existing={row.directoryMatch}>{t(row.directoryMatch ? 'Already in directory' : 'New to directory')}</span>}
              </div>
              {row.prospectId && <DeleteRecordButton onDelete={onDelete}
                record={{ kind: 'prospect', id: row.prospectId, name: row.title, detail: row.city }} />}
            </div></td>
            <td><div className="maps-rating"><Star size={14} aria-hidden="true" /><strong>{row.rating || '—'}</strong></div><span className="maps-secondary">{row.reviews ? (Number(row.reviews) === 1 ? t('1 review') : t('{{count}} reviews', {count: Number(row.reviews).toLocaleString(intlLocale)})) : t('No reviews captured')}</span></td>
            <td><div className="maps-contact"><span className="maps-phone">{row.phone || t('Phone not captured')}</span>{website ? <a href={website.href} target="_blank" rel="noopener noreferrer" title={website.href}>{website.hostname.replace(/^www\./, '')}<ArrowUpRight size={12} aria-hidden="true" /><span className="sr-only">{t('Opens in a new tab')}</span></a> : <span className="maps-secondary">{t('Website not captured')}</span>}</div></td>
            <td><span className="maps-address">{row.address || '—'}</span></td>
          </tr>;
        })}</tbody></table></div>
        <footer className="maps-results-footer"><span>{t('Showing {{shown}} of {{total}} businesses', {shown: Math.min(visibleLimit,filtered.length), total: filtered.length})}</span>{filtered.length > visibleLimit && <button type="button" onClick={() => setVisibleLimit(value => value + 25)}>{t('Show more')}</button>}
          <span>{t('CSV download includes all captured results.')}</span></footer>
      </> : !active && !data.job?.error && <div className="maps-empty">
        <span className="maps-empty-icon"><MapPin size={25} aria-hidden="true" /></span>
        <h3>{t(data.job ? 'No businesses captured' : 'Your next prospects start here')}</h3>
        <p>{t(data.job ? 'Try different keywords or a nearby city.' : 'Enter a business type and city above to start your search.')}</p>
      </div>}
    </section>
  </section>;
}
