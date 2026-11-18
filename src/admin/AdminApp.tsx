import { useAdminLocale } from './i18n';
import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { adminApi, emptySnapshot, type Lead, type Snapshot } from './types';
import { AdminShell } from './components/AdminShell';
import { adminHref, adminPageAt, type AdminPage } from './routes';
import { LoginPage } from './pages/LoginPage';
const MapsPage = lazy(() => import('./pages/MapsPage').then(module => ({ default: module.MapsPage })));
const OverviewPage = lazy(() => import('./pages/OverviewPage').then(module => ({ default: module.OverviewPage })));
const LeadsPage = lazy(() => import('./pages/LeadsPage').then(module => ({ default: module.LeadsPage })));
const ProspectsPage = lazy(() => import('./pages/ProspectsPage').then(module => ({ default: module.ProspectsPage })));
const WebsitePage = lazy(() => import('./pages/WebsitePage').then(module => ({ default: module.WebsitePage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(module => ({ default: module.AnalyticsPage })));
const DeliveriesPage = lazy(() => import('./pages/DeliveriesPage').then(module => ({ default: module.DeliveriesPage })));
const ActivityPage = lazy(() => import('./pages/ActivityPage').then(module => ({ default: module.ActivityPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
import './admin.css';
import { AdminLocaleProvider } from './i18n';

function AdminWorkspace() {
  const { t, errorText, intlLocale } = useAdminLocale();
  const [user, setUser] = useState<string | null>(null);
  const [page, setPage] = useState<AdminPage>(() => typeof window === 'undefined' ? 'Overview' : adminPageAt(window.location.pathname));
  const [session, setSession] = useState<'checking' | 'ready' | 'unavailable'>('checking');
  const [sessionAttempt, setSessionAttempt] = useState(0);
  const [data, setData] = useState<Snapshot>(emptySnapshot);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [toast, setToast] = useState('');

  const loadSequence = useRef(0);

  // Set page meta on mount
  useEffect(() => {
    document.title = t('Business administration');
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.append(robots);

    return () => robots.remove();
  }, []);

  useEffect(() => { document.title = `Clinahir — ${t('Business administration')}`; }, [t]);

  useEffect(() => {
    let current = true;
    // Recovery links must reach the password setup flow even with an existing session.
    if (new URLSearchParams(window.location.hash.slice(1)).has('access_token')) {
      setSession('ready');
      return;
    }
    void adminApi<{ user: { email: string } }>('session').then(result => {
      if (!current) return;
      setUser(result.user.email);
      setSession('ready');
    }).catch((error: Error & { status?: number }) => {
      if (!current) return;
      setSession(error.status === 401 || error.status === 403 ? 'ready' : 'unavailable');
    });
    return () => { current = false; };
  }, [sessionAttempt]);

  useEffect(() => {
    function onHistoryChange() {
      selectPage(adminPageAt(window.location.pathname));
    }
    window.addEventListener('popstate', onHistoryChange);
    return () => window.removeEventListener('popstate', onHistoryChange);
  }, []);

  // Toast timer
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Load snapshot data
  async function loadData() {
    const sequence = ++loadSequence.current;
    setBusy(true);
    try {
      const result = await adminApi<Snapshot>(
        'snapshot',
        undefined,
        `&search=${encodeURIComponent(search)}&stage=${stage}&page=${pageIndex}`
      );
      if (sequence === loadSequence.current) {
        setData(result);
        setError('');
      }
    } catch (e) {
      if (sequence !== loadSequence.current) return;
      if ((e as Error & { status?: number }).status === 401) {
        setUser(null);
        setData(emptySnapshot);
      } else {
        setError((e as Error).message);
      }
    } finally {
      if (sequence === loadSequence.current) setBusy(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => void loadData(), 200);
    return () => clearTimeout(timer);
  }, [user, search, stage, pageIndex]);

  function selectPage(next: AdminPage) {
    setPage(next);
    setSearch('');
    setStage('');
    setPageIndex(0);
  }

  function navigate(next: AdminPage) {
    const href = adminHref(next);
    if (window.location.pathname !== href) window.history.pushState(null, '', href);
    selectPage(next);
  }

  async function handleLogout() {
    try {
      await adminApi('logout', {});
      ++loadSequence.current;
      setUser(null);
      setData(emptySnapshot);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (session !== 'ready') {
    return (
      <main className="min-h-screen bg-[#f5f5f9] p-8 text-sm text-slate-700" data-i18n-managed>
        {session === 'checking' ? <p role="status">{t('Loading…')}</p> : (
          <div role="alert" className="space-y-3">
            <p>{t('Authentication is temporarily unavailable. Please try again shortly.')}</p>
            <button type="button" className="font-semibold underline" onClick={() => {
              setSession('checking');
              setSessionAttempt(attempt => attempt + 1);
            }}>{t('Try again')}</button>
          </div>
        )}
      </main>
    );
  }

  // Unauthenticated login view
  if (!user) {
    return (
      <LoginPage
        onLogin={(email) => {
          setUser(email);
          setError('');
        }}
      />
    );
  }

  return (
    <AdminShell
      currentPage={page}
      onNavigate={navigate}
      userEmail={user}
      onLogout={handleLogout}
      newLeadsCount={data.summary.new}
    >
      {/* Toast Notification Pill */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-3 border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{t(toast)}</span>
          <button
            onClick={() => setToast('')}
            aria-label={t("Dismiss notification")} className="text-slate-400 hover:text-white ml-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {error && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"><span>{errorText(error)}</span><button type="button" onClick={() => void loadData()} className="font-semibold underline"> {t("Try again")} </button></div>}
      {busy && <p role="status" className="mb-3 text-sm text-slate-600"> {t("Updating business records…")} </p>}
      <Suspense fallback={<p role="status" className="p-6 text-sm text-slate-600">{t("Loading…")}</p>}>
      {/* Dynamic Page Router */}
      {page === 'Overview' && (
        <OverviewPage
          data={data}
          onNavigate={navigate}
          onSelectLead={(lead) => {
            navigate('Leads');
            setSearch(lead.company_name);
          }}
          onFilterStage={(st) => {
            navigate('Leads');
            setStage(st);
          }}
        />
      )}

      {page === 'Leads' && (
        <LeadsPage
          leads={data.leads}
          totalCount={data.total}
          search={search}
          onSearchChange={setSearch}
          stage={stage}
          onStageChange={setStage}
          pageIndex={pageIndex}
          onPageChange={setPageIndex}
          isLoading={busy}
          onRefresh={loadData}
          onToast={setToast}
        />
      )}

      {page === 'Maps' && <MapsPage onImported={result => { navigate('Prospects'); setToast(t('Imported {{count}} prospects; {{duplicates}} duplicates skipped.', { count: result.inserted, duplicates: result.duplicates })); }} />}

      {page === 'Prospects' && <ProspectsPage onToast={setToast} />}

      {page === 'Website' && <WebsitePage onToast={setToast} />}

      {page === 'Analytics' && <AnalyticsPage data={data} />}

      {page === 'Deliveries' && (
        <DeliveriesPage data={data} onRefresh={loadData} onToast={setToast} />
      )}

      {page === 'Activity' && <ActivityPage data={data} />}

      {page === 'Settings' && (
        <SettingsPage
          userEmail={user}
          data={data}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      )}
      </Suspense>
    </AdminShell>
  );
}

export default function AdminApp() { return <AdminLocaleProvider><AdminWorkspace /></AdminLocaleProvider>; }
