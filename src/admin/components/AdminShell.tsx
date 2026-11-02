import { useState, useEffect, type ReactNode } from 'react';
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPage]);

  const navGroups = [
    {
      group: 'Pipeline',
      items: [
        { name: 'Overview' as AdminPage, label: 'Overview', icon: LayoutDashboard },
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
        { name: 'Settings' as AdminPage, label: 'Settings', icon: Settings2 },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col md:flex-row antialiased">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/30 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-50 md:z-30 bg-[#0A261D] text-slate-200 border-r border-[#0D382B] flex flex-col transition-all duration-200 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-emerald-900/40 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded p-1"
          >
            <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center text-[#0A261D] font-bold text-sm">
              C
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-sm text-white tracking-normal">
                Clinahir
              </span>
            )}
          </a>

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex w-7 h-7 rounded items-center justify-center text-emerald-300/60 hover:text-white hover:bg-emerald-900/50 transition-colors"
            title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden w-7 h-7 rounded flex items-center justify-center text-emerald-300/60 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.group}>
              {!sidebarCollapsed && (
                <div className="px-2 mb-1.5 text-xs font-medium text-emerald-300/50">
                  {group.group}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.name;

                  return (
                    <button
                      key={item.name}
                      onClick={() => onNavigate(item.name)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-emerald-600/90 text-white font-semibold'
                          : 'text-emerald-100/70 hover:bg-emerald-900/40 hover:text-white'
                      } ${sidebarCollapsed ? 'justify-center px-1' : ''}`}
                    >
                      <Icon
                        size={16}
                        className={isActive ? 'text-white' : 'text-emerald-300/70'}
                      />
                      {!sidebarCollapsed && (
                        <span className="flex-1 text-left truncate">
                          {item.label}
                        </span>
                      )}
                      {!sidebarCollapsed && item.badge !== undefined && (
                        <span className="px-1.5 py-0.2 text-[11px] font-mono font-bold rounded bg-emerald-400 text-[#0A261D]">
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

        {/* User Card (Pinned Bottom) */}
        <div className="p-3 border-t border-emerald-900/40 bg-[#071F17]">
          <div
            className={`flex items-center gap-2.5 p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/50 ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-7 h-7 rounded bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
              YM
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-medium text-white truncate">
                  Director
                </div>
                <div className="text-[11px] text-emerald-300/50 truncate font-mono">
                  {userEmail || 'admin@clinahir.com'}
                </div>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={onLogout}
                className="w-6 h-6 rounded flex items-center justify-center text-emerald-400/60 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-14 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-8 h-8 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
            >
              <Menu size={16} />
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span className="text-slate-400">Workspace</span>
              <ChevronRight size={13} className="text-slate-300" />
              <span className="text-slate-800 font-semibold">
                {currentPage === 'Overview'
                  ? 'Overview'
                  : currentPage === 'Leads'
                  ? 'Inbound Leads'
                  : currentPage === 'Prospects'
                  ? 'Prospects'
                  : currentPage === 'Website'
                  ? 'Website'
                  : currentPage === 'Analytics'
                  ? 'Analytics'
                  : currentPage === 'Deliveries'
                  ? 'Deliveries'
                  : currentPage === 'Activity'
                  ? 'Activity'
                  : 'Settings'}
              </span>
            </div>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-50 border border-slate-200/60 text-slate-600 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Operational</span>
            </div>

            {/* Direct Link to Live Site */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1"
            >
              <span>Live site</span>
              <ExternalLink size={12} />
            </a>

            {/* Fast Sign Out on Mobile */}
            <button
              onClick={onLogout}
              className="md:hidden w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-rose-600"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/60 px-4 sm:px-8 py-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Clinahir Workspace</span>
          <span className="font-mono">© {new Date().getFullYear()}</span>
        </footer>
      </div>
    </div>
  );
}
