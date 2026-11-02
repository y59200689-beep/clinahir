import { useState, useRef, useEffect, type FormEvent } from 'react';
import {
  Building2,
  Clock,
  Globe2,
  CheckCircle2,
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
  ArrowUpRight,
  AlertCircle,
  LoaderCircle,
  Save,
  ShieldCheck,
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
      onToast('Prospect review saved.');
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
              Sourced Intelligence
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">
              Across {data.cities.length} markets
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Prospect Center Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pre-qualified clinic database, digital gap evaluation, and verified WhatsApp compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm"
          >
            <ArrowDownToLine size={15} />
            <span>CSV Template</span>
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0A3A2A] hover:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-sm active:scale-[0.99]"
          >
            <Upload size={15} />
            <span>Import CSV</span>
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
        <div className="p-6 rounded-2xl bg-white border border-emerald-200 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{fileName}</h4>
                <p className="text-xs text-slate-500">
                  {number(recordsInUpload)} prospect records detected · Automatic Google Maps header matching
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
              <X size={18} />
            </button>
          </div>

          <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              checked={confirmSource}
              onChange={(e) => setConfirmSource(e.target.checked)}
              className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-600"
            />
            <span>
              I confirm this source permits collecting and retaining these business details for commercial prospecting.
            </span>
          </label>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Duplicates skipped. Records enter “Needs review”.
            </span>
            <button
              disabled={!confirmSource || importing}
              onClick={() => void importCsv()}
              className="px-4 py-2 rounded-xl bg-[#0A3A2A] hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {importing ? <LoaderCircle size={15} className="animate-spin" /> : <Upload size={15} />}
              <span>Commit Import ({number(recordsInUpload)} centers)</span>
            </button>
          </div>
        </div>
      )}

      {/* 4 Interactive Filter Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setSearch('');
            setStage('');
            setCity('');
            setWebsite('');
            setPageIndex(0);
          }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            !isFiltered
              ? 'bg-[#0A3A2A] text-white border-emerald-800 shadow-md'
              : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Building2 size={18} className={!isFiltered ? 'text-emerald-300' : 'text-slate-400'} />
            <span className="text-[11px] font-bold font-mono">ALL</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums">{number(data.counts.total)}</div>
          <p className="text-xs opacity-80 mt-0.5">Total Directory</p>
        </button>

        <button
          onClick={() => {
            setStage(stage === 'review' ? '' : 'review');
            setPageIndex(0);
          }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            stage === 'review'
              ? 'bg-[#0A3A2A] text-white border-emerald-800 shadow-md'
              : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Clock size={18} className={stage === 'review' ? 'text-emerald-300' : 'text-amber-500'} />
            <span className="text-[11px] font-bold font-mono">REVIEW</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums">{number(data.counts.review)}</div>
          <p className="text-xs opacity-80 mt-0.5">Needs Review</p>
        </button>

        <button
          onClick={() => {
            setWebsite(website === 'without' ? '' : 'without');
            setPageIndex(0);
          }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            website === 'without'
              ? 'bg-[#0A3A2A] text-white border-emerald-800 shadow-md'
              : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Globe2 size={18} className={website === 'without' ? 'text-emerald-300' : 'text-rose-500'} />
            <span className="text-[11px] font-bold font-mono">GAP</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums">{number(data.counts.no_website)}</div>
          <p className="text-xs opacity-80 mt-0.5">No Website Listed</p>
        </button>

        <button
          onClick={() => {
            setStage(stage === 'qualified' ? '' : 'qualified');
            setPageIndex(0);
          }}
          className={`p-5 rounded-2xl border text-left transition-all ${
            stage === 'qualified'
              ? 'bg-[#0A3A2A] text-white border-emerald-800 shadow-md'
              : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 size={18} className={stage === 'qualified' ? 'text-emerald-300' : 'text-emerald-600'} />
            <span className="text-[11px] font-bold font-mono">QUALIFIED</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums">{number(data.counts.qualified)}</div>
          <p className="text-xs opacity-80 mt-0.5">Qualified Clinics</p>
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
        {/* Filters Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(0);
              }}
              placeholder="Search center name, city, address or phone…"
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPageIndex(0);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="">All Cities ({data.cities.length})</option>
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
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="">All Web Listings</option>
              <option value="with">Has Website</option>
              <option value="without">Missing Website</option>
            </select>

            <button
              onClick={() => void load()}
              disabled={busy}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Refresh directory"
            >
              <RefreshCw size={16} className={busy ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Directory Table */}
        {data.prospects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="py-3.5 px-6">Medical Center</th>
                  <th className="py-3.5 px-4">City & Address</th>
                  <th className="py-3.5 px-4">Specialty</th>
                  <th className="py-3.5 px-4">Online Web Presence</th>
                  <th className="py-3.5 px-4">Google Rating</th>
                  <th className="py-3.5 px-4">Review Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.prospects.map((p, idx) => (
                  <tr
                    key={p.id}
                    onClick={() => openProspectDrawer(p)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0 ${
                            idx % 3 === 0
                              ? 'bg-emerald-800'
                              : idx % 3 === 1
                              ? 'bg-teal-700'
                              : 'bg-slate-700'
                          }`}
                        >
                          <Building2 size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors">
                            {p.center_name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {p.phone || p.email || 'No phone listed'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 text-xs">
                        <MapPin size={13} className="text-slate-400" />
                        <span>{p.city}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px] mt-0.5">
                        {p.address || 'Address unrecorded'}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {p.category || 'Clinical Center'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {p.website_url ? (
                        <a
                          href={p.website_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline"
                        >
                          <span>Open site</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                          Missing Website
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-800">
                        <Star size={13} className="text-amber-500 fill-amber-500" />
                        <span>{p.rating ?? '—'}</span>
                        <span className="text-[11px] font-normal text-slate-400">
                          ({p.review_count ?? 0})
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <StatusPill value={p.qualification_stage} />
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-800 text-slate-400 flex items-center justify-center transition-colors mx-auto">
                        <ArrowUpRight size={15} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <Building2 size={36} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">No prospects matching criteria</h4>
            <p className="text-xs text-slate-400 mt-1">
              Try selecting a different city or clearing the active search filter.
            </p>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Showing {data.prospects.length ? number(pageIndex * 25 + 1) : 0}–
            {number(Math.min((pageIndex + 1) * 25, data.total))} of {number(data.total)} records
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPageIndex((n) => Math.max(0, n - 1))}
              disabled={pageIndex === 0 || busy}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-mono font-semibold text-slate-700">
              Page {pageIndex + 1}
            </span>
            <button
              onClick={() => setPageIndex((n) => n + 1)}
              disabled={(pageIndex + 1) * 25 >= data.total || busy}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer for Prospect Review */}
      <AdminDrawer
        title="Prospect Intelligence Dossier"
        subtitle={selected ? `ID: ${selected.id}` : undefined}
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0A3A2A] text-white font-bold text-base flex items-center justify-center shrink-0">
                <Building2 size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selected.center_name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selected.city} · Sourced via {selected.source_name || 'Public Web'}
                </p>
              </div>
            </div>

            {/* Business Contact Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Phone Number
                </span>
                <span className="font-semibold text-slate-800 font-mono">
                  {selected.phone || 'Not recorded'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Email Address
                </span>
                <span className="font-semibold text-slate-800 font-mono truncate block">
                  {selected.email || 'Not recorded'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Street Address
                </span>
                <span className="font-semibold text-slate-800">
                  {selected.address || 'Address not listed'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Website
                </span>
                {selected.website_url ? (
                  <a
                    href={selected.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <span>Visit website</span>
                    <ExternalLink size={11} />
                  </a>
                ) : (
                  <span className="text-rose-600 font-semibold">Missing</span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Rating
                </span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Star size={13} className="text-amber-500 fill-amber-500" />
                  {selected.rating ?? '—'} ({selected.review_count ?? 0} reviews)
                </span>
              </div>
            </div>

            {/* Observed Gap & Digital Opportunities */}
            {selected.main_gap && (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-1">
                  Observed Clinical Gap: {selected.main_gap}
                </span>
                <p className="text-xs text-amber-950/80 leading-relaxed">
                  {selected.gap_evidence || 'Evidence awaiting documentation.'}
                </p>
              </div>
            )}

            {/* Social Links */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                ['Instagram', selected.instagram_url],
                ['Facebook', selected.facebook_url],
                ['TikTok', selected.tiktok_url],
              ]
                .filter(([, url]) => url)
                .map(([name, url]) => (
                  <a
                    key={name}
                    href={String(url)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                  >
                    <span>{name}</span>
                    <ExternalLink size={12} />
                  </a>
                ))}
            </div>

            {/* Qualification Form */}
            <form onSubmit={handleSaveProspect} className="space-y-4 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Review Status
                </label>
                <select
                  value={drawerStage}
                  onChange={(e) =>
                    setDrawerStage(e.target.value as Prospect['qualification_stage'])
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                >
                  <option value="review">Needs review</option>
                  <option value="qualified">Qualified</option>
                  <option value="not_a_fit">Not a fit</option>
                  <option value="do_not_contact">Do not contact</option>
                </select>
              </div>

              {/* WhatsApp Explicit Opt-in Verification */}
              <div className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-emerald-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={drawerOptIn && drawerStage !== 'do_not_contact'}
                    disabled={drawerStage === 'do_not_contact'}
                    onChange={(e) => setDrawerOptIn(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-600"
                  />
                  <span>WhatsApp opt-in has been explicitly verified</span>
                </label>

                {drawerOptIn && drawerStage !== 'do_not_contact' && (
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-900 mb-1">
                      Consent Evidence & Source
                    </label>
                    <textarea
                      rows={2}
                      maxLength={500}
                      required
                      value={drawerEvidence}
                      onChange={(e) => setDrawerEvidence(e.target.value)}
                      placeholder="Specify date, meeting, or written record confirming consent…"
                      className="w-full p-2 rounded-lg border border-emerald-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Private Review Notes
                </label>
                <textarea
                  rows={3}
                  maxLength={3000}
                  value={drawerNotes}
                  onChange={(e) => setDrawerNotes(e.target.value)}
                  placeholder="Clinical size, existing software, reception responsiveness…"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              {drawerError && (
                <p className="text-xs text-rose-600 font-medium">{drawerError}</p>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={drawerBusy}
                  className="px-5 py-2.5 rounded-xl bg-[#0A3A2A] hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {drawerBusy ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  <span>Save Review</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}
