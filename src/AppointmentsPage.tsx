import { actingMember } from './demo/profiles';
import { hasConflict } from './demo/conflicts';
import AnimatedMetricValue from './AnimatedMetricValue';
import { useEffect, useMemo, useState, type DragEvent, type FormEvent, type ReactNode } from 'react';
import { CalendarDays, CalendarX, CheckCircle2, Clock3, GripVertical, List, Phone, Search, Stethoscope, UserPlus, X } from 'lucide-react';

export { makeInitialAppointments, demoConfirmer } from './demo/appointments';
export type { Appointment, AppointmentDay } from './demo/appointments';
import { doctors, services, type Status, type Appointment, type AppointmentDay } from './demo/appointments';
import { useDemo } from './demo/DemoProvider';
import AppointmentEditor from './demo/LazyAppointmentEditor';
const today = '2026-09-29';
const frenchServices: Record<string, string> = { Ultrasound: 'Échographie', MRI: 'IRM', Radiography: 'Radiographie', 'CT scan': 'Scanner', Mammography: 'Mammographie' };

const copy = {
  en: {
    title: 'Appointments', total: 'Total appointments', pending: 'Pending', confirmed: 'Confirmed', cancelled: 'Cancelled', expired: 'Expired', noAnswer: 'No answer', upcoming: 'Upcoming',
    search: 'Search by name, phone, service or doctor...', allDates: 'All dates', today: 'Today', month: 'This month', period: 'Period',
    list: 'List', agenda: 'Agenda', new: 'New Appointment', all: 'All', patient: 'Patient', phone: 'Phone', date: 'Date', time: 'Time', service: 'Service', doctor: 'Doctor', status: 'Status',
    empty: 'No appointments match these filters.', start: 'Start date (YYYY-MM-DD)', end: 'End date (YYYY-MM-DD)', apply: 'Apply', close: 'Close', save: 'Save appointment',
  },
  fr: {
    title: 'Rendez-vous', total: 'Total rendez-vous', pending: 'En attente', confirmed: 'Confirmés', cancelled: 'Annulés', expired: 'Expirés', noAnswer: 'Pas de réponse', upcoming: 'À venir',
    search: 'Rechercher par nom, téléphone, service ou médecin...', allDates: 'Toutes les dates', today: "Aujourd’hui", month: 'Ce mois', period: 'Période',
    list: 'Liste', agenda: 'Agenda', new: 'Nouveau RDV', all: 'Tous', patient: 'Patient', phone: 'Téléphone', date: 'Date', time: 'Heure', service: 'Service', doctor: 'Médecin', status: 'Statut',
    empty: 'Aucun rendez-vous ne correspond à ces filtres.', start: 'Date de début (AAAA-MM-JJ)', end: 'Date de fin (AAAA-MM-JJ)', apply: 'Appliquer', close: 'Fermer', save: 'Enregistrer le rendez-vous',
  },
};

function formatDate(value: string, language: 'en' | 'fr') {
  return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

function formatShortDate(value: string, language: 'en' | 'fr') {
  return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short' }).format(new Date(`${value}T12:00:00`));
}

function maskPatient(name: string) {
  return `${name.trim().slice(0, 2).toLocaleUpperCase()}*****`;
}

const maskedDoctor = 'Dr.***';
const maskedPhone = '**********';

export default function AppointmentsPage({ language, dateRange, rangeStart, rangeEnd, appointmentDays, dateControl, onResetDate }: { language: 'en' | 'fr'; dateRange: string; rangeStart: string; rangeEnd: string; appointmentDays: AppointmentDay[]; dateControl: ReactNode; onResetDate: () => void }) {
  const t = copy[language];
  const { appointments, setAppointments, doctors, patients, staff } = useDemo();
  const [feedback, setFeedback] = useState<{error:boolean;message:string}|null>(null);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all' | 'upcoming'>('all');
  const [view, setView] = useState<'list' | 'agenda'>('list');
  const [newOpen, setNewOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dropStatus, setDropStatus] = useState<Status | null>(null);



  useEffect(() => setPage(0), [search, statusFilter, rangeStart, rangeEnd]);
  const visibleAppointments = appointments;
  const dateAppointments = useMemo(() => visibleAppointments.filter((item) => item.date >= rangeStart && item.date <= rangeEnd), [visibleAppointments, rangeStart, rangeEnd]);
  const counts = useMemo(() => ({
    total: dateAppointments.length,
    pending: dateAppointments.filter((item) => item.status === 'pending').length,
    confirmed: dateAppointments.filter((item) => item.status === 'confirmed').length,
    cancelled: dateAppointments.filter((item) => item.status === 'cancelled').length,
    expired: dateAppointments.filter((item) => item.status === 'expired').length,
    noAnswer: dateAppointments.filter((item) => item.status === 'no-answer').length,
    upcoming: visibleAppointments.filter((item) => ['pending', 'confirmed'].includes(item.status) && item.date > today).length,
  }), [dateAppointments, visibleAppointments]);

  const filtered = useMemo(() => (statusFilter === 'upcoming' ? visibleAppointments : dateAppointments).filter((item) => {
    const query = search.trim().toLocaleLowerCase();
    const matchesSearch = !query || [item.patient, item.phone, item.service, frenchServices[item.service], item.doctor].some((value) => value.toLocaleLowerCase().includes(query));
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'upcoming' ? ['pending', 'confirmed'].includes(item.status) && item.date > today : item.status === statusFilter);
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const aUpcoming = a.date > today;
    const bUpcoming = b.date > today;
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
    return (aUpcoming ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)) || a.time.localeCompare(b.time);
  }), [visibleAppointments, dateAppointments, search, statusFilter]);

  const summary = [
    { label: t.total, value: counts.total, icon: CalendarDays, color: 'text-cyan-300', background: 'bg-cyan-400/10' },
    { label: t.pending, value: counts.pending, icon: Clock3, color: 'text-amber-300', background: 'bg-amber-400/10' },
    { label: t.confirmed, value: counts.confirmed, icon: CheckCircle2, color: 'text-emerald-300', background: 'bg-emerald-400/10' },
    { label: t.cancelled, value: counts.cancelled, icon: X, color: 'text-rose-300', background: 'bg-rose-400/10' },
    { label: t.expired, value: counts.expired, icon: CalendarX, color: 'text-slate-300', background: 'bg-slate-400/10' },
    { label: t.noAnswer, value: counts.noAnswer, icon: Phone, color: 'text-violet-300', background: 'bg-violet-400/10' },
  ];
  const tabs: { label: string; value: Status | 'all' | 'upcoming'; count: number }[] = [
    { label: t.all, value: 'all', count: counts.total }, { label: t.upcoming, value: 'upcoming', count: counts.upcoming },
    { label: t.pending, value: 'pending', count: counts.pending }, { label: t.confirmed, value: 'confirmed', count: counts.confirmed },
    { label: t.cancelled, value: 'cancelled', count: counts.cancelled }, { label: t.expired, value: 'expired', count: counts.expired },
    { label: t.noAnswer, value: 'no-answer', count: counts.noAnswer },
  ];
  const agendaColumns = [
    { status: 'pending' as Status, label: t.pending, icon: Clock3, color: 'text-amber-300', border: 'border-amber-300/35', badge: 'bg-amber-300/10', top: 'bg-amber-400' },
    { status: 'confirmed' as Status, label: t.confirmed, icon: CheckCircle2, color: 'text-emerald-300', border: 'border-emerald-300/35', badge: 'bg-emerald-300/10', top: 'bg-emerald-400' },
    { status: 'cancelled' as Status, label: t.cancelled, icon: X, color: 'text-rose-300', border: 'border-rose-300/35', badge: 'bg-rose-300/10', top: 'bg-rose-400' },
    { status: 'expired' as Status, label: t.expired, icon: CalendarX, color: 'text-slate-300', border: 'border-slate-300/35', badge: 'bg-slate-300/10', top: 'bg-slate-400' },
    { status: 'no-answer' as Status, label: t.noAnswer, icon: Phone, color: 'text-violet-300', border: 'border-violet-300/35', badge: 'bg-violet-300/10', top: 'bg-violet-400' },
  ];

  function moveAppointment(id: number, status: Status) {
    const current = appointments.find(item => item.id === id);
    if (!current || current.status === status) return;
    if (['pending','confirmed'].includes(status) && (hasConflict(appointments, { ...current, status }, id) || (current.date >= today && (doctors.find(profile => profile.id === current.doctorId)?.active === false || patients.find(profile => profile.id === current.patientId)?.active === false)))) { setFeedback({error:true,message:language === 'fr' ? 'Créneau occupé ou profil archivé. Modifiez le rendez-vous avant de changer son statut.' : 'This slot is occupied or its profile is archived. Edit the appointment before changing its status.'}); return; }
    const actor = actingMember(staff);
    setFeedback({error:false,message:language==='fr'?'Statut du rendez-vous mis à jour.':'Appointment status updated.'});
    setAppointments((current) => current.map((item) => item.id === id ? { ...item, status, firstActionAt: item.firstActionAt ?? new Date().toISOString(), handledBy: item.handledBy ?? actor, confirmedBy: status === 'confirmed' ? item.confirmedBy ?? actor : item.confirmedBy } : item));
  }

  function dropAppointment(event: DragEvent<HTMLElement>, status: Status) {
    event.preventDefault();
    const id = Number(event.dataTransfer.getData('text/plain'));
    if (Number.isInteger(id) && id > 0) moveAppointment(id, status);
    setDraggedId(null);
    setDropStatus(null);
  }

  const buttonBase = 'inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300';
  const buttonQuiet = `${buttonBase} border-transparent bg-transparent text-white/55 hover:bg-white/10 hover:text-white`;
  const buttonActive = `${buttonBase} border-white/35 bg-white/25 text-white shadow-sm font-semibold`;

  return <div data-i18n-managed className="space-y-5 min-w-0 text-left">
    {feedback && <p role={feedback.error ? "alert" : "status"} className="rounded-xl border border-white/20 bg-white/10 p-3 text-sm">{feedback.message}</p>}
    <div className="relative z-30 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">{t.title}</h1>
      <div className="flex items-center gap-3">
        {dateControl}
        <button type="button" onClick={() => setNewOpen(true)} className="bg-[var(--surface)] text-[var(--text-primary)] rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-white/90 transition-colors"><UserPlus size={16} />{t.new}</button>
      </div>
    </div>
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
      {summary.map((card) => <div key={card.label} className="min-w-0 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 transition-colors hover:bg-white/[0.07]">
        <span className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center mb-6 ${card.background} ${card.color}`}><card.icon size={22} /></span>
        <p className="text-white/60 text-xs font-medium min-h-[28px] leading-tight">{card.label}</p>
        <p className="text-[36px] leading-none font-bold mt-2"><AnimatedMetricValue value={card.value} /></p>
      </div>)}
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <label className="relative flex-1 min-w-[180px]"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} className="w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/30" /></label>
      <div className="flex shrink-0 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-1" role="group" aria-label={language === 'fr' ? 'Mode d’affichage' : 'View mode'}><button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')} className={view === 'list' ? buttonActive : buttonQuiet}><List size={16} />{t.list}</button><button type="button" aria-pressed={view === 'agenda'} onClick={() => setView('agenda')} className={view === 'agenda' ? buttonActive : buttonQuiet}><CalendarDays size={16} />{t.agenda}</button></div>
    </div>
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-2 flex gap-1 overflow-x-auto">
      {tabs.map((tab) => <button key={tab.value} type="button" onClick={() => setStatusFilter(tab.value)} className={`${statusFilter === tab.value ? 'bg-white/15 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white'} rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors`}>{tab.label}<span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-white/75">{tab.count}</span></button>)}
    </div>
    {view === 'list' ? <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-x-auto">
      <table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-white/5 text-white/60 text-xs font-medium"><tr>{[t.patient, t.phone, t.date, t.time, t.service, t.doctor, t.status, language === 'fr' ? 'Actions' : 'Actions'].map((label) => <th key={label} className="px-3 py-4 font-semibold">{label}</th>)}</tr></thead><tbody>
        {filtered.slice(page * 25, (page + 1) * 25).map((item) => <tr key={item.id} className="border-t border-white/10 text-white/75 hover:bg-white/5"><td className="px-4 py-4 font-medium text-white whitespace-nowrap">{maskPatient(item.patient)}</td><td className="px-4 py-4">{maskedPhone}</td><td className="px-4 py-4 whitespace-nowrap">{formatDate(item.date, language)}</td><td className="px-4 py-4">{item.time}</td><td className="px-4 py-4 whitespace-nowrap">{language === 'fr' ? frenchServices[item.service] : item.service}</td><td className="px-4 py-4 min-w-[140px]">{maskedDoctor}</td><td className="px-4 py-4"><span className={`rounded-full px-2 py-1 text-xs whitespace-nowrap ${item.status === 'confirmed' ? 'bg-emerald-400/15 text-emerald-200' : item.status === 'pending' ? 'bg-amber-400/15 text-amber-200' : 'bg-white/10 text-white/60'}`}>{item.status === 'no-answer' ? t.noAnswer : t[item.status]}</span></td><td className="px-3 py-4"><button type="button" className="underline underline-offset-4" onClick={() => setEditing(item)}>{language === 'fr' ? 'Détails / modifier' : 'Details / edit'}</button></td></tr>)}
      </tbody></table><div className="flex items-center justify-between gap-3 p-4 text-xs text-white/80"><button type="button" disabled={page === 0} onClick={() => setPage(value => value - 1)} className="rounded-lg border border-white/20 p-2 disabled:opacity-40">{language === 'fr' ? 'Précédent' : 'Previous'}</button><span role="status">{filtered.length ? page * 25 + 1 : 0}–{Math.min((page + 1) * 25, filtered.length)} / {filtered.length}</span><button type="button" disabled={(page + 1) * 25 >= filtered.length} onClick={() => setPage(value => value + 1)} className="rounded-lg border border-white/20 p-2 disabled:opacity-40">{language === 'fr' ? 'Suivant' : 'Next'}</button></div>{filtered.length === 0 && <p className="p-8 text-center text-sm text-white/55">{t.empty}</p>}
    </div> : <div className="min-w-0 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-3" aria-label={t.agenda}>
      <div className="flex min-w-max items-stretch gap-3">
        {agendaColumns.filter((column) => statusFilter === 'all' || statusFilter === 'upcoming' || statusFilter === column.status).map((column) => {
          const items = filtered.filter((item) => item.status === column.status);
          return <section key={column.status} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDropStatus(column.status); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDropStatus(null); }} onDrop={(event) => dropAppointment(event, column.status)} className={`w-[250px] shrink-0 rounded-2xl border border-dashed bg-white/[0.035] p-3.5 transition-colors ${dropStatus === column.status ? 'border-white/60 bg-white/15' : 'border-white/20'}`}>
            <div className="mb-4 flex items-center gap-2.5">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${column.badge} ${column.color}`}><column.icon size={19} /></span>
              <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{column.label}</h2>
              <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${column.border} ${column.badge} ${column.color}`}>{items.length}</span>
            </div>
            <div className="max-h-[410px] min-h-[310px] space-y-2.5 overflow-y-auto pr-0.5" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.25) transparent' }}>
              {items.map((item) => <article key={item.id} draggable onDragStart={(event) => { event.dataTransfer.setData('text/plain', String(item.id)); event.dataTransfer.effectAllowed = 'move'; setDraggedId(item.id); }} onDragEnd={() => { setDraggedId(null); setDropStatus(null); }} className={`relative overflow-hidden rounded-xl border border-white/15 bg-white/[0.075] p-3.5 shadow-lg shadow-black/10 backdrop-blur-xl cursor-grab active:cursor-grabbing ${draggedId === item.id ? 'opacity-45' : ''}`}>
                <span className={`absolute inset-x-0 top-0 h-[3px] ${column.top}`} aria-hidden="true" />
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${column.border} ${column.badge} ${column.color}`} aria-hidden="true">{item.patient.trim().charAt(0).toLocaleUpperCase()}</span>
                  <h3 className="min-w-0 truncate text-sm font-semibold text-white" title={maskPatient(item.patient)}>{maskPatient(item.patient)}</h3>
                  <GripVertical size={16} className="shrink-0 text-white/35" aria-hidden="true" />
                </div>
                <div className="mt-3 flex min-w-0 items-center gap-2 text-xs text-white/65"><Stethoscope size={14} className="shrink-0 text-white/45" aria-hidden="true" /><span className="truncate">{language === 'fr' ? frenchServices[item.service] : item.service}</span></div>
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold text-white/75"><span className="rounded-md bg-white/10 px-2 py-1">{formatShortDate(item.date, language)}</span><span className="rounded-md bg-white/10 px-2 py-1">{item.time}</span></div>
              </article>)}
              {items.length === 0 && <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-5 text-center text-xs text-white/45">{t.empty}</p>}
            </div>
          </section>;
        })}
      </div>
    </div>}
    {(newOpen || editing) && <AppointmentEditor language={language} appointment={editing} onClose={() => { setNewOpen(false); setEditing(null); }} onSaved={item => { setFeedback({error:false,message:language==='fr'?'Rendez-vous enregistré.':'Appointment saved.'}); setSearch(''); onResetDate(); setStatusFilter(item.date > today ? 'upcoming' : 'all'); }} />}
  </div>;
}
