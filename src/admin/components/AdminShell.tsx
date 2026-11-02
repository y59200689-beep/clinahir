import { useState, useRef, useEffect, type ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Globe2,
  BarChart3,
  Send,
  Activity,
  Settings2,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Search,
  Sparkles,
  Command,
} from 'lucide-react';

export type AdminPage =
  | 'Overview'
  | 'Leads'
  | 'Prospects'
  | 'Website'
  | 'Analytics'
  | 'Deliveries'
  | 'Activity'
  | 'Settings';

interface AdminShellProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  userEmail: string | null;
  onLogout: () => void;
  newLeadsCount?: number;
  children: ReactNode;
}

export function AdminShell({
  currentPage,
  onNavigate,
  userEmail,
  onLogout,
  newLeadsCount = 0,
  children,
}: AdminShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPage]);

  const navGroups = [
    {
      group: 'Pipeline',
      items: [
        { name: 'Overview' as AdminPage, label: 'Dashboard', icon: LayoutDashboard },
        { name: 'Leads' as AdminPage, label: 'Inbound Leads', icon: Users, badge: newLeadsCount > 0 ? newLeadsCount : undefined },
        { name: 'Prospects' as AdminPage, label: 'Prospect Directory', icon: Building2 },
      ],
    },
    {
      group: 'Experience',
      items: [
        { name: 'Website' as AdminPage, label: 'Website Content', icon: Globe2 },
        { name: 'Analytics' as AdminPage, label: 'Conversion Insights', icon: BarChart3 },
      ],
    },
    {
      group: 'Administration',
      items: [
        { name: 'Deliveries' as AdminPage, label: 'Delivery Center', icon: Send },
        { name: 'Activity' as AdminPage, label: 'Audit Activity', icon: Activity },
        { name: 'Settings' as AdminPage, label: 'Workspace Settings', icon: Settings2 },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-slate-900 font-sans flex flex-col md:flex-row antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-50 md:z-30 bg-[#0A261D] text-slate-200 border-r border-[#0D382B] flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-5 py-4 border-b border-emerald-900/60 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-[#0A261D] font-bold text-lg shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              C
            </div>
            {!sidebarCollapsed && (
              <div className="leading-tight">
                <span className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                  Clinahir
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">
                    HQ
                  </span>
                </span>
                <span className="text-xs text-emerald-300/60 font-medium block">
                  Clinical Workspace
                </span>
              </div>
            )}
          </a>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex w-7 h-7 rounded-lg items-center justify-center text-emerald-300/60 hover:text-white hover:bg-emerald-900/60 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center text-emerald-300/60 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {navGroups.map((group) => (
            <div key={group.group}>
              {!sidebarCollapsed && (
                <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-400/50">
                  {group.group}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.name;

                  return (
                    <button
                      key={item.name}
                      onClick={() => onNavigate(item.name)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 relative ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                          : 'text-emerald-100/70 hover:bg-emerald-900/50 hover:text-white'
                      } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                    >
                      <Icon
                        size={19}
                        className={isActive ? 'text-white' : 'text-emerald-300/70'}
                      />
                      {!sidebarCollapsed && (
                        <span className="flex-1 text-left tracking-tight truncate">
                          {item.label}
                        </span>
                      )}
                      {!sidebarCollapsed && item.badge !== undefined && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-400 text-[#0A261D]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile Card (Pinned Bottom) */}
        <div className="p-3 border-t border-emerald-900/60 bg-[#071F17]">
          <div
            className={`flex items-center gap-3 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-900/70 ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
              YM
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  Director Workspace
                </div>
                <div className="text-[11px] text-emerald-300/60 truncate font-mono">
                  {userEmail || 'admin@clinahir.com'}
                </div>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={onLogout}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-400/60 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
            >
              <Menu size={18} />
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
              <span className="text-slate-400">Workspace</span>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-slate-900 font-bold tracking-tight">
                {currentPage === 'Overview'
                  ? 'Executive Overview'
                  : currentPage === 'Leads'
                  ? 'Inbound Leads'
                  : currentPage === 'Prospects'
                  ? 'Prospect Directory'
                  : currentPage === 'Website'
                  ? 'Website Content CMS'
                  : currentPage === 'Analytics'
                  ? 'Conversion Analytics'
                  : currentPage === 'Deliveries'
                  ? 'Integrations & Outbox'
                  : currentPage === 'Activity'
                  ? 'Security & Audit Log'
                  : 'Workspace Settings'}
              </span>
            </div>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* System Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Systems Online</span>
            </div>

            {/* External Website Preview Button */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/80 text-slate-700 hover:text-emerald-800 hover:border-emerald-200 hover:bg-emerald-50/50 text-xs font-semibold transition-colors"
            >
              <span>Live Site</span>
              <ExternalLink size={13} />
            </a>

            {/* Fast Sign Out on Mobile */}
            <button
              onClick={onLogout}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-600"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Executive Footer */}
        <footer className="border-t border-slate-200/60 bg-white/50 px-4 sm:px-8 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Clinahir Platform</span>
            <span>·</span>
            <span>Medical-grade operations</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck size={14} className="text-emerald-600" />
              Private Owner Workspace
            </span>
            <span>·</span>
            <span className="font-mono">© {new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
