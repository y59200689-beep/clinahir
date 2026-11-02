import { useState, type FormEvent } from 'react';
import {
  Users,
  Search,
  X,
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Mail,
  Phone,
  Building2,
  Calendar,
  Save,
  LoaderCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { StatusPill } from '../components/StatusPill';
import { AdminDrawer } from '../components/AdminDrawer';
import { adminApi, type Lead } from '../types';
import { leadsCsv } from '../csv';

interface LeadsPageProps {
  leads: Lead[];
  totalCount: number;
  search: string;
  onSearchChange: (search: string) => void;
  stage: string;
  onStageChange: (stage: string) => void;
  pageIndex: number;
  onPageChange: (fn: (prev: number) => number) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onToast: (msg: string) => void;
}

export function LeadsPage({
  leads,
  totalCount,
  search,
  onSearchChange,
  stage,
  onStageChange,
  pageIndex,
  onPageChange,
  isLoading,
  onRefresh,
  onToast,
}: LeadsPageProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editStage, setEditStage] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const stagesList = ['all', 'new', 'contacted', 'qualified', 'won', 'lost'];

  const number = (n: number) => new Intl.NumberFormat('en').format(n);
  const formatDate = (s: string | null) =>
    s ? new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const formatTime = (s: string) =>
    new Date(s).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  function openLeadDrawer(lead: Lead) {
    setSelectedLead(lead);
    setEditStage(lead.admin_stage);
    setEditNotes(lead.admin_notes || '');
    setSaveError('');
  }

  async function handleSaveLead(e: FormEvent) {
    e.preventDefault();
    if (!selectedLead) return;

    setIsSaving(true);
    setSaveError('');
    try {
      await adminApi('lead', {
        id: selectedLead.external_id,
        stage: editStage,
        notes: editNotes,
      });
      onToast('Lead updated successfully.');
      onRefresh();
      setSelectedLead(null);
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleExportCsv() {
    const csv = leadsCsv(leads);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinahir-leads-page-${pageIndex + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('Current page leads exported. Data kept sovereign.');
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
              Pipeline Management
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">
              {number(totalCount)} total inquiries
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Inbound Leads Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Capture, qualify, and convert medical center inquiries submitted via public channels.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={!leads.length}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          <ArrowDownToLine size={15} />
          <span>Export Page CSV</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
        {/* Toolbar: Filter Tabs + Search (inspired by Confidency OS & Grand Prix Hotel) */}
        <div className="p-4 sm:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {stagesList.map((st) => {
              const isActive = (stage === '' && st === 'all') || stage === st;
              return (
                <button
                  key={st}
                  onClick={() => {
                    onStageChange(st === 'all' ? '' : st);
                    onPageChange(() => 0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all capitalize ${
                    isActive
                      ? 'bg-[#0A3A2A] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {st === 'all' ? 'All Inquiries' : st}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => {
                onSearchChange(e.target.value);
                onPageChange(() => 0);
              }}
              placeholder="Search by clinic name, doctor, phone or email…"
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        {leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="py-3.5 px-6">Clinic / Organization</th>
                  <th className="py-3.5 px-4">Contact Person</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4">Origin / Campaign</th>
                  <th className="py-3.5 px-6 text-right">Received Date</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {leads.map((lead, idx) => (
                  <tr
                    key={lead.external_id}
                    onClick={() => openLeadDrawer(lead)}
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
                          {lead.company_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors">
                            {lead.company_name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {lead.city}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-800 text-xs">
                        {lead.contact_name || 'Not provided'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {lead.phone || lead.email || '—'}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <StatusPill value={lead.admin_stage} />
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {lead.utm_source || 'Direct Website'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right font-mono">
                      <div className="text-xs font-semibold text-slate-700">
                        {formatDate(lead.submitted_at)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatTime(lead.submitted_at)}
                      </div>
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
            <Users size={36} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-semibold text-slate-700">No leads found</h4>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search terms or clearing the current stage filter.
            </p>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Showing {leads.length ? number(pageIndex * 25 + 1) : 0}–
            {number(Math.min((pageIndex + 1) * 25, totalCount))} of {number(totalCount)} records
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange((n) => Math.max(0, n - 1))}
              disabled={pageIndex === 0 || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-mono font-semibold text-slate-700">
              Page {pageIndex + 1}
            </span>
            <button
              onClick={() => onPageChange((n) => n + 1)}
              disabled={(pageIndex + 1) * 25 >= totalCount || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer for Lead Detail & Editing */}
      <AdminDrawer
        title="Inquiry Dossier"
        subtitle={selectedLead ? `Reference: ${selectedLead.external_id}` : undefined}
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
      >
        {selectedLead && (
          <div className="space-y-6">
            {/* Header Profile Tile */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0A3A2A] text-white font-bold text-base flex items-center justify-center shrink-0">
                {selectedLead.company_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedLead.company_name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedLead.city} · Submitted {formatDate(selectedLead.submitted_at)}
                </p>
              </div>
            </div>

            {/* Quick Contact Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Contact Person
                </span>
                <span className="font-semibold text-slate-800">
                  {selectedLead.contact_name || 'Not provided'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  WhatsApp / Phone
                </span>
                <span className="font-semibold text-slate-800 font-mono">
                  {selectedLead.phone || 'Not provided'}
                </span>
              </div>

              {selectedLead.email && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="font-semibold text-emerald-800 hover:underline font-mono"
                  >
                    {selectedLead.email}
                  </a>
                </div>
              )}

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  CRM Sync Status
                </span>
                <StatusPill value={selectedLead.daily_command_status} />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Attribution Source
                </span>
                <span className="font-semibold text-slate-700 font-mono">
                  {selectedLead.utm_source || 'Direct'}
                </span>
              </div>
            </div>

            {/* Message / Priority Request */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                Consultation Message / Priority
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedLead.message || selectedLead.priority || 'No written message attached.'}
              </p>
            </div>

            {/* Action Form */}
            <form onSubmit={handleSaveLead} className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Pipeline Stage
                </label>
                <select
                  value={editStage}
                  onChange={(e) => setEditStage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                >
                  {['new', 'contacted', 'qualified', 'won', 'lost'].map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Internal Clinic Notes
                </label>
                <textarea
                  rows={4}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record call summary, clinical fit notes, or consultation follow-up dates…"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none placeholder:text-slate-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Private to Clinahir HQ. Never visible to patients.
                </p>
              </div>

              {saveError && (
                <p className="text-xs text-rose-600 font-medium">{saveError}</p>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#0A3A2A] hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSaving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}
