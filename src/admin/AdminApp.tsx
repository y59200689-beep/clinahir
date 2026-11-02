import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, CheckCircle2, X } from 'lucide-react';
import { adminApi, emptySnapshot, type Lead, type Snapshot } from './types';
import { AdminShell, type AdminPage } from './components/AdminShell';
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { LeadsPage } from './pages/LeadsPage';
import { ProspectsPage } from './pages/ProspectsPage';
import { WebsitePage } from './pages/WebsitePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DeliveriesPage } from './pages/DeliveriesPage';
import { ActivityPage } from './pages/ActivityPage';
import { SettingsPage } from './pages/SettingsPage';
import './admin.css';

export default function AdminApp() {
  const [user, setUser] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState<AdminPage>('Overview');
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
    document.title = 'Clinahir HQ — Clinical Operations Workspace';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.append(robots);

    void adminApi<{ user: { email: string } }>('session')
      .then((r) => setUser(r.user.email))
      .catch(() => {})
      .finally(() => setChecking(false));
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

  function navigate(next: AdminPage) {
    setPage(next);
    setSearch('');
    setStage('');
    setPageIndex(0);
  }

  async function handleLogout() {
    try {
      await adminApi('logout', {});
      setUser(null);
      setData(emptySnapshot);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  // Initial session checking screen
  if (checking) {
    return (
      <div className="min-h-screen bg-[#F6F8F7] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0A3A2A] text-white flex items-center justify-center font-bold text-lg shadow-md">
          C
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <LoaderCircle size={15} className="animate-spin text-emerald-700" />
          <span>Verifying security session…</span>
        </div>
      </div>
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
          <span>{toast}</span>
          <button
            onClick={() => setToast('')}
            className="text-slate-400 hover:text-white ml-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Dynamic Page Router */}
      {page === 'Overview' && (
        <OverviewPage
          data={data}
          onNavigate={navigate}
          onSelectLead={(lead) => {
            setSearch(lead.company_name);
            navigate('Leads');
          }}
          onFilterStage={(st) => {
            setStage(st);
            navigate('Leads');
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
    </AdminShell>
  );
}
