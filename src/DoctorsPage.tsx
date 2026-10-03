import AnimatedMetricValue from './AnimatedMetricValue';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CalendarCheck2, CalendarDays, CheckCircle2, Clock3, Plus, Stethoscope, UserRound, Users, X } from 'lucide-react';
import { makeInitialAppointments, type Appointment, type AppointmentDay } from './AppointmentsPage';

type Language = 'en' | 'fr';
type Doctor = { id: string; name: string; specialty: string; lastLogin: string | null };

const initialDoctors: Doctor[] = [
  { id: 'meryem', name: 'Meryem El Ghaidi', specialty: 'Radiology', lastLogin: '2026-09-29T16:42:00' },
  { id: 'karim', name: 'Karim Bennani', specialty: 'Medical imaging', lastLogin: '2026-09-29T14:18:00' },
  { id: 'salma', name: 'Salma Tazi', specialty: 'Diagnostic imaging', lastLogin: '2026-09-29T11:06:00' },
  { id: 'amine', name: 'Amine Fassi', specialty: 'Radiology', lastLogin: '2026-09-28T17:24:00' },
];

const copy = {
  en: { title: 'Medical team', subtitle: 'Manage the doctors shown in your center directory.', add: 'Add doctor', team: 'Doctors', appointments: 'Appointments', confirmed: 'Confirmed', rate: 'Confirmation rate', upcoming: 'Upcoming', lastLogin: 'Last login activity', demo: 'Demo activity', noActivity: 'No login activity yet', newTitle: 'Add a doctor', name: 'Doctor name', specialty: 'Specialty', save: 'Add doctor', cancel: 'Cancel', close: 'Close', nameError: 'Enter at least two letters for the doctor name.', specialtyError: 'Enter a specialty.', radiology: 'Radiology', imaging: 'Medical imaging', diagnostic: 'Diagnostic imaging', empty: 'No doctors registered yet.' },
  fr: { title: 'Équipe médicale', subtitle: 'Gérez les médecins affichés dans le répertoire de votre centre.', add: 'Ajouter un médecin', team: 'Médecins', appointments: 'Rendez-vous', confirmed: 'Confirmés', rate: 'Taux de confirmation', upcoming: 'À venir', lastLogin: 'Dernière connexion', demo: 'Activité de démonstration', noActivity: 'Aucune connexion pour le moment', newTitle: 'Ajouter un médecin', name: 'Nom du médecin', specialty: 'Spécialité', save: 'Ajouter le médecin', cancel: 'Annuler', close: 'Fermer', nameError: 'Saisissez au moins deux lettres pour le nom du médecin.', specialtyError: 'Saisissez une spécialité.', radiology: 'Radiologie', imaging: 'Imagerie médicale', diagnostic: 'Imagerie diagnostique', empty: 'Aucun médecin enregistré.' },
};

const maskDoctor = (name: string) => `Dr. ${name.trim().slice(0, 2).toLocaleUpperCase()}*****`;
const doctorKey = (name: string) => name.replace(/^Dr\.\s*/i, '').trim().toLocaleLowerCase();

function readAppointments(days: AppointmentDay[]): Appointment[] {
  try {
    const saved = window.sessionStorage.getItem('kelo-demo-appointments-v2');
    return saved ? JSON.parse(saved) as Appointment[] : makeInitialAppointments(days);
  } catch { return makeInitialAppointments(days); }
}

export default function DoctorsPage({ language, appointmentDays }: { language: Language; appointmentDays: AppointmentDay[] }) {
  const t = copy[language];
  const [appointments] = useState(() => readAppointments(appointmentDays));
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [errors, setErrors] = useState<{ name?: string; specialty?: string }>({});
  const historical = useMemo(() => appointments.filter((item) => item.date <= '2026-09-29'), [appointments]);
  const upcoming = useMemo(() => appointments.filter((item) => item.date > '2026-09-29' && item.status === 'confirmed'), [appointments]);
  const locale = language === 'fr' ? 'fr-FR' : 'en-US';
  const dateFormat = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const totalConfirmed = historical.filter((item) => item.status === 'confirmed').length;
  const summary = [
    { label: t.team, value: doctors.length, icon: Users, tone: 'text-cyan-200', surface: 'bg-cyan-400/10' },
    { label: t.appointments, value: historical.length, icon: CalendarDays, tone: 'text-amber-200', surface: 'bg-amber-400/10' },
    { label: t.confirmed, value: totalConfirmed, icon: CalendarCheck2, tone: 'text-emerald-200', surface: 'bg-emerald-400/10' },
  ];

  useEffect(() => {
    if (!formOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setFormOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [formOpen]);

  function addDoctor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedSpecialty = specialty.trim();
    const nextErrors = { name: trimmedName.length < 2 ? t.nameError : undefined, specialty: !trimmedSpecialty ? t.specialtyError : undefined };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.specialty) return;
    setDoctors((current) => [...current, { id: `added-${Date.now()}`, name: trimmedName.replace(/^Dr\.\s*/i, ''), specialty: trimmedSpecialty, lastLogin: null }]);
    setName(''); setSpecialty(''); setErrors({}); setFormOpen(false);
  }

  return <div className="min-w-0 space-y-5 text-left text-white/90">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold">{t.title}</h1><p className="mt-1 text-sm text-white/55">{t.subtitle}</p></div><button type="button" onClick={() => setFormOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-cyan-200/25 bg-cyan-400/20 px-4 py-2.5 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"><Plus size={17} />{t.add}</button></div>
    <div className="grid gap-4 sm:grid-cols-3">{summary.map((card) => <div key={card.label} className="flex min-w-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/5 backdrop-blur-xl"><span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${card.surface} ${card.tone}`}><card.icon size={27} /></span><div className="min-w-0"><p className="text-3xl font-bold leading-none"><AnimatedMetricValue value={card.value} /></p><p className="mt-2 text-xs font-medium text-white/60">{card.label}</p></div></div>)}</div>
    {doctors.length ? <div className="grid gap-4 md:grid-cols-2">{doctors.map((doctor, index) => {
      const assigned = historical.filter((item) => doctorKey(item.doctor) === doctorKey(doctor.name));
      const confirmed = assigned.filter((item) => item.status === 'confirmed').length;
      const scheduled = upcoming.filter((item) => doctorKey(item.doctor) === doctorKey(doctor.name)).length;
      const rate = assigned.length ? Math.round(confirmed / assigned.length * 100) : 0;
      const specialtyLabel = doctor.specialty === 'Radiology' ? t.radiology : doctor.specialty === 'Medical imaging' ? t.imaging : doctor.specialty === 'Diagnostic imaging' ? t.diagnostic : doctor.specialty;
      return <article key={doctor.id} className="relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/5 backdrop-blur-xl"><span className={`absolute inset-x-0 top-0 h-0.5 ${['bg-cyan-300/70', 'bg-amber-300/70', 'bg-emerald-300/70', 'bg-violet-300/70'][index % 4]}`} /><div className="flex min-w-0 items-start gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-400/15 font-semibold text-cyan-100"><Stethoscope size={22} /></span><div className="min-w-0 flex-1"><h2 className="truncate text-base font-semibold text-white">{maskDoctor(doctor.name)}</h2><p className="mt-0.5 truncate text-xs text-white/55">{specialtyLabel}</p></div><span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/45">{t.demo}</span></div><div className="mt-5 grid grid-cols-3 gap-2">{[
        { label: t.appointments, value: assigned.length, icon: CalendarDays, tone: 'text-cyan-100', surface: 'bg-cyan-300/10' },
        { label: t.confirmed, value: confirmed, icon: CheckCircle2, tone: 'text-emerald-100', surface: 'bg-emerald-300/10' },
        { label: t.rate, value: `${rate}%`, icon: CalendarCheck2, tone: 'text-amber-100', surface: 'bg-amber-300/10' },
      ].map((metric) => <div key={metric.label} className={`min-w-0 rounded-xl border border-white/10 px-3 py-3 ${metric.surface}`}><metric.icon size={16} className={metric.tone} /><p className="mt-3 text-xl font-semibold leading-none text-white">{metric.value}</p><p className="mt-1.5 truncate text-[10px] font-medium uppercase tracking-wider text-white/55" title={metric.label}>{metric.label}</p></div>)}</div><div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs"><span className="inline-flex items-center gap-1.5 text-white/60"><CalendarDays size={14} className="text-cyan-200" />{scheduled} {t.upcoming.toLocaleLowerCase()}</span><span className="inline-flex items-center gap-1.5 text-white/50"><Clock3 size={14} />{t.lastLogin}: {doctor.lastLogin ? dateFormat.format(new Date(doctor.lastLogin)) : t.noActivity}</span></div></article>;
    })}</div> : <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-14 text-center text-white/55 backdrop-blur-xl"><UserRound className="mx-auto mb-3" size={32} />{t.empty}</div>}
    {formOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }}><form role="dialog" aria-modal="true" aria-label={t.newTitle} noValidate onSubmit={addDoctor} className="w-full max-w-md space-y-4 rounded-2xl border border-white/20 bg-[#1c3029]/95 p-6 text-white shadow-2xl backdrop-blur-2xl"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{t.newTitle}</h2><button type="button" onClick={() => setFormOpen(false)} aria-label={t.close} className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white"><X size={20} /></button></div><label className="block text-sm font-medium">{t.name}<input autoFocus value={name} onChange={(event) => { setName(event.target.value); setErrors((current) => ({ ...current, name: undefined })); }} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'doctor-name-error' : undefined} className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-300/60" />{errors.name && <span id="doctor-name-error" className="mt-1 block text-xs text-rose-200">{errors.name}</span>}</label><label className="block text-sm font-medium">{t.specialty}<input value={specialty} onChange={(event) => { setSpecialty(event.target.value); setErrors((current) => ({ ...current, specialty: undefined })); }} aria-invalid={Boolean(errors.specialty)} aria-describedby={errors.specialty ? 'doctor-specialty-error' : undefined} className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-300/60" />{errors.specialty && <span id="doctor-specialty-error" className="mt-1 block text-xs text-rose-200">{errors.specialty}</span>}</label><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium hover:bg-white/10">{t.cancel}</button><button type="submit" className="rounded-xl border border-cyan-200/25 bg-cyan-400/25 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-400/35">{t.save}</button></div></form></div>}
  </div>;
}
