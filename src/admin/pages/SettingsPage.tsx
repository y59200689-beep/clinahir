import {
  LogOut,
  Globe2,
} from 'lucide-react';
import { StatusPill } from '../components/StatusPill';
import type { Snapshot } from '../types';

interface SettingsPageProps {
  userEmail: string | null;
  data: Snapshot;
  onLogout: () => void;
  onNavigate: (page: any) => void;
}

export function SettingsPage({
  userEmail,
  data,
  onLogout,
  onNavigate,
}: SettingsPageProps) {
  const services = [
    { label: 'Daily Command CRM Webhook', ready: data.integrations.dailyCommand },
    { label: 'Meta WhatsApp Credentials', ready: data.integrations.whatsappConfigured },
    { label: 'Meta WhatsApp Dispatch', ready: data.integrations.whatsappEnabled },
    { label: 'Cron Authentication', ready: data.integrations.cron },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Owner credentials, connected services, and system configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Owner Account (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              Account
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Owner authentication
            </p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Email
              </label>
              <input
                value={userEmail || 'admin@clinahir.com'}
                readOnly
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs sm:text-sm text-slate-800 focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <div className="font-medium text-slate-800">Auth Provider</div>
                <div className="text-slate-400 mt-0.5">Supabase Auth · HttpOnly session</div>
              </div>
              <StatusPill value="protected" />
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <div className="font-medium text-slate-800">Session Lease</div>
                <div className="text-slate-400 mt-0.5">Expires after 60 minutes of inactivity</div>
              </div>
              <span className="font-mono text-slate-600">1 hour</span>
            </div>

            <p className="text-[11px] text-slate-400">
              Password management is handled in your Supabase authentication console.
            </p>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 text-rose-800 font-medium text-xs transition-colors"
            >
              <LogOut size={13} />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Right Column: Connected Services (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">
              Services
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              API connectivity
            </p>
          </div>

          <div className="space-y-2">
            {services.map((s) => (
              <div
                key={s.label}
                className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <span className="font-medium text-slate-800">{s.label}</span>
                <StatusPill value={s.ready ? 'configured' : 'needs setup'} />
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400">
            Credentials and secrets are managed server-side in Vercel environment variables.
          </p>

          <button
            onClick={() => onNavigate('Website')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors shadow-sm"
          >
            <Globe2 size={13} />
            <span>Edit website contact details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
