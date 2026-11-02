import { useState, useEffect, type ReactNode } from 'react';
import {
  Save,
  Send,
  ChevronRight,
  AlertCircle,
  LoaderCircle,
  Plus,
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
      onToast(publish ? 'Website published.' : 'Draft saved.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const groups = [
    { key: 'hero', label: 'Hero' },
    { key: 'landing', label: 'Process & Story' },
    { key: 'features', label: 'Solutions' },
    { key: 'outcomes', label: 'Outcomes' },
    { key: 'client', label: 'Case Studies' },
    { key: 'faq', label: 'FAQ' },
    { key: 'settings', label: 'Settings & Contact' },
  ];

  function renderField(value: unknown, path: string[]): ReactNode {
    if (typeof value === 'string') {
      const key = path.at(-1)!;
      if (path[0] === 'landing' && protectedLandingFields.includes(path[2])) return null;

      const words = key.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ');
      const label = key === 'cta' ? 'Button CTA' : words.charAt(0).toUpperCase() + words.slice(1);
      const isMultiline = value.length > 110 || /body|description|answer|note|message/i.test(key);

      return (
        <div key={path.join('.')} className="space-y-1">
          <label className="block text-xs font-medium text-slate-700">
            {/^\d+$/.test(key) ? `Item ${Number(key) + 1}` : label}
          </label>
          {isMultiline ? (
            <textarea
              rows={3}
              value={value}
              maxLength={6000}
              onChange={(e) => change(path, e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            />
          ) : (
            <input
              value={value}
              maxLength={6000}
              onChange={(e) => change(path, e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            />
          )}
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <div
          key={path.join('.')}
          className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
        >
          <div>
            <div className="font-medium text-slate-800 capitalize">
              {path.at(-1)?.replace(/([a-z])([A-Z])/g, '$1 $2')}
            </div>
            <div className="text-[11px] text-slate-400">Show on public website</div>
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
            <div key={k} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/40 space-y-2.5">
              <h5 className="text-xs font-semibold text-slate-700">
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
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Website Content
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {dirty ? 'Draft has unsaved changes' : `Last published ${formatDate(published)}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void save(false)}
            disabled={!doc || busy}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            <Save size={14} />
            <span>Save draft</span>
          </button>

          <button
            onClick={() => setConfirmPublish(true)}
            disabled={!doc || busy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0A261D] hover:bg-emerald-900 text-white font-medium text-xs transition-colors disabled:opacity-50"
          >
            {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Send size={14} />}
            <span>Publish</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-lg bg-rose-50 border border-rose-200/70 text-rose-800 text-xs flex items-center gap-2"
        >
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Section List */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-2 space-y-0.5">
          {groups.map((item) => {
            const isActive = group === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setGroup(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#0A261D] text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight
                  size={13}
                  className={isActive ? 'text-emerald-300' : 'text-slate-400'}
                />
              </button>
            );
          })}
        </div>

        {/* Right Editor */}
        <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              {groups.find((x) => x.key === group)?.label}
            </h3>

            {/* Language Toggle */}
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
              <button
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  locale === 'en'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLocale('fr')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  locale === 'fr'
                    ? 'bg-white text-slate-900 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Français
              </button>
            </div>
          </div>

          {/* Form Fields */}
          {!doc ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Loading content…
            </div>
          ) : group === 'features' ? (
            <div className="space-y-3.5">
              {Object.entries(doc.features).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">
                    {key}
                  </label>
                  <textarea
                    rows={2}
                    value={val[locale]}
                    onChange={(e) => change(['features', key, locale], e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          ) : group === 'faq' ? (
            <div className="space-y-3.5">
              {doc.faq[locale].map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">
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
                      className="text-xs text-rose-600 hover:underline disabled:opacity-40"
                    >
                      Delete
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
                className="w-full py-2 rounded-lg border border-dashed border-slate-200 hover:border-slate-300 text-slate-600 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus size={14} />
                <span>Add question</span>
              </button>
            </div>
          ) : group === 'settings' ? (
            <div className="space-y-3.5">{renderField(doc.settings, ['settings'])}</div>
          ) : (
            <div className="space-y-3.5">
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
            className="fixed inset-0 bg-slate-900/30"
            onClick={() => setConfirmPublish(false)}
          />
          <div className="relative bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Publish website changes?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Updates will appear live in English and French within 30 seconds.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmPublish(false)}
                className="px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Keep editing
              </button>
              <button
                disabled={busy}
                onClick={() => void save(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#0A261D] hover:bg-emerald-900 text-white font-medium text-xs flex items-center gap-1.5"
              >
                {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Publish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
