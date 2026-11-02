import { useState, useRef, useEffect, type FormEvent } from 'react';
import {
  Building2,
  ArrowDownToLine,
  Upload,
  Search,
  RefreshCw,
  X,
  FileText,
  Star,
  ExternalLink,
  MapPin,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Save,
} from 'lucide-react';
import { StatusPill } from '../components/StatusPill';
import { AdminDrawer } from '../components/AdminDrawer';
import { adminApi, type Prospect, type ProspectSnapshot } from '../types';

interface ProspectsPageProps {
  onToast: (msg: string) => void;
}

function csvRecordCount(source: string) {
  let quoted = false, records = 0, hasText = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') i++;
      else if (char === '"') quoted = false;
      else if (!/\s/.test(char)) hasText = true;
    } else if (char === '"') {
      quoted = true;
    } else if (char === '\n' || char === '\r') {
      if (hasText) records++;
      hasText = false;
      if (char === '\r' && source[i + 1] === '\n') i++;
    } else if (!/\s/.test(char)) {
      hasText = true;
    }
  }
  if (hasText) records++;
  return Math.max(0, records - 1);
}

export function ProspectsPage({ onToast }: ProspectsPageProps) {
  const [data, setData] = useState<ProspectSnapshot>({
    prospects: [],
    total: 0,
    cities: [],
    counts: { total: 0, review: 0, qualified: 0, opted_in: 0, no_website: 0 },
  });
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Prospect | null>(null);

  // CSV Import State
  const [csv, setCsv] = useState('');
  const [fileName, setFileName] = useState('');
  const [confirmSource, setConfirmSource] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const loadSeq = useRef(0);

  // Drawer form state
  const [drawerStage, setDrawerStage] = useState<Prospect['qualification_stage']>('review');
  const [drawerNotes, setDrawerNotes] = useState('');
  const [drawerOptIn, setDrawerOptIn] = useState(false);
  const [drawerEvidence, setDrawerEvidence] = useState('');
  const [drawerBusy, setDrawerBusy] = useState(false);
  const [drawerError, setDrawerError] = useState('');

  const number = (n: number) => new Intl.NumberFormat('en').format(n);

  async function load() {
    const seq = ++loadSeq.current;
    setBusy(true);
    setError('');
    try {
      const result = await adminApi<ProspectSnapshot>(
        'prospects',
        undefined,
        `&search=${encodeURIComponent(search)}&stage=${stage}&city=${encodeURIComponent(city)}&website=${website}&page=${pageIndex}`
      );
      if (seq === loadSeq.current) setData(result);
    } catch (e) {
      if (seq === loadSeq.current) setError((e as Error).message);
    } finally {
      if (seq === loadSeq.current) setBusy(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void load(), 180);
    return () => clearTimeout(timer);
  }, [search, stage, city, website, pageIndex]);

  function openProspectDrawer(p: Prospect) {
    setSelected(p);
    setDrawerStage(p.qualification_stage);
    setDrawerNotes(p.notes || '');
    setDrawerOptIn(Boolean(p.whatsapp_opt_in_at));
    setDrawerEvidence(p.whatsapp_opt_in_evidence || '');
    setDrawerError('');
  }

  async function handleSaveProspect(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;

    setDrawerBusy(true);
    setDrawerError('');
    try {
      await adminApi('prospect', {
        id: selected.id,
        stage: drawerStage,
        notes: drawerNotes,
        whatsappOptIn: drawerOptIn,
        optInEvidence: drawerEvidence,
      });
      onToast('Prospect updated.');
      setSelected(null);
      await load();
    } catch (err) {
      setDrawerError((err as Error).message);
    } finally {
      setDrawerBusy(false);
    }
  }

  async function chooseFile(file?: File) {
    if (!file) return;
    setError('');
    if (file.size > 180000) {
      setError('Choose a CSV file under 180 KB.');
      return;
    }
    try {
      setCsv(await file.text());
      setFileName(file.name);
      setConfirmSource(false);
    } catch {
      setError('The CSV file could not be read.');
    }
  }

  async function importCsv() {
    setImporting(true);
    setError('');
    try {
      const result = await adminApi<{ inserted: number; duplicates: number }>('prospects-import', {
        csv,
        sourceUseConfirmed: confirmSource,
      });
      setCsv('');
      setFileName('');
      setConfirmSource(false);
      if (fileRef.current) fileRef.current.value = '';
      onToast(`${result.inserted} prospects imported · ${result.duplicates} duplicates skipped.`);
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setImporting(false);
    }
  }

  function downloadTemplate() {
    const header =
      'center_name,city,phone,email,listing_url,rating,review_count,website_url,instagram_url,facebook_url,tiktok_url,online_booking_available,main_gap,gap_evidence,source_name,source_url,notes\n';
    const url = URL.createObjectURL(new Blob([header], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clinahir-prospects-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const isFiltered = Boolean(search || stage || city || website);
  const recordsInUpload = csv ? csvRecordCount(csv) : 0;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Prospect Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Sourced medical centers across {data.cities.length} cities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors shadow-sm"
          >
            <ArrowDownToLine size={14} />
            <span>CSV template</span>
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0A261D] hover:bg-emerald-900 text-white font-medium text-xs transition-colors"
          >
            <Upload size={14} />
            <span>Import prospects</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(e) => void chooseFile(e.target.files?.[0])}
          />
        </div>
      </div>

      {/* CSV Import Banner */}
      {csv && (
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText size={18} className="text-slate-500" />
              <div>
                <h4 className="font-semibold text-slate-900 text-xs">{fileName}</h4>
                <p className="text-[11px] text-slate-500">
                  {number(recordsInUpload)} records detected
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setCsv('');
                setFileName('');
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          </div>

          <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              checked={confirmSource}
              onChange={(e) => setConfirmSource(e.target.checked)}
              className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-600"
            />
            <span>
              I confirm this source permits collecting and retaining business details for commercial prospecting.
            </span>
          </label>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Duplicates skipped. New records enter "Needs review".
            </span>
            <button
              disabled={!confirmSource || importing}
              onClick={() => void importCsv()}
              className="px-3.5 py-1.5 rounded-lg bg-[#0A261D] hover:bg-emerald-900 text-white font-medium text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {importing ? <LoaderCircle size={14} className="animate-spin" /> : <Upload size={14} />}
              <span>Import {number(recordsInUpload)} records</span>
            </button>
          </div>
        </div>
      )}

      {/* 4 Clean Filter Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          onClick={() => {
            setSearch('');
            setStage('');
            setCity('');
            setWebsite('');
            setPageIndex(0);
          }}
          className={`p-4 rounded-xl border text-left transition-colors ${
            !isFiltered
              ? 'bg-[#0A261D] text-white border-emerald-900'
              : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-2xl font-semibold font-mono tabular-nums">{number(data.counts.total)}</div>
          <p className="text-xs opacity-80 mt-1 font-medium">All prospects</p>
        </button>

        <button
          onClick={() => {
            setStage(stage === 'review' ? '' : 'review');
            setPageIndex(0);
          }}
          className={`p-4 rounded-xl border text-left transition-colors ${
            stage === 'review'
              ? 'bg-[#0A261D] text-white border-emerald-900'
              : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-2xl font-semibold font-mono tabular-nums">{number(data.counts.review)}</div>
          <p className="text-xs opacity-80 mt-1 font-medium">Needs review</p>
        </button>

        <button
          onClick={() => {
            setWebsite(website === 'without' ? '' : 'without');
            setPageIndex(0);
          }}
          className={`p-4 rounded-xl border text-left transition-colors ${
            website === 'without'
              ? 'bg-[#0A261D] text-white border-emerald-900'
              : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-2xl font-semibold font-mono tabular-nums">{number(data.counts.no_website)}</div>
          <p className="text-xs opacity-80 mt-1 font-medium">No website</p>
        </button>

        <button
          onClick={() => {
            setStage(stage === 'qualified' ? '' : 'qualified');
            setPageIndex(0);
          }}
          className={`p-4 rounded-xl border text-left transition-colors ${
            stage === 'qualified'
              ? 'bg-[#0A261D] text-white border-emerald-900'
              : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="text-2xl font-semibold font-mono tabular-nums">{number(data.counts.qualified)}</div>
          <p className="text-xs opacity-80 mt-1 font-medium">Qualified</p>
        </button>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(0);
              }}
              placeholder="Search center, city, address or phone…"
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPageIndex(0);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="">All cities ({data.cities.length})</option>
              {data.cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={website}
              onChange={(e) => {
                setWebsite(e.target.value);
                setPageIndex(0);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none"
            >
              <option value="">All listings</option>
              <option value="with">Has website</option>
              <option value="without">Missing website</option>
            </select>

            <button
              onClick={() => void load()}
              disabled={busy}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Table */}
        {data.prospects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/60 text-xs font-medium text-slate-500 border-b border-slate-100">
                  <th className="py-2.5 px-5">Medical center</th>
                  <th className="py-2.5 px-4">City</th>
                  <th className="py-2.5 px-3">Specialty</th>
                  <th className="py-2.5 px-3">Website</th>
                  <th className="py-2.5 px-3">Rating</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.prospects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => openProspectDrawer(p)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-5">
                      <div className="font-medium text-slate-900 group-hover:text-emerald-800 transition-colors text-xs sm:text-sm">
                        {p.center_name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {p.phone || p.email || 'No phone listed'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-xs text-slate-700">
                        <MapPin size={12} className="text-slate-400" />
                        <span>{p.city}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-xs text-slate-600">
                        {p.category || 'Center'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {p.website_url ? (
                        <a
                          href={p.website_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-emerald-800 hover:underline"
                        >
                          <span>Website</span>
                          <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span className="text-xs text-rose-600">None</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1 text-xs text-slate-700">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="font-mono">{p.rating ?? '—'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <StatusPill value={p.qualification_stage} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-700">No prospects match</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Try clearing one of the filters above.</p>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-3.5 px-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            {data.prospects.length ? number(pageIndex * 25 + 1) : 0}–
            {number(Math.min((pageIndex + 1) * 25, data.total))} of {number(data.total)}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPageIndex((n) => Math.max(0, n - 1))}
              disabled={pageIndex === 0 || busy}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-2 font-mono text-slate-600">
              Page {pageIndex + 1}
            </span>
            <button
              onClick={() => setPageIndex((n) => n + 1)}
              disabled={(pageIndex + 1) * 25 >= data.total || busy}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer for Prospect Review */}
      <AdminDrawer
        title="Prospect Record"
        subtitle={selected ? `ID: ${selected.id}` : undefined}
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="space-y-5">
            {/* Header */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">{selected.center_name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {selected.city} · {selected.address || 'Address not listed'}
              </p>
            </div>

            {/* Quick Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-0.5">Phone</span>
                <span className="font-mono text-slate-800">{selected.phone || '—'}</span>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-0.5">Email</span>
                <span className="font-mono text-slate-800 truncate block">{selected.email || '—'}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProspect} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Review status
                </label>
                <select
                  value={drawerStage}
                  onChange={(e) =>
                    setDrawerStage(e.target.value as Prospect['qualification_stage'])
                  }
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                >
                  <option value="review">Needs review</option>
                  <option value="qualified">Qualified</option>
                  <option value="not_a_fit">Not a fit</option>
                  <option value="do_not_contact">Do not contact</option>
                </select>
              </div>

              {/* WhatsApp opt-in */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={drawerOptIn && drawerStage !== 'do_not_contact'}
                    disabled={drawerStage === 'do_not_contact'}
                    onChange={(e) => setDrawerOptIn(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-600"
                  />
                  <span>WhatsApp opt-in verified</span>
                </label>

                {drawerOptIn && drawerStage !== 'do_not_contact' && (
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Consent record
                    </label>
                    <textarea
                      rows={2}
                      maxLength={500}
                      required
                      value={drawerEvidence}
                      onChange={(e) => setDrawerEvidence(e.target.value)}
                      placeholder="Record where consent was given…"
                      className="w-full p-2 rounded border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Private notes
                </label>
                <textarea
                  rows={3}
                  maxLength={3000}
                  value={drawerNotes}
                  onChange={(e) => setDrawerNotes(e.target.value)}
                  placeholder="Clinical notes…"
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              {drawerError && (
                <p className="text-xs text-rose-600 font-medium">{drawerError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={drawerBusy}
                  className="px-4 py-2 rounded-lg bg-[#0A261D] hover:bg-emerald-900 text-white font-medium text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {drawerBusy ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Save review</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}
