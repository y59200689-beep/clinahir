import { useState } from 'react';
import { CalendarDays, Check, CheckCircle2, Clock3, MapPin, Search, ArrowUpRight, BarChart3, Users, Stethoscope, ArrowRight } from 'lucide-react';

export default function Features({ language = 'en', className = '' }: { language?: 'en' | 'fr'; className?: string }) {
  const fr = language === 'fr';
  const [slot, setSlot] = useState('09:30');
  const t = (en: string, french: string) => fr ? french : en;
  const card = 'feature-preview-card min-w-0 rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8';
  const preview = 'rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5 sm:p-6';
  const label = 'text-[10px] font-semibold uppercase tracking-[.12em] text-[var(--text-secondary)]';
  return <section className={`bg-[var(--surface)] px-6 py-24 md:px-12 ${className}`}>
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 grid items-end gap-6 md:grid-cols-2 md:gap-12">
        <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--text-primary)] md:text-5xl">{t('One System for Your Digital Patient Journey', 'Une seule solution pour le parcours digital de vos patients')}</h2>
        <p className="max-w-lg text-lg leading-relaxed text-[var(--text-secondary)]">{t('Give patients a modern way to discover your center, understand your services and book an appointment while giving your team the tools to manage requests efficiently.', 'Permettez aux patients de découvrir votre centre, de comprendre vos services et de prendre rendez-vous facilement, tout en donnant à votre équipe les outils pour gérer les demandes efficacement.')}</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <article className={card}>
          <div className="mb-5 flex items-center gap-3"><CalendarDays className="text-[var(--brand-primary-hover)]" size={21}/><h3 className="text-xl font-semibold">{t('Patient Experience', 'Expérience patient')}</h3></div>
          <p className="mb-7 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">{t('A clear appointment request, from choosing an examination to finding a convenient time.', 'Une demande simple, du choix de l’examen à la sélection d’un créneau adapté.')}</p>
          <div className={preview}>
            <div className="mb-5 flex items-start justify-between gap-3"><div><p className={label}>{t('Appointment request', 'Demande de rendez-vous')}</p><p className="mt-2 text-lg font-semibold">{t('Find a time that suits you', 'Choisissez votre créneau')}</p></div><span className="rounded-lg bg-white p-2 text-[var(--brand-primary-hover)]"><Stethoscope size={20}/></span></div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white p-4"><div><p className={label}>{t('Examination', 'Examen')}</p><p className="mt-1 text-sm font-semibold">{t('Ultrasound', 'Échographie')}</p></div><CheckCircle2 size={18} className="shrink-0 text-[var(--brand-primary-hover)]"/></div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-medium">{t('Monday, 12 October', 'Lundi 12 octobre')}</span><span className="text-xs text-[var(--text-secondary)]">{t('Choose a time', 'Choisissez une heure')}</span></div>
            <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label={t('Sample appointment times', 'Exemples de créneaux')}>
              {['09:30','10:00','14:30'].map(time => <button key={time} type="button" aria-pressed={slot===time} onClick={()=>setSlot(time)} className={`rounded-xl border px-2 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)] ${slot===time?'border-[var(--brand-primary-hover)] bg-[var(--brand-primary-hover)] text-white':'border-[var(--border)] bg-white hover:border-[var(--brand-primary)]'}`}>{time}</button>)}
            </div>
            <div aria-live="polite" className="mt-5 flex items-center gap-2 text-xs text-[var(--text-secondary)]"><Clock3 size={14}/>{t('Selected time:', 'Créneau choisi :')} <strong className="text-[var(--text-primary)]">{slot}</strong></div>
          </div>
          <p className="mt-4 text-xs text-[var(--text-secondary)]">{t('Interactive example · No appointment is created.', 'Exemple interactif · Aucun rendez-vous n’est créé.')}</p>
        </article>
        <article className={card}>
          <div className="mb-5 flex items-center gap-3"><BarChart3 className="text-[var(--brand-primary-hover)]" size={21}/><h3 className="text-xl font-semibold">{t('Center Dashboard', 'Tableau de bord du centre')}</h3></div>
          <p className="mb-7 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">{t('See incoming requests, confirmed appointments and what still needs your team’s attention.', 'Suivez les demandes reçues, les rendez-vous confirmés et les demandes à traiter par votre équipe.')}</p>
          <div className={preview}>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3"><div><p className={label}>{t('Appointment activity', 'Activité des rendez-vous')}</p><p className="mt-2 text-lg font-semibold">{t('This week at a glance', 'Votre semaine en bref')}</p></div><span className="rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs">{t('Sample report', 'Rapport fictif')}</span></div>
            <div className="grid grid-cols-3 gap-3">
              {[[48,t('Requests','Demandes')],[40,t('Confirmed','Confirmés')],[8,t('To review','À traiter')]].map(([value,name])=><div key={name} className="min-w-0"><p className="text-3xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-[var(--text-secondary)]">{name}</p></div>)}
            </div>
            <div className="mt-7 border-t border-[var(--border)] pt-5"><div className="mb-3 flex justify-between gap-2 text-xs"><span>{t('Confirmed appointments', 'Rendez-vous confirmés')}</span><strong>40 / 48</strong></div><div className="flex h-2.5 overflow-hidden rounded-full bg-white" aria-hidden="true"><div className="w-5/6 bg-[var(--brand-primary)]"/><div className="flex-1 bg-[var(--brand-primary-20)]"/></div></div>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white p-3 text-sm"><Users size={17} className="shrink-0 text-[var(--brand-primary-hover)]"/>{t('8 requests ready for staff review', '8 demandes à examiner par l’équipe')}</div>
          </div>
          <p className="mt-4 text-xs text-[var(--text-secondary)]">{t('Illustrative figures · Not client results.', 'Chiffres fictifs · Aucun résultat client réel.')}</p>
        </article>
        <article className={card}>
          <div className="mb-5 flex items-center gap-3"><Search className="text-[var(--brand-primary-hover)]" size={21}/><h3 className="text-xl font-semibold">{t('Search Visibility', 'Visibilité sur Google')}</h3></div>
          <p className="mb-7 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">{t('Help nearby patients find your services and reach your center’s booking page.', 'Aidez les patients à proximité à trouver vos services et votre page de réservation.')}</p>
          <div className={preview}>
            <div className="mb-4 flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-3 text-sm"><Search size={16} className="shrink-0 text-[var(--text-secondary)]"/><span>{t('Radiology center near me', 'Centre de radiologie à proximité')}</span></div>
            <div className="rounded-xl border border-[var(--border)] bg-white p-4 sm:p-5"><div className="flex items-start gap-3"><span className="rounded-xl bg-[var(--brand-primary-10)] p-3 text-[var(--brand-primary-hover)]"><MapPin size={22}/></span><div className="min-w-0"><p className={label}>{t('Fictional local listing', 'Fiche locale fictive')}</p><p className="mt-1 text-lg font-semibold">{t('Example Radiology Center', 'Centre de radiologie exemple')}</p><p className="mt-1 text-xs text-[var(--text-secondary)]">{t('Radiology · Medical imaging', 'Radiologie · Imagerie médicale')}</p></div></div><div className="mt-4 flex flex-wrap gap-2">{[t('MRI','IRM'),t('Ultrasound','Échographie'),t('CT scan','Scanner')].map(service=><span key={service} className="rounded-lg bg-[var(--surface-muted)] px-3 py-1.5 text-xs">{service}</span>)}</div><div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4 text-sm font-semibold text-[var(--brand-primary-hover)]"><span>{t('Online appointment requests', 'Demandes de rendez-vous en ligne')}</span><ArrowUpRight size={18} className="shrink-0"/></div></div>
          </div>
        </article>
        <article className={card}>
          <div className="mb-5 flex items-center gap-3"><Users className="text-[var(--brand-primary-hover)]" size={21}/><h3 className="text-xl font-semibold">{t('Team Coordination', 'Coordination de l’équipe')}</h3></div>
          <p className="mb-7 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">{t('Give every request a clear next step, from the first contact to the appointment reminder.', 'Donnez à chaque demande une prochaine étape claire, du premier contact au rappel du rendez-vous.')}</p>
          <div className={preview}>
            <p className={label}>{t('Example patient journey', 'Exemple de parcours patient')}</p>
            <ol className="mt-5 space-y-3">
              {[[CalendarDays,t('Request received','Demande reçue'),t(`Ultrasound · Monday, ${slot}`,`Échographie · Lundi, ${slot}`)],[CheckCircle2,t('Appointment confirmed','Rendez-vous confirmé'),t('Time agreed with the patient','Créneau convenu avec le patient')],[Clock3,t('Follow-up planned','Suivi prévu'),t('Reminder before the appointment','Rappel avant le rendez-vous')]].map(([Icon,title,detail],index)=>{const StepIcon=Icon as typeof CalendarDays;return <li key={String(title)} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary-10)] text-[var(--brand-primary-hover)]"><StepIcon size={17}/></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{String(title)}</p><p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">{String(detail)}</p></div>{index<2?<Check size={16} className="shrink-0 text-[var(--brand-primary-hover)]"/>:<ArrowRight size={16} className="shrink-0 text-[var(--text-secondary)]"/>}</li>;})}
            </ol>
          </div>
        </article>
      </div>
    </div>
  </section>;
}
