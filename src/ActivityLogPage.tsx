import AnimatedMetricValue from './AnimatedMetricValue';
import { useMemo, useState, type ReactNode } from 'react';
import { CalendarCheck2, CheckCircle2, CircleAlert, Clock3, Star, Users, XCircle } from 'lucide-react';
import { type Appointment, type AppointmentDay } from './AppointmentsPage';
import { buildTeamStats, formatDuration, memberFor, readDemoAppointments } from './teamActivity';

type Language = 'en' | 'fr';
type ActivityFilter = 'all' | Appointment['status'];

const words = {
  en: {
    title: 'Activity Log', subtitle: 'Appointment activity across your center, based on the demo records.',
    source: 'Demo records through Sep 29, 2026', periodCount: 'appointments in selected period',
    rate: 'Confirmation rate', confirmed: 'Confirmed', pending: 'Pending', response: 'Average response time', bestMember: 'Best team member', confirmations: 'confirmations', noMember: 'No confirmations',
    overview: 'Team performance', overviewHint: 'How each team member handled appointments in the selected period', teamCount: 'team members', actions: 'actions recorded', share: 'Share of confirmations', handled: 'Handled', average: 'Average response', noTeam: 'No team activity in this period.',
    cancelled: 'Cancelled', expired: 'Expired', noAnswer: 'No answer',
    events: 'Appointment timeline', eventHint: 'Most recent appointment records in the selected period',
    all: 'All', showMore: 'Show more', noEvents: 'No appointment records match this selection.',
    patient: 'Patient', service: 'Service', status: 'Status',
  },
  fr: {
    title: "Journal d'activité", subtitle: 'Activité des rendez-vous de votre centre, basée sur les données de démonstration.',
    source: 'Données de démonstration jusqu’au 29 sept. 2026', periodCount: 'rendez-vous sur la période sélectionnée',
    rate: 'Taux de confirmation', confirmed: 'Confirmés', pending: 'En attente', response: 'Délai moyen', bestMember: 'Meilleur(e) membre', confirmations: 'confirmations', noMember: 'Aucune confirmation',
    overview: "Performance de l'équipe", overviewHint: 'Suivi des rendez-vous par membre sur la période sélectionnée', teamCount: 'membres', actions: 'actions enregistrées', share: 'Part des confirmations', handled: 'Pris en charge', average: 'Délai moyen', noTeam: 'Aucune activité de l’équipe sur cette période.',
    cancelled: 'Annulés', expired: 'Expirés', noAnswer: 'Sans réponse',
    events: 'Historique des rendez-vous', eventHint: 'Les rendez-vous les plus récents de la période sélectionnée',
    all: 'Tous', showMore: 'Afficher plus', noEvents: 'Aucun rendez-vous pour cette sélection.',
    patient: 'Patient', service: 'Examen', status: 'Statut',
  },
};

const serviceFr: Record<string, string> = { Ultrasound: 'Échographie', MRI: 'IRM', Radiography: 'Radiographie', 'CT scan': 'Scanner', Mammography: 'Mammographie' };
const statusColor: Record<Appointment['status'], string> = {
  confirmed: 'text-emerald-200 bg-emerald-400/15 border-emerald-300/20',
  pending: 'text-amber-200 bg-amber-400/15 border-amber-300/20',
  cancelled: 'text-rose-200 bg-rose-400/15 border-rose-300/20',
  expired: 'text-slate-200 bg-slate-400/15 border-slate-300/20',
  'no-answer': 'text-violet-200 bg-violet-400/15 border-violet-300/20',
};
export default function ActivityLogPage({ language, appointmentDays, rangeStart, rangeEnd, dateControl }: { language: Language; appointmentDays: AppointmentDay[]; rangeStart: string; rangeEnd: string; dateControl: ReactNode }) {
  const t = words[language];
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [visibleCount, setVisibleCount] = useState(10);
  const [allAppointments] = useState<Appointment[]>(() => readDemoAppointments(appointmentDays));
  const selected = useMemo(() => allAppointments.filter((item) => item.date >= rangeStart && item.date <= rangeEnd), [allAppointments, rangeStart, rangeEnd]);
  const counts = useMemo(() => ({
    total: selected.length,
    confirmed: selected.filter((item) => item.status === 'confirmed').length,
    pending: selected.filter((item) => item.status === 'pending').length,
    cancelled: selected.filter((item) => item.status === 'cancelled').length,
    expired: selected.filter((item) => item.status === 'expired').length,
    noAnswer: selected.filter((item) => item.status === 'no-answer').length,
  }), [selected]);
  const confirmationRate = counts.total ? Math.round(counts.confirmed / counts.total * 100) : 0;
  const historicalCount = appointmentDays.reduce((sum, day) => sum + day.count, 0);
  const confirmationByMember = selected.reduce<Record<string, number>>((totals, item) => {
    const member = memberFor(item, item.confirmedBy, historicalCount);
    if (item.status === 'confirmed' && member) totals[member] = (totals[member] ?? 0) + 1;
    return totals;
  }, {});
  const bestMember = Object.entries(confirmationByMember).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  const responseMinutes = selected.flatMap((item) => {
    if (!item.receivedAt || !item.firstActionAt) return [];
    const minutes = (Date.parse(item.firstActionAt) - Date.parse(item.receivedAt)) / 60_000;
    return Number.isFinite(minutes) && minutes >= 0 ? [minutes] : [];
  });
  const averageResponseMinutes = responseMinutes.length ? Math.round(responseMinutes.reduce((sum, minutes) => sum + minutes, 0) / responseMinutes.length) : null;
  const averageResponse = formatDuration(averageResponseMinutes);
  const teamStats = useMemo(() => buildTeamStats(selected, historicalCount), [selected, historicalCount]);
  const events = useMemo(() => selected.filter((item) => filter === 'all' || item.status === filter).sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time) || b.id - a.id), [selected, filter]);
  const locale = language === 'fr' ? 'fr-FR' : 'en-US';
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
  const statusLabel = (status: Appointment['status']) => status === 'no-answer' ? t.noAnswer : t[status];
  const metrics = [
    { label: t.rate, value: `${confirmationRate}%`, icon: CheckCircle2, color: 'text-amber-300', backdrop: 'bg-amber-400/10' },
    { label: t.confirmed, value: String(counts.confirmed), icon: CalendarCheck2, color: 'text-emerald-300', backdrop: 'bg-emerald-400/10' },
    { label: t.pending, value: String(counts.pending), icon: CircleAlert, color: 'text-rose-300', backdrop: 'bg-rose-400/10' },
    { label: t.response, value: averageResponse, icon: Clock3, color: 'text-orange-300', backdrop: 'bg-orange-400/10' },
    { label: t.bestMember, value: bestMember?.[0] ?? '—', detail: bestMember ? `${bestMember[1]} ${t.confirmations}` : t.noMember, icon: Star, color: 'text-fuchsia-300', backdrop: 'bg-fuchsia-400/10' },
  ];
  const filters: { key: ActivityFilter; label: string; count: number }[] = [
    { key: 'all', label: t.all, count: counts.total },
    { key: 'confirmed', label: t.confirmed, count: counts.confirmed },
    { key: 'pending', label: t.pending, count: counts.pending },
    { key: 'cancelled', label: t.cancelled, count: counts.cancelled },
    { key: 'expired', label: t.expired, count: counts.expired },
    { key: 'no-answer', label: t.noAnswer, count: counts.noAnswer },
  ];

  return <div className="min-w-0 space-y-6 text-left">
    <section className="relative rounded-3xl border border-white/15 bg-white/[0.07] backdrop-blur-xl p-5 sm:p-7 shadow-xl">
      <div className="relative z-30 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
          <p className="mt-2 text-sm text-white/55 max-w-xl">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {dateControl}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-4 text-xs text-white/45"><span>{counts.total.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')} {t.periodCount}</span><span aria-hidden="true">·</span><span>{t.source}</span></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 xl:grid-cols-5 gap-2.5 mt-7">
        {metrics.map(({ label, value, icon: Icon, color, backdrop, detail }, index) => <div key={label} className={`min-w-0 min-h-[136px] flex flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3.5 ${index < 3 ? 'md:col-span-2 xl:col-span-1' : 'md:col-span-3 xl:col-span-1'} ${index === 4 ? 'sm:col-span-2 md:col-span-3 xl:col-span-1' : ''}`}>
          <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${backdrop} ${color}`}><Icon size={17} /></span>
          <p className={`mt-3 min-h-[27px] text-[9px] font-semibold uppercase tracking-[0.1em] leading-[1.35] ${color}`}>{label}</p>
          <div className="mt-auto min-w-0 pt-1"><p title={value} className={`${index === 4 ? 'text-[17px]' : 'text-[26px]'} leading-none font-bold truncate`}><AnimatedMetricValue value={value} locale={locale} /></p>{detail && <p className="mt-1.5 text-[10px] text-white/60 truncate">{detail}</p>}</div>
        </div>)}
      </div>
    </section>

    <section>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4"><div className="flex items-start gap-3"><Users className="text-white/70 mt-0.5" size={22} /><div><h2 className="text-xl font-semibold">{t.overview}</h2><p className="text-sm text-white/50 mt-1">{t.overviewHint}</p></div></div><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/65"><span className="h-2 w-2 rounded-full bg-emerald-300" />{teamStats.length} {t.teamCount}</span></div>
      {teamStats.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teamStats.map((member, index) => <article key={member.name} className="relative min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-lg">
          <span className={`absolute inset-x-0 top-0 h-[3px] ${index === 0 ? 'bg-cyan-300/80' : index === 1 ? 'bg-amber-300/80' : index === 2 ? 'bg-violet-300/80' : 'bg-rose-300/80'}`} aria-hidden="true" />
          <div className="flex min-w-0 items-center gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/55 to-sky-600/55 text-lg font-bold text-white shadow-lg shadow-cyan-950/20">{member.name.slice(-2)}</span><div className="min-w-0"><h3 className="truncate font-semibold" title={member.name}><span className="mr-1.5 text-amber-200">#{index + 1}</span>{member.name}</h3><p className="mt-1 text-xs text-white/55">{member.actions.toLocaleString(locale)} {t.actions}</p></div></div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[{ label: t.share, value: `${member.share}%`, detail: `${member.confirmed.toLocaleString(locale)} ${t.confirmations}`, icon: CheckCircle2, tone: 'border-amber-300/20 bg-amber-400/10 text-amber-100' }, { label: t.handled, value: member.actions.toLocaleString(locale), detail: '', icon: Users, tone: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100' }, { label: t.average, value: formatDuration(member.averageMinutes), detail: '', icon: Clock3, tone: 'border-sky-300/20 bg-sky-400/10 text-sky-100' }].map(({ label, value, detail, icon: Icon, tone }) => <div key={label} className={`min-w-0 rounded-xl border ${tone} px-2 py-3 text-center`}><span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/10"><Icon size={16} /></span><p className="mt-2 truncate text-lg font-bold" title={value}><AnimatedMetricValue value={value} locale={locale} /></p><p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.06em] leading-tight opacity-75">{label}</p>{detail && <p className="mt-1 truncate text-[9px] opacity-65" title={detail}>{detail}</p>}</div>)}
          </div>
        </article>)}
      </div> : <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/55">{t.noTeam}</div>}
    </section>

    <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      <div className="p-5 border-b border-white/10"><h2 className="text-xl font-semibold">{t.events}</h2><p className="text-sm text-white/50 mt-1">{t.eventHint}</p></div>
      <div className="flex gap-2 overflow-x-auto p-3 border-b border-white/10">
        {filters.map(({ key, label, count }) => <button key={key} type="button" onClick={() => { setFilter(key); setVisibleCount(10); }} aria-pressed={filter === key} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${filter === key ? 'bg-white/20 text-white' : 'text-white/55 hover:bg-white/10 hover:text-white'}`}>{label}<span className="ml-1.5 text-white/45 tabular-nums">{count}</span></button>)}
      </div>
      {events.length ? <div className="divide-y divide-white/10">{events.slice(0, visibleCount).map((item) => <div key={item.id} className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
        <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${statusColor[item.status]}`}>{item.status === 'confirmed' ? <CheckCircle2 size={17} /> : item.status === 'pending' ? <Clock3 size={17} /> : item.status === 'cancelled' ? <XCircle size={17} /> : <CircleAlert size={17} />}</span>
        <div className="min-w-0 flex-1"><p className="text-sm font-medium"><span className="text-white">{item.patient.slice(0, 2).toUpperCase()}*****</span><span className="text-white/40"> · </span>{language === 'fr' ? serviceFr[item.service] : item.service}</p><p className="text-xs text-white/45 mt-1">{formatDate(item.date)} · {item.time}</p></div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusColor[item.status]}`}>{statusLabel(item.status)}</span>
      </div>)}</div> : <p className="p-8 text-center text-sm text-white/50">{t.noEvents}</p>}
      {visibleCount < events.length && <div className="p-4 border-t border-white/10 text-center"><button type="button" onClick={() => setVisibleCount((count) => count + 10)} className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition-colors">{t.showMore}</button></div>}
    </section>
  </div>;
}
