import AnimatedMetricValue from './AnimatedMetricValue';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Activity, CalendarDays, ClipboardList, HeartPulse, Phone, Plus, Search, Users, X } from 'lucide-react';
import { makeInitialAppointments, type Appointment, type AppointmentDay } from './AppointmentsPage';

type Patient = { id: string; name: string; phone: string; lastService: string; lastVisit: string; appointments: number };
const today = '2026-09-29';
const activeFrom = '2026-08-31';
const storageKey = 'kelo-demo-patients-v1';
const frenchServices: Record<string, string> = { Ultrasound: 'Échographie', MRI: 'IRM', Radiography: 'Radiographie', 'CT scan': 'Scanner', Mammography: 'Mammographie' };
const copy = {
  en: { title: 'Patients', records: 'Patient records', active: 'Active (30 days)', consultations: 'Consultations', search: 'Search patient records...', new: 'New Patient', patient: 'Patient', phone: 'Phone', service: 'Last service', visit: 'Last visit', total: 'Total RDV', empty: 'No patients match this search.', close: 'Close', save: 'Add patient', name: 'Full name', newTitle: 'New patient' },
  fr: { title: 'Patients', records: 'Dossiers patients', active: 'Actifs (30 j)', consultations: 'Consultations', search: 'Rechercher un dossier...', new: 'Nouveau patient', patient: 'Patient', phone: 'Téléphone', service: 'Dernier service', visit: 'Dernière visite', total: 'Total RDV', empty: 'Aucun patient ne correspond à cette recherche.', close: 'Fermer', save: 'Ajouter le patient', name: 'Nom complet', newTitle: 'Nouveau patient' },
};

function readAppointments(days: AppointmentDay[]): Appointment[] {
  try { const saved = window.sessionStorage.getItem('kelo-demo-appointments-v2'); return saved ? JSON.parse(saved) as Appointment[] : makeInitialAppointments(days); }
  catch { return makeInitialAppointments(days); }
}

function aggregatePatients(appointments: Appointment[]): Patient[] {
  const historical = appointments.filter((item) => item.date <= today);
  // The dashboard estimates lifetime patients as 92% of lifetime appointments.
  // Demo names repeat, so use visit IDs to keep the directory aligned with that total.
  const target = Math.round(historical.length * 0.92);
  const mixed = [...historical].sort((a, b) => shuffledRank(a.id) - shuffledRank(b.id));
  const patients = mixed.slice(0, target).map((item) => ({ id: `visit-${item.id}`, name: item.patient, phone: item.phone, lastService: item.service, lastVisit: item.date, appointments: 1 }));
  mixed.slice(target).forEach((item) => {
    const patient = patients[shuffledRank(item.id) % patients.length];
    patient.appointments += 1;
    if (item.date > patient.lastVisit) { patient.lastVisit = item.date; patient.lastService = item.service; }
  });
  const remaining = patients.sort((a, b) => shuffledRank(Number(a.id.slice(6)) + 41) - shuffledRank(Number(b.id.slice(6)) + 41));
  const take = (count: number) => {
    const match = remaining.findIndex((patient) => count === 3 ? patient.appointments >= 3 : patient.appointments === count);
    return remaining.splice(match < 0 ? 0 : match, 1)[0];
  };
  const featured = [2, 1, 3, 1, 2, 1, 2, 1, 3, 1].map(take).filter((patient): patient is Patient => Boolean(patient));
  return [...featured, ...remaining];
}

function shuffledRank(value: number) {
  let rank = value ^ 0x9e3779b9;
  rank = Math.imul(rank ^ (rank >>> 16), 0x85ebca6b);
  rank = Math.imul(rank ^ (rank >>> 13), 0xc2b2ae35);
  return (rank ^ (rank >>> 16)) >>> 0;
}

function maskName(name: string) {
  return `${name.trim().slice(0, 2).toLocaleUpperCase()}******`;
}

export default function PatientsPage({ language, appointmentDays }: { language: 'en' | 'fr'; appointmentDays: AppointmentDay[] }) {
  const t = copy[language];
  const [appointments] = useState(() => readAppointments(appointmentDays));
  const [addedPatients, setAddedPatients] = useState<Patient[]>(() => {
    try { return (JSON.parse(window.sessionStorage.getItem(storageKey) || '[]') as Patient[]).map((patient, index) => ({ ...patient, id: patient.id || `manual-${index}` })); }
    catch { return []; }
  });
  const [search, setSearch] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  useEffect(() => { window.sessionStorage.setItem(storageKey, JSON.stringify(addedPatients)); }, [addedPatients]);
  const patients = useMemo(() => [...aggregatePatients(appointments), ...addedPatients], [appointments, addedPatients]);
  const activeCount = useMemo(() => patients.filter((patient) => patient.lastVisit >= activeFrom && patient.lastVisit <= today).length, [patients]);
  const consultations = useMemo(() => appointments.filter((item) => item.date <= today).length, [appointments]);
  const filtered = useMemo(() => patients.filter((patient) => [patient.name, patient.phone, patient.lastService, frenchServices[patient.lastService] || ''].some((value) => value.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))), [patients, search]);
  const dateFormat = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const summary = [
    { label: t.records, value: patients.length, icon: Users, tone: 'text-cyan-200', surface: 'bg-cyan-400/10' },
    { label: t.active, value: activeCount, icon: HeartPulse, tone: 'text-emerald-200', surface: 'bg-emerald-400/10' },
    { label: t.consultations, value: consultations, icon: CalendarDays, tone: 'text-amber-200', surface: 'bg-amber-400/10' },
  ];

  function addPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const phone = String(form.get('phone') || '').trim();
    if (!name || !phone) return;
    if (patients.some((patient) => patient.name.toLocaleLowerCase() === name.toLocaleLowerCase())) { setSearch(name); setNewOpen(false); return; }
    setAddedPatients((current) => [...current, { id: `manual-${Date.now()}`, name, phone, lastService: '', lastVisit: '', appointments: 0 }]);
    setSearch(name);
    setNewOpen(false);
  }

  return <div className="min-w-0 space-y-5 text-left text-white/90">
    <h1 className="text-2xl font-bold">{t.title}</h1>
    <div className="grid gap-4 sm:grid-cols-3">{summary.map((card) => <div key={card.label} className="flex min-w-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/5 backdrop-blur-xl"><span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${card.surface} ${card.tone}`}><card.icon size={27} /></span><div className="min-w-0"><p className="text-3xl font-bold leading-none"><AnimatedMetricValue value={card.value} /></p><p className="mt-2 text-xs font-medium text-white/60">{card.label}</p></div></div>)}</div>
    <div className="flex flex-wrap items-center justify-between gap-3"><label className="relative min-w-[220px] max-w-lg flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-xl focus:border-white/30" /></label><button type="button" onClick={() => setNewOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-400/20 px-4 py-2.5 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-400/30"><Plus size={17} />{t.new}</button></div>
    <div className="min-w-0 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"><table className="w-full min-w-[740px] text-left text-sm"><thead className="bg-white/5 text-[11px] uppercase tracking-wider text-white/55"><tr>{[t.patient, t.phone, t.service, t.visit, t.total].map((label) => <th key={label} className={`px-4 py-4 font-semibold ${label === t.total ? 'text-center' : ''}`}>{label}</th>)}</tr></thead><tbody>{filtered.map((patient) => <tr key={patient.id} className="border-t border-white/10 text-white/75 transition-colors hover:bg-white/5"><td className="px-4 py-3.5"><div className="flex min-w-[160px] items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/15 font-bold text-cyan-100">{patient.name.trim().charAt(0).toUpperCase()}</span><span className="truncate font-semibold text-white">{maskName(patient.name)}</span></div></td><td className="px-4 py-3.5"><span className="flex items-center gap-2 whitespace-nowrap"><Phone size={15} className="text-white/40" />{patient.phone === '0000000000' ? '**********' : patient.phone}</span></td><td className="px-4 py-3.5"><span className="flex items-center gap-2 whitespace-nowrap"><Activity size={15} className="text-cyan-200/75" />{patient.lastService ? language === 'fr' ? frenchServices[patient.lastService] || patient.lastService : patient.lastService : '—'}</span></td><td className="px-4 py-3.5"><span className="flex items-center gap-2 whitespace-nowrap"><CalendarDays size={15} className="text-white/40" />{patient.lastVisit ? dateFormat.format(new Date(`${patient.lastVisit}T12:00:00`)) : '—'}</span></td><td className="px-4 py-3.5 text-center"><span className="inline-flex min-w-8 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-400/15 px-2 py-1 text-xs font-bold text-cyan-100">{patient.appointments}</span></td></tr>)}</tbody></table>{filtered.length === 0 && <p className="px-4 py-8 text-center text-sm text-white/50">{t.empty}</p>}</div>
    {newOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setNewOpen(false); }}><form onSubmit={addPatient} className="w-full max-w-md space-y-4 rounded-2xl border border-white/20 bg-[#1c3029]/90 p-6 shadow-2xl backdrop-blur-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{t.newTitle}</h2><button type="button" onClick={() => setNewOpen(false)} aria-label={t.close} className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white"><X size={20} /></button></div><label className="block text-xs font-medium text-white/65">{t.name}<input required name="name" autoFocus className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50" /></label><label className="block text-xs font-medium text-white/65">{t.phone}<input required name="phone" type="tel" className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50" /></label><button type="submit" className="w-full rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500"><ClipboardList size={16} className="mr-2 inline" />{t.save}</button></form></div>}
  </div>;
}
