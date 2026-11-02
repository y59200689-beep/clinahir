import { useState, useEffect, type ReactNode } from 'react';
import {
  Save,
  Send,
  Globe2,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  LoaderCircle,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  Layers,
  Check,
} from 'lucide-react';
import { adminApi } from '../types';
import { siteDefaults, protectedLandingFields, type SiteDocument } from '../../content/schema';

interface WebsitePageProps {
  onToast: (msg: string) => void;
}

export function WebsitePage({ onToast }: WebsitePageProps) {
  const [doc, setDoc] = useState<SiteDocument | null>(null);
  const [version, setVersion] = useState(0);
  const [published, setPublished] = useState<string | null>(null);
  const [locale, setLocale] = useState<'en' | 'fr'>('en');
  const [group, setGroup] = useState('hero');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [confirmPublish, setConfirmPublish] = useState(false);

  useEffect(() => {
    void adminApi<{
      content: {
        draft: SiteDocument | null;
        published: SiteDocument | null;
        version: number;
        published_at: string | null;
      };
    }>('content')
      .then(({ content }) => {
        setDoc(content.draft ?? content.published ?? structuredClone(siteDefaults));
        setVersion(content.version);
        setPublished(content.published_at);
      })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function change(path: string[], value: unknown) {
    setDoc((old) => {
      const next = structuredClone(old!);
      let node = next as unknown as Record<string, unknown>;
      for (const key of path.slice(0, -1)) {
        node = node[key] as Record<string, unknown>;
      }
      node[path.at(-1)!] = value;
      return next;
    });
    setDirty(true);
  }

  async function save(publish = false) {
    if (!doc) return;
    setBusy(true);
    setError('');
    try {
      const r = await adminApi<{
        content: {
          version: number;
          published_at: string | null;
        };
      }>('content', { content: doc, version, publish });
      setVersion(r.content.version);
      setPublished(r.content.published_at);
      setDirty(false);
      setConfirmPublish(false);
      onToast(
        publish
          ? 'Website published live. Public pages synchronize within 30 seconds.'
          : 'Draft saved securely. Public site remains unchanged.'
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const groups = [
    { key: 'hero', label: 'Hero & First Impression' },
    { key: 'landing', label: 'Process, Story & Mission' },
    { key: 'features', label: 'Solutions & Capabilities' },
    { key: 'outcomes', label: 'Outcome Tabs & Metrics' },
    { key: 'client', label: 'Featured Case Studies' },
    { key: 'faq', label: 'Frequently Asked Questions' },
    { key: 'settings', label: 'Contact, Links & Visibility' },
  ];

  function renderField(value: unknown, path: string[]): ReactNode {
    if (typeof value === 'string') {
      const key = path.at(-1)!;
      if (path[0] === 'landing' && protectedLandingFields.includes(path[2])) return null;

      const words = key.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ');
      const label = key === 'cta' ? 'Button CTA Text' : words.charAt(0).toUpperCase() + words.slice(1);
      const isMultiline = value.length > 110 || /body|description|answer|note|message/i.test(key);

      return (
        <div key={path.join('.')} className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            {/^\d+$/.test(key) ? `Item ${Number(key) + 1}` : label}
          </label>
          {isMultiline ? (
            <textarea
              rows={3}
              value={value}
              maxLength={6000}
              onChange={(e) => change(path, e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          ) : (
            <input
              value={value}
              maxLength={6000}
              onChange={(e) => change(path, e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          )}
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <div
          key={path.join('.')}
          className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-bold text-slate-800 capitalize">
              {path.at(-1)?.replace(/([a-z])([A-Z])/g, '$1 $2')}
            </div>
            <div className="text-[11px] text-slate-500">Show this section on the live website</div>
          </div>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => change(path, e.target.checked)}
            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
          />
        </div>
      );
    }

    if (value && typeof value === 'object') {
      return Object.entries(value)
        .filter(
          ([k]) =>
            !(path[0] === 'landing' && path.length === 2 && protectedLandingFields.includes(k))
        )
        .map(([k, val]) =>
          typeof val === 'string' || typeof val === 'boolean' ? (
            renderField(val, [...path, k])
          ) : (
            <div key={k} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {Array.isArray(value) ? `Entry ${Number(k) + 1}` : k.replace(/([a-z])([A-Z])/g, '$1 $2')}
              </h5>
              {renderField(val, [...path, k])}
            </div>
          )
        );
    }

    return null;
  }

  const formatDate = (s: string | null) =>
    s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Never';

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                dirty
                  ? 'bg-amber-50 text-amber-800 border-amber-200/70'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200/70'
              }`}
            >
              {dirty ? 'Unsaved Modifications' : 'Draft Workspace in Sync'}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">
              Last published {formatDate(published)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Website Content & Localization
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish updates in English and French with simultaneous schema validation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => void save(false)}
            disabled={!doc || busy}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            <Save size={15} />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => setConfirmPublish(true)}
            disabled={!doc || busy}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0A3A2A] hover:bg-emerald-800 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-50 active:scale-[0.99]"
          >
            {busy ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />}
            <span>Publish Changes</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200/70 text-rose-800 text-xs font-medium flex items-center gap-3"
        >
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section Navigation (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Website Sections
          </div>
          {groups.map((item) => {
            const isActive = group === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setGroup(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold tracking-tight transition-all text-left ${
                  isActive
                    ? 'bg-[#0A3A2A] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight
                  size={14}
                  className={isActive ? 'text-emerald-300' : 'text-slate-400'}
                />
              </button>
            );
          })}

          <div className="pt-3 px-3">
            <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs space-y-1 text-emerald-950">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>Zero-Downtime Releases</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                Drafts are kept confidential until published. Public pages reload instantly with zero downtime.
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Fields (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-6 space-y-6">
          {/* Header with Language Segment Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {groups.find((x) => x.key === group)?.label}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Editing active copy for public distribution.
              </p>
            </div>

            {/* Language Toggle */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 self-start sm:self-auto">
              <button
                onClick={() => setLocale('en')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  locale === 'en'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                English (EN)
              </button>
              <button
                onClick={() => setLocale('fr')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  locale === 'fr'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Français (FR)
              </button>
            </div>
          </div>

          {/* Dynamic Content Fields */}
          {!doc ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Loading website documents…
            </div>
          ) : group === 'features' ? (
            <div className="space-y-4">
              {Object.entries(doc.features).map(([key, val]) => (
                <div key={key} className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {key}
                  </label>
                  <textarea
                    rows={2}
                    value={val[locale]}
                    onChange={(e) => change(['features', key, locale], e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          ) : group === 'faq' ? (
            <div className="space-y-4">
              {doc.faq[locale].map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Question {index + 1}
                    </span>
                    <button
                      type="button"
                      disabled={doc.faq[locale].length <= 1}
                      onClick={() =>
                        change(
                          ['faq', locale],
                          doc.faq[locale].filter((_, i) => i !== index)
                        )
                      }
                      className="text-xs font-semibold text-rose-600 hover:underline disabled:opacity-40"
                    >
                      Delete Question
                    </button>
                  </div>
                  {renderField(item, ['faq', locale, String(index)])}
                </div>
              ))}

              <button
                type="button"
                disabled={doc.faq[locale].length >= 30}
                onClick={() =>
                  change(['faq', locale], [
                    ...doc.faq[locale],
                    {
                      question: locale === 'en' ? 'New Question' : 'Nouvelle Question',
                      answer: '',
                    },
                  ])
                }
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 text-slate-600 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus size={15} />
                <span>Add New FAQ Item</span>
              </button>
            </div>
          ) : group === 'settings' ? (
            <div className="space-y-4">{renderField(doc.settings, ['settings'])}</div>
          ) : (
            <div className="space-y-4">
              {renderField(
                (doc[group as 'hero' | 'landing' | 'client' | 'faq' | 'outcomes'])[locale],
                [group, locale]
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setConfirmPublish(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Publish Website to Production?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will compile and publish the latest modifications in English and French. Changes will appear live across all visitor routes within 30 seconds.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmPublish(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep Editing
              </button>
              <button
                disabled={busy}
                onClick={() => void save(true)}
                className="px-5 py-2.5 rounded-xl bg-[#0A3A2A] hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-2 shadow-sm"
              >
                {busy ? <LoaderCircle size={15} className="animate-spin" /> : <Send size={15} />}
                <span>Confirm & Publish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
