import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import { useAdminLocale } from '../i18n';
import { adminApi, type ProspectSnapshot, type Snapshot } from '../types';

import { DeleteSelected, RecordCheckbox, useRecordSelection, type RecordTarget } from './RecordSelection';
export type { RecordTarget } from './RecordSelection';

export function DeleteRecordButton({ record, onDelete }: {
  record: RecordTarget;
  onDelete: (record: RecordTarget) => void;
}) {
  const { t } = useAdminLocale();
  const label = t(record.kind === 'lead' ? 'Delete lead {{name}}' : 'Delete prospect {{name}}', { name: record.name });
  return <button
    type="button" aria-label={label} title={label}
    className="inline-flex rounded-md p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"
    onClick={event => { event.stopPropagation(); onDelete(record); }}
  ><Trash2 size={16} aria-hidden="true" /></button>;
}

export function DeleteRecordDialog({ initialTargets, onClose, onDeleted }: {
  initialTargets: RecordTarget[];
  onClose: () => void;
  onDeleted: (records: RecordTarget[]) => void;
}) {
  const { t, errorText } = useAdminLocale();
  const [targets, setTargets] = useState(initialTargets);
  const target = targets[0];
  const selection = useRecordSelection();
  const [kind, setKind] = useState<RecordTarget['kind']>('lead');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ rows: RecordTarget[]; total: number; page: number; query: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const cancelButton = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (target) cancelButton.current?.focus();
    else searchInput.current?.focus();
  }, [target]);

  async function searchRecords(search: string, page: number) {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const params = `&search=${encodeURIComponent(search)}&page=${page}`;
      if (kind === 'lead') {
        const data = await adminApi<Snapshot>('snapshot', undefined, params);
        setResult({ rows: data.leads.map(lead => ({
          kind, id: lead.external_id, name: lead.company_name,
          detail: [lead.contact_name, lead.city, lead.phone || lead.email].filter(Boolean).join(' · '),
        })), total: data.total, page, query: search });
      } else {
        const data = await adminApi<ProspectSnapshot>('prospects', undefined, params);
        setResult({ rows: data.prospects.map(prospect => ({
          kind, id: prospect.id, name: prospect.center_name, detail: prospect.city,
        })), total: data.total, page, query: search });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    void searchRecords(query.trim(), 0);
  }

  async function deleteRecord() {
    if (!target || busy) return;
    setBusy(true);
    setError('');
    try {
      if (targets.length === 1) {
        await adminApi('delete-record', { kind: target.kind, id: target.id });
      } else {
        await adminApi('delete-records', { kind: target.kind, ids: targets.map(record => record.id) });
      }
      onDeleted(targets);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return <Modal tone="admin"
    title={targets.length > 1
      ? t(target.kind === 'lead' ? 'Delete {{count}} leads?' : 'Delete {{count}} prospects?', { count: targets.length })
      : t(target ? target.kind === 'lead' ? 'Delete lead?' : 'Delete prospect?' : 'Delete a lead or prospect')}
    closeLabel={t('Close')} onClose={() => { if (!busy) onClose(); }}>
    {target ? <>
      <ul className="max-h-56 divide-y overflow-y-auto">
        {targets.map(record => <li key={record.id} className="py-2">
          <p className="break-words font-semibold">{record.name}</p>
          {record.detail && <p className="break-words text-sm text-slate-600">{record.detail}</p>}
          <p className="break-words text-xs text-slate-600">{record.id}</p>
        </li>)}
      </ul>
      <p className="mt-3 text-sm text-slate-600">{t(targets.length === 1
        ? 'This permanently removes the record from Clinahir.'
        : 'This permanently removes the selected records from Clinahir.')}</p>
      <div className="mt-5 flex justify-end gap-3">
        <button ref={cancelButton} type="button" disabled={busy} onClick={() => {
          if (initialTargets.length) onClose();
          else { setError(''); setTargets([]); }
        }}>{t('Cancel')}</button>
        <button type="button" disabled={busy} onClick={() => void deleteRecord()}
          className="rounded-lg bg-rose-700 px-4 py-2 text-white disabled:opacity-50">
          {t(busy ? 'Deleting…' : 'Delete permanently')}
        </button>
      </div>
    </> : <>
      <form onSubmit={submitSearch} className="space-y-3">
        <fieldset disabled={busy} className="flex gap-4 text-sm">
          <legend className="sr-only">{t('Record type')}</legend>
          <label><input type="radio" name="delete-kind" checked={kind === 'lead'} onChange={() => { setKind('lead'); setResult(null); setError(''); selection.clear(); }} /> {t('Leads')}</label>
          <label><input type="radio" name="delete-kind" checked={kind === 'prospect'} onChange={() => { setKind('prospect'); setResult(null); setError(''); selection.clear(); }} /> {t('Prospects')}</label>
        </fieldset>
        <div className="flex gap-2">
          <input ref={searchInput} type="search" value={query} onChange={event => setQuery(event.target.value)}
            maxLength={120} aria-label={t('Search records')} className="w-full min-w-0 rounded-lg border px-3 py-2"
            placeholder={t('Search records')} />
          <button type="submit" disabled={busy} className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50">{t('Search')}</button>
        </div>
      </form>
      {!busy && <DeleteSelected selection={selection} onDelete={setTargets} />}
      {busy && <p role="status" className="mt-3 text-sm">{t('Loading…')}</p>}
      {result && (result.rows.length ? <>
        <ul className="mt-3 max-h-56 divide-y overflow-y-auto">
          {result.rows.map(record => <li key={record.id} className="flex items-center gap-3 px-2 py-2">
            <RecordCheckbox record={record} selection={selection} />
            <span className="min-w-0 flex-1 break-words text-sm">{record.name}{record.detail && <span className="block text-xs text-slate-600">{record.detail}</span>}<span className="block text-xs text-slate-600">{record.id}</span></span>
            <DeleteRecordButton record={record} onDelete={item => setTargets([item])} />
          </li>)}
        </ul>
        <div className="mt-3 flex justify-end gap-3 text-sm">
          {result.page > 0 && <button type="button" onClick={() => void searchRecords(result.query, result.page - 1)}>{t('Previous page')}</button>}
          {(result.page + 1) * 25 < result.total && <button type="button" onClick={() => void searchRecords(result.query, result.page + 1)}>{t('Next page')}</button>}
        </div>
      </> : <p className="mt-3 text-sm">{t('No matching records.')}</p>)}
    </>}
    {error && <p role="alert" className="mt-3 text-sm text-rose-700">{errorText(error)}</p>}
  </Modal>;
}
