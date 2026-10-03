import AnimatedMetricValue from './AnimatedMetricValue';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Activity, CalendarCheck2, CheckCircle2, Clock3, History, Plus, Search, ShieldCheck, UserRound, Users, X } from 'lucide-react';
import { type AppointmentDay } from './AppointmentsPage';
import { buildTeamStats, formatDuration, readDemoAppointments, TEAM_MEMBERS, type TeamStat } from './teamActivity';

type Language = 'en' | 'fr';
type DemoMember = { name: string; role: 'administrator' | 'staff' };

const copy = {
  en: {
    title: 'Staff', subtitle: 'Team accounts and appointment activity for the selected period.', total: 'Total staff', active: 'Active accounts', administrators: 'Administrators', recent: 'Active (7 days)',
    search: 'Search team members...', activityLog: 'Activity Log', new: 'New account', createTitle: 'Add a demo member', createHint: 'This adds a local demo profile with no appointment activity.', create: 'Add member', cancel: 'Cancel', close: 'Close',
    administrator: 'Administrator', staff: 'Staff member', appointments: 'Appointments', patients: 'Patients', messages: 'Messages', agenda: 'Agenda', settings: 'Settings',
    share: 'Share confirmed', handled: 'Handled', response: 'Avg. response', confirmations: 'confirmations', lastActivity: 'Last activity', noActivity: 'No activity yet', status: 'Active', viewActivity: 'View activity', empty: 'No team members match this search.', demo: 'Demo team data',
  },
  fr: {
    title: 'Personnel', subtitle: 'Comptes de l’équipe et activité des rendez-vous sur la période sélectionnée.', total: 'Personnel total', active: 'Comptes actifs', administrators: 'Administrateurs', recent: 'Actifs (7 j)',
    search: 'Rechercher un membre...', activityLog: "Journal d’activité", new: 'Nouveau compte', createTitle: 'Ajouter un membre de démonstration', createHint: 'Un profil local sera créé sans activité de rendez-vous.', create: 'Ajouter', cancel: 'Annuler', close: 'Fermer',
    administrator: 'Administrateur', staff: 'Membre du personnel', appointments: 'Rendez-vous', patients: 'Patients', messages: 'Messages', agenda: 'Agenda', settings: 'Paramètres',
    share: 'Part confirmée', handled: 'Pris en charge', response: 'Délai moyen', confirmations: 'confirmations', lastActivity: 'Dernière activité', noActivity: 'Aucune activité', status: 'Actif', viewActivity: 'Voir l’activité', empty: 'Aucun membre ne correspond à cette recherche.', demo: 'Données de démonstration',
  },
};

const roles: Record<string, DemoMember['role']> = { 'Member 01': 'administrator', 'Member 02': 'staff', 'Member 03': 'staff', 'Member 04': 'staff' };

export default function StaffPage({ language, appointmentDays, rangeStart, rangeEnd, dateControl, onViewActivity }: { language: Language; appointmentDays: AppointmentDay[]; rangeStart: string; rangeEnd: string; dateControl: ReactNode; onViewActivity: () => void }) {
  const t = copy[language];
  const [appointments] = useState(() => readDemoAppointments(appointmentDays));
  const [addedMembers, setAddedMembers] = useState<DemoMember[]>([]);
  const [search, setSearch] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [newRole, setNewRole] = useState<DemoMember['role']>('staff');
  useEffect(() => {
    if (!newOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNewOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [newOpen]);
  const historicalCount = appointmentDays.reduce((sum, day) => sum + day.count, 0);
  const selected = useMemo(() => appointments.filter((item) => item.date >= rangeStart && item.date <= rangeEnd), [appointments, rangeStart, rangeEnd]);
  const activityStats = useMemo(() => buildTeamStats(selected, historicalCount), [selected, historicalCount]);
  const stats = useMemo(() => [...activityStats, ...addedMembers.map((member): TeamStat => ({ name: member.name, actions: 0, confirmed: 0, share: 0, averageMinutes: null, lastActivityAt: null }))], [activityStats, addedMembers]);
  const members = useMemo(() => stats.filter((member) => member.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())), [stats, search]);
  const recentStats = useMemo(() => buildTeamStats(appointments.filter((item) => item.date >= '2026-09-23' && item.date <= '2026-09-29'), historicalCount), [appointments, historicalCount]);
  const recentCount = recentStats.filter((member) => member.actions > 0).length;
  const locale = language === 'fr' ? 'fr-FR' : 'en-US';
  const dateFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const cards = [
    { label: t.total, value: stats.length, icon: Users, tone: 'text-cyan-200', surface: 'bg-cyan-400/10', stripe: 'bg-cyan-300/70' },
    { label: t.active, value: stats.length, icon: CheckCircle2, tone: 'text-emerald-200', surface: 'bg-emerald-400/10', stripe: 'bg-emerald-300/70' },
    { label: t.administrators, value: stats.filter((member) => (roles[member.name] ?? addedMembers.find((item) => item.name === member.name)?.role) === 'administrator').length, icon: ShieldCheck, tone: 'text-violet-200', surface: 'bg-violet-400/10', stripe: 'bg-violet-300/70' },
    { label: t.recent, value: recentCount, icon: Clock3, tone: 'text-amber-200', surface: 'bg-amber-400/10', stripe: 'bg-amber-300/70' },
  ];

  function addDemoMember() {
    const nextNumber = TEAM_MEMBERS.length + addedMembers.length + 1;
    setAddedMembers((current) => [...current, { name: `Member ${String(nextNumber).padStart(2, '0')}`, role: newRole }]);
    setNewRole('staff');
    setNewOpen(false);
  }

  return <div className="min-w-0 space-y-5 text-left text-white/90">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold">{t.title}</h1><p className="mt-1 text-sm text-white/55">{t.subtitle}</p></div><div className="relative z-30">{dateControl}</div></div>
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{cards.map((card) => <div key={card.label} className="relative flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/5 backdrop-blur-xl"><span className={`absolute inset-y-0 left-0 w-0.5 ${card.stripe}`} /><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.surface} ${card.tone}`}><card.icon size={22} /></span><div className="min-w-0"><p className="text-2xl font-bold leading-none"><AnimatedMetricValue value={card.value} /></p><p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/55">{card.label}</p></div></div>)}</div>

    <div className="flex flex-wrap items-center gap-2"><label className="relative min-w-[210px] flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/45 outline-none backdrop-blur-xl focus:border-cyan-200/50" /></label><button type="button" onClick={onViewActivity} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-white/80 backdrop-blur-xl transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"><History size={16} />{t.activityLog}</button><button type="button" onClick={() => setNewOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-cyan-200/25 bg-cyan-400/20 px-3.5 py-2.5 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"><Plus size={17} />{t.new}</button></div>

    {members.length ? <div className="grid gap-4 md:grid-cols-2">{members.map((member, index) => {
      const role = roles[member.name] ?? addedMembers.find((item) => item.name === member.name)?.role ?? 'staff';
      const permissions = role === 'administrator' ? [t.appointments, t.agenda, t.patients, t.messages, t.settings] : [t.appointments, t.agenda, t.patients, t.messages];
      return <article key={member.name} className="relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/5 backdrop-blur-xl"><span className={`absolute inset-x-0 top-0 h-0.5 ${['bg-cyan-300/75', 'bg-amber-300/75', 'bg-violet-300/75', 'bg-rose-300/75'][index % 4]}`} /><div className="flex min-w-0 items-center gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-200/20 bg-cyan-300/15 text-lg font-bold text-cyan-100">{member.name.slice(-2)}</span><div className="min-w-0 flex-1"><h2 className="truncate text-base font-semibold text-white">{member.name}</h2><p className="mt-0.5 text-xs text-white/50">{member.confirmed.toLocaleString(locale)} {t.confirmations}</p></div><span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-semibold ${role === 'administrator' ? 'bg-violet-300/15 text-violet-100' : 'bg-cyan-300/15 text-cyan-100'}`}>{t[role]}</span></div>
      <div className="mt-4 flex flex-wrap gap-1.5">{permissions.map((permission) => <span key={permission} className="rounded-md border border-cyan-200/15 bg-cyan-300/[0.07] px-2 py-1 text-[10px] font-medium text-cyan-100/75">{permission}</span>)}</div>
      <div className="mt-5 grid grid-cols-3 gap-2">{[
        { label: t.share, value: `${member.share}%`, icon: CheckCircle2, tone: 'border-amber-300/20 bg-amber-400/10 text-amber-100' },
        { label: t.handled, value: member.actions.toLocaleString(locale), icon: Users, tone: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100' },
        { label: t.response, value: formatDuration(member.averageMinutes), icon: Clock3, tone: 'border-sky-300/20 bg-sky-400/10 text-sky-100' },
      ].map(({ label, value, icon: Icon, tone }) => <div key={label} className={`min-w-0 rounded-xl border ${tone} px-2 py-3 text-center`}><Icon size={16} className="mx-auto" /><p className="mt-2 truncate text-lg font-bold" title={value}><AnimatedMetricValue value={value} locale={locale} /></p><p className="mt-1 text-[9px] font-semibold uppercase tracking-wider leading-tight opacity-75">{label}</p></div>)}</div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs"><span className="inline-flex items-center gap-1.5 text-white/60"><Activity size={14} className="text-cyan-200" />{t.lastActivity}: {member.lastActivityAt ? dateFormat.format(new Date(member.lastActivityAt)) : t.noActivity}</span><span className="inline-flex items-center gap-1.5 text-emerald-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />{t.status}</span></div>
      <button type="button" onClick={onViewActivity} className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-100/80 hover:text-cyan-50 focus-visible:outline-none focus-visible:underline"><History size={14} />{t.viewActivity}</button>
      </article>;
    })}</div> : <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center text-sm text-white/55 backdrop-blur-xl"><UserRound className="mx-auto mb-3" size={30} />{t.empty}</div>}
    <p className="text-xs text-white/40">{t.demo}</p>

    {newOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setNewOpen(false); }}><div role="dialog" aria-modal="true" aria-label={t.createTitle} className="w-full max-w-sm space-y-4 rounded-2xl border border-white/20 bg-[#1c3029]/95 p-6 text-white shadow-2xl backdrop-blur-2xl"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{t.createTitle}</h2><button type="button" onClick={() => setNewOpen(false)} aria-label={t.close} className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white"><X size={20} /></button></div><p className="text-sm text-white/55">{t.createHint}</p><div className="grid grid-cols-2 gap-2">{(['staff', 'administrator'] as const).map((role) => <button key={role} type="button" aria-pressed={newRole === role} onClick={() => setNewRole(role)} className={`rounded-xl border px-3 py-3 text-sm font-medium ${newRole === role ? 'border-cyan-200/40 bg-cyan-300/20 text-white' : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'}`}>{t[role]}</button>)}</div><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setNewOpen(false)} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">{t.cancel}</button><button type="button" onClick={addDemoMember} className="rounded-xl border border-cyan-200/25 bg-cyan-400/25 px-3 py-2 text-sm font-semibold hover:bg-cyan-400/35">{t.create}</button></div></div></div>}
  </div>;
}
