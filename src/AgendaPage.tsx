import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, Stethoscope } from 'lucide-react';
import { makeInitialAppointments, type Appointment, type AppointmentDay } from './AppointmentsPage';

type View = 'month' | 'week' | 'day';
const anchor = new Date(2026, 8, 29);
const services = ['MRI', 'Radiography', 'Ultrasound', 'CT scan', 'Mammography'];
const examinationColors: Record<string, string> = { MRI: '#5046e8', Radiography: '#38bdf8', Ultrasound: '#fb923c', 'CT scan': '#2595a9', Mammography: '#10b981', Other: '#94a3b8', 'Interventional radiology': '#8b5cf6' };
const translatedServices: Record<string, string> = { MRI: 'IRM', Radiography: 'Radiographie', Ultrasound: 'Échographie', 'CT scan': 'Scanner', Mammography: 'Mammographie' };
const copy = {
  en: { title: 'Agenda', all: 'All examinations', today: 'Today', previous: 'Previous', next: 'Next', month: 'Month', week: 'Week', day: 'Day', empty: 'No examinations scheduled' },
  fr: { title: 'Agenda', all: 'Tous les examens', today: "Aujourd’hui", previous: 'Précédent', next: 'Suivant', month: 'Mois', week: 'Semaine', day: 'Jour', empty: 'Aucun examen prévu' },
};

function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function addDays(date: Date, amount: number) { const next = new Date(date); next.setDate(next.getDate() + amount); return next; }
function monday(date: Date) { return addDays(date, -((date.getDay() + 6) % 7)); }
function shortName(patient: string) { return `${patient.trim().slice(0, 2).toUpperCase()}*****`; }
function timeAfter(time: string) { const [hour, minute] = time.split(':').map(Number); return `${String(hour + Math.floor((minute + 30) / 60)).padStart(2, '0')}:${String((minute + 30) % 60).padStart(2, '0')}`; }

export default function AgendaPage({ language, appointmentDays }: { language: 'en' | 'fr'; appointmentDays: AppointmentDay[] }) {
  const t = copy[language];
  const locale = language === 'fr' ? 'fr-FR' : 'en-US';
  const [view, setView] = useState<View>('month');
  const [focusedDate, setFocusedDate] = useState(anchor);
  const [service, setService] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!filterOpen) return;
    const closeOutside = (event: MouseEvent) => { if (!filterRef.current?.contains(event.target as Node)) setFilterOpen(false); };
    const closeEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setFilterOpen(false); };
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => { document.removeEventListener('mousedown', closeOutside); document.removeEventListener('keydown', closeEscape); };
  }, [filterOpen]);
  const [appointments] = useState<Appointment[]>(() => {
    try { const saved = window.sessionStorage.getItem('kelo-demo-appointments-v2'); return saved ? JSON.parse(saved) as Appointment[] : makeInitialAppointments(appointmentDays); }
    catch { return makeInitialAppointments(appointmentDays); }
  });
  const weekStart = monday(focusedDate);
  const visibleDays = view === 'day' ? [focusedDate] : Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const monthStart = new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1);
  const monthGridStart = monday(monthStart);
  const monthDays = Array.from({ length: 42 }, (_, index) => addDays(monthGridStart, index));
  const rangeStart = view === 'month' ? dateKey(monthGridStart) : dateKey(visibleDays[0]);
  const rangeEnd = view === 'month' ? dateKey(monthDays[41]) : dateKey(visibleDays[visibleDays.length - 1]);
  const filtered = useMemo(() => appointments.filter((item) => item.date >= rangeStart && item.date <= rangeEnd && (service === 'all' || item.service === service)), [appointments, rangeStart, rangeEnd, service]);
  const bySlot = useMemo(() => {
    const result = new Map<string, Appointment[]>();
    filtered.forEach((item) => { const key = `${item.date}-${item.time}`; result.set(key, [...(result.get(key) || []), item]); });
    return result;
  }, [filtered]);
  const byDay = useMemo(() => {
    const result = new Map<string, Appointment[]>();
    filtered.forEach((item) => result.set(item.date, [...(result.get(item.date) || []), item]));
    return result;
  }, [filtered]);
  const rangeLabel = view === 'month'
    ? new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(focusedDate)
    : view === 'day'
      ? new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(focusedDate)
      : `${new Intl.DateTimeFormat(locale, { month: 'long', day: '2-digit' }).format(visibleDays[0])} – ${new Intl.DateTimeFormat(locale, { month: 'long', day: '2-digit' }).format(visibleDays[6])}`;
  const step = (direction: number) => setFocusedDate((current) => view === 'month' ? new Date(current.getFullYear(), current.getMonth() + direction, Math.min(current.getDate(), 28)) : addDays(current, direction * (view === 'week' ? 7 : 1)));
  const displayService = (value: string) => language === 'fr' ? translatedServices[value] || value : value;
  const slots = Array.from({ length: 21 }, (_, index) => `${String(8 + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`);
  const control = 'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300';

  function eventCard(item: Appointment, count: number) {
    const color = examinationColors[item.service] || examinationColors.Other;
    return <div key={item.id} title={`${item.patient} · ${displayService(item.service)} · ${item.time}`} className="relative h-full min-w-0 overflow-hidden rounded-lg border border-t-[3px] border-white/20 px-1.5 py-1 text-left shadow-lg shadow-black/15 backdrop-blur-xl transition-[filter] hover:brightness-125" style={{ borderTopColor: color, background: `linear-gradient(135deg, ${color}30, rgba(255,255,255,0.08) 70%)` }}>
      <div className="flex min-w-0 items-center gap-1"><span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white/10 text-[9px] font-bold" style={{ borderColor: `${color}aa`, color }}>{item.patient.trim().charAt(0).toUpperCase()}</span><span className="min-w-0 flex-1 truncate text-[10px] font-bold text-white">{shortName(item.patient)}</span>{count > 1 && <span className="shrink-0 rounded bg-white/15 px-1 text-[9px] text-white/75">+{count - 1}</span>}</div>
      <div className="mt-1 flex min-w-0 items-center gap-1 text-[9px] text-white/70"><Stethoscope size={10} className="shrink-0 text-white/50" /><span className="truncate">{displayService(item.service)}</span></div>
      <div className="mt-1 inline-block rounded px-1 py-0.5 text-[9px] font-semibold text-white/90" style={{ backgroundColor: `${color}30` }}>{item.time} – {timeAfter(item.time)}</div>
    </div>;
  }

  return <div className="min-w-0 space-y-5 text-left text-white/90">
    <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">{t.title}</h1><div className="flex flex-wrap items-center gap-2">
      <div ref={filterRef} className="relative z-30"><button type="button" aria-haspopup="listbox" aria-expanded={filterOpen} aria-label={t.all} onClick={() => setFilterOpen((open) => !open)} className="flex min-w-[178px] items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-xl transition-colors hover:border-white/30 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"><SlidersHorizontal size={16} className="shrink-0 text-white/70" /><span className="min-w-0 flex-1 truncate text-left">{service === 'all' ? t.all : displayService(service)}</span><ChevronDown size={15} className={`shrink-0 text-white/65 transition-transform ${filterOpen ? 'rotate-180' : ''}`} /></button>{filterOpen && <div role="listbox" aria-label={t.all} className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-white/20 bg-[#243b34]/90 p-1.5 shadow-2xl shadow-black/30 backdrop-blur-2xl">{['all', ...services].map((name) => <button key={name} type="button" role="option" aria-selected={service === name} onClick={() => { setService(name); setFilterOpen(false); }} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition-colors ${service === name ? 'bg-white/15 font-semibold text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}`}><span className="min-w-0 flex-1 truncate">{name === 'all' ? t.all : displayService(name)}</span>{service === name && <Check size={14} className="shrink-0 text-cyan-200" />}</button>)}</div>}</div>
    </div></div>
    <section className="min-w-0 overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-xl shadow-black/10 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
        <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1"><button type="button" onClick={() => setFocusedDate(anchor)} className={`${control} bg-white/10 text-white hover:bg-white/20`}>{t.today}</button><button type="button" onClick={() => step(-1)} className={`${control} text-white/65 hover:bg-white/10 hover:text-white`}><ChevronLeft size={15} /><span className="hidden sm:inline">{t.previous}</span></button><button type="button" onClick={() => step(1)} className={`${control} text-white/65 hover:bg-white/10 hover:text-white`}><span className="hidden sm:inline">{t.next}</span><ChevronRight size={15} /></button></div>
        <h2 className="min-w-0 text-center text-base font-bold capitalize sm:text-lg">{rangeLabel}</h2>
        <div role="group" aria-label={language === 'fr' ? 'Vue du calendrier' : 'Calendar view'} className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1">{(['month', 'week', 'day'] as View[]).map((mode) => <button key={mode} type="button" aria-pressed={view === mode} onClick={() => setView(mode)} className={`${control} ${view === mode ? 'border border-white/25 bg-white/20 text-white shadow-sm' : 'border border-transparent text-white/55 hover:bg-white/10 hover:text-white'}`}>{t[mode]}</button>)}</div>
      </div>
      {view === 'month' ? <div className="overflow-x-auto p-4"><div className="min-w-[670px] overflow-hidden rounded-xl border border-white/10"><div className="grid grid-cols-7 bg-white/10">{Array.from({ length: 7 }, (_, index) => addDays(monthGridStart, index)).map((date) => <div key={dateKey(date)} className="border-r border-white/10 px-2 py-3 text-center text-xs font-semibold text-white/65">{new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date)}</div>)}</div><div className="grid grid-cols-7">{monthDays.map((date) => { const key = dateKey(date); const items = byDay.get(key) || []; return <div key={key} className={`min-h-[94px] border-r border-t border-white/10 p-2 ${key === dateKey(anchor) ? 'bg-cyan-300/10' : date.getMonth() !== focusedDate.getMonth() ? 'bg-black/10 text-white/35' : 'bg-white/[0.025]'}`}><span className="text-xs font-semibold">{date.getDate()}</span>{items.length > 0 && <div className="mt-1 space-y-1">{eventCard(items[0], items.length)}</div>}</div>; })}</div></div></div> : <div className="max-h-[570px] overflow-auto px-4 pb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,.3) transparent' }}><div className={view === 'week' ? 'min-w-[840px]' : 'min-w-[320px]'}><div className="grid sticky top-0 z-10 rounded-t-xl border border-white/10 bg-[#344c43]/[0.98] backdrop-blur-xl" style={{ gridTemplateColumns: `70px repeat(${visibleDays.length}, minmax(0, 1fr))` }}><div className="border-r border-white/10" />{visibleDays.map((date) => <div key={dateKey(date)} className={`border-r border-white/10 px-2 py-3 text-center text-xs font-semibold capitalize ${dateKey(date) === dateKey(anchor) ? 'bg-cyan-300/15 text-cyan-100' : 'text-white/75'}`}>{new Intl.DateTimeFormat(locale, { weekday: 'short', day: '2-digit', month: 'short' }).format(date)}</div>)}</div><div className="overflow-hidden rounded-b-xl border-x border-b border-white/10">{slots.map((time) => <div key={time} className="grid" style={{ gridTemplateColumns: `70px repeat(${visibleDays.length}, minmax(0, 1fr))` }}><div className="h-[76px] border-r border-t border-white/10 bg-white/[0.035] px-2 pt-2 text-[11px] font-semibold text-white/50">{time}</div>{visibleDays.map((date) => { const key = `${dateKey(date)}-${time}`; const items = bySlot.get(key) || []; return <div key={key} className={`h-[76px] min-w-0 border-r border-t border-white/10 p-1 ${dateKey(date) === dateKey(anchor) ? 'bg-cyan-300/[0.06]' : 'bg-white/[0.015]'}`}>{items.length > 0 && eventCard(items[0], items.length)}</div>; })}</div>)}</div></div></div>}
      <div className="flex items-center gap-2 border-t border-white/10 px-4 py-2.5 text-xs text-white/45"><CalendarDays size={14} />{filtered.length} {language === 'fr' ? 'rendez-vous dans cette période' : 'appointments in this period'}</div>
    </section>
  </div>;
}
