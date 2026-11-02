import { useState, type FormEvent } from 'react';
import {
  Users,
  Search,
  X,
  ArrowDownToLine,
  ChevronLeft,
  ChevronRight,
  Save,
  LoaderCircle,
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
      onToast('Lead updated.');
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
    onToast('Page exported to CSV.');
  }

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inbound Leads
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {number(totalCount)} requests captured through the public website.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={!leads.length}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          <ArrowDownToLine size={14} />
          <span>Export page</span>
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Stage Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            {stagesList.map((st) => {
              const isActive = (stage === '' && st === 'all') || stage === st;
              return (
                <button
                  key={st}
                  onClick={() => {
                    onStageChange(st === 'all' ? '' : st);
                    onPageChange(() => 0);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-colors ${
                    isActive
                      ? 'bg-[#0A261D] text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st === 'all' ? 'All' : st}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => {
                onSearchChange(e.target.value);
                onPageChange(() => 0);
              }}
              placeholder="Filter leads…"
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition-colors"
            />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        {leads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/60 text-xs font-medium text-slate-500 border-b border-slate-100">
                  <th className="py-2.5 px-5">Clinic</th>
                  <th className="py-2.5 px-4">Contact person</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-5 text-right">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr
                    key={lead.external_id}
                    onClick={() => openLeadDrawer(lead)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-xs font-semibold shrink-0">
                          {lead.company_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 text-xs sm:text-sm group-hover:text-emerald-800 transition-colors">
                            {lead.company_name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {lead.city}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 text-xs">
                        {lead.contact_name || '—'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {lead.phone || lead.email || '—'}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <StatusPill value={lead.admin_stage} />
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-xs font-mono text-slate-600">
                        {lead.utm_source || 'Direct'}
                      </span>
                    </td>

                    <td className="py-3 px-5 text-right font-mono">
                      <div className="text-xs text-slate-700">
                        {formatDate(lead.submitted_at)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatTime(lead.submitted_at)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Users size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-700">No matching leads</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Try adjusting your search or clearing the stage filter.
            </p>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-3.5 px-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            {leads.length ? number(pageIndex * 25 + 1) : 0}–
            {number(Math.min((pageIndex + 1) * 25, totalCount))} of {number(totalCount)}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange((n) => Math.max(0, n - 1))}
              disabled={pageIndex === 0 || isLoading}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-2 font-mono text-slate-600">
              Page {pageIndex + 1}
            </span>
            <button
              onClick={() => onPageChange((n) => n + 1)}
              disabled={(pageIndex + 1) * 25 >= totalCount || isLoading}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer for Lead Detail */}
      <AdminDrawer
        title="Lead Record"
        subtitle={selectedLead ? `Reference: ${selectedLead.external_id}` : undefined}
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
      >
        {selectedLead && (
          <div className="space-y-5">
            {/* Header Profile */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#0A261D] text-white font-mono font-semibold text-sm flex items-center justify-center shrink-0">
                {selectedLead.company_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">{selectedLead.company_name}</h3>
                <p className="text-xs text-slate-500">
                  {selectedLead.city} · Received {formatDate(selectedLead.submitted_at)}
                </p>
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-0.5">Contact</span>
                <span className="font-medium text-slate-800">{selectedLead.contact_name || 'Not provided'}</span>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-0.5">Phone</span>
                <span className="font-mono text-slate-800">{selectedLead.phone || '—'}</span>
              </div>

              {selectedLead.email && (
                <div className="p-3 rounded bg-slate-50 border border-slate-100 col-span-2">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Email</span>
                  <a href={`mailto:${selectedLead.email}`} className="font-mono text-emerald-800 hover:underline">
                    {selectedLead.email}
                  </a>
                </div>
              )}

              <div className="p-3 rounded bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-0.5">Sync status</span>
                <StatusPill value={selectedLead.daily_command_status} />
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-0.5">Channel</span>
                <span className="font-mono text-slate-700">{selectedLead.utm_source || 'Direct'}</span>
              </div>
            </div>

            {/* Consultation Note */}
            <div className="p-3.5 rounded bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-medium text-slate-500 block mb-1">Inquiry note</span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedLead.message || selectedLead.priority || 'No written context attached.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveLead} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Pipeline stage
                </label>
                <select
                  value={editStage}
                  onChange={(e) => setEditStage(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                >
                  {['new', 'contacted', 'qualified', 'won', 'lost'].map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Private notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add internal notes…"
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              {saveError && (
                <p className="text-xs text-rose-600 font-medium">{saveError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-[#0A261D] hover:bg-emerald-900 text-white font-medium text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Save changes</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}
