import {
  ShieldCheck,
  Clock,
  LogOut,
  Globe2,
  LockKeyhole,
  CheckCircle2,
  Server,
  KeyRound,
  FileCode2,
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
    { label: 'Meta WhatsApp API Credentials', ready: data.integrations.whatsappConfigured },
    { label: 'Meta WhatsApp Dispatch Service', ready: data.integrations.whatsappEnabled },
    { label: 'Cron Scheduler Authentication', ready: data.integrations.cron },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
            System Administration
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-medium">Owner Credentials & Secrets</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Workspace Settings & Infrastructure
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Verify authentication protocols, connected API health, and security boundaries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Owner Account (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Owner Authentication
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Private administrative credentials
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Authenticated Email
              </label>
              <input
                value={userEmail || 'admin@clinahir.com'}
                readOnly
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs sm:text-sm text-slate-800 focus:outline-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-800">Auth Identity Provider</div>
                <div className="text-slate-500 mt-0.5">Supabase Auth · Secure HttpOnly Cookie</div>
              </div>
              <StatusPill value="protected" />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-800">Session Lease Duration</div>
                <div className="text-slate-500 mt-0.5">Rotates automatically every 60 minutes</div>
              </div>
              <span className="font-mono font-semibold text-slate-700">1 Hour</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Password changes are executed directly via your Supabase security vault. The web frontend never transmits or caches raw passwords.
            </p>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/60 text-rose-800 font-semibold text-xs transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out of Current Session</span>
            </button>
          </div>
        </div>

        {/* Right Column: Connected Services (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Connected Integration APIs
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Live environment connectivity status
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Server size={18} />
            </div>
          </div>

          <div className="space-y-3">
            {services.map((s) => (
              <div
                key={s.label}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-slate-800">{s.label}</span>
                <StatusPill value={s.ready ? 'configured' : 'needs setup'} />
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            API keys and tokens are provisioned server-side via encrypted environment variables.
          </p>

          <button
            onClick={() => onNavigate('Website')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm"
          >
            <Globe2 size={14} />
            <span>Edit Public Contact Information</span>
          </button>
        </div>
      </div>

      {/* Operational Principles */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          System Operational Architecture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <Clock size={16} />
              <span>Nightly Reconciliation</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Cron executes at 03:00 UTC daily, sweeping failed deliveries and synchronizing unverified records.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <KeyRound size={16} />
              <span>Sovereign Storage</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Patient inquiries are locked under strict Row Level Security. Data is never shared or exported without manual owner confirmation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <FileCode2 size={16} />
              <span>Zero-Drift Deployment</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Schema migrations and serverless functions build automatically on Vercel with idempotent rollbacks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
