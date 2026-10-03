import { LeadConfirmation } from './LeadConfirmation';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowRight, CalendarCheck2, Check, ChevronDown, ClipboardList, MessageCircle, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

type Language = 'en' | 'fr';
import { captureAttribution, submitLead } from './leads/client';

const content = {
  en: {
    eyebrow: 'BUILT FOR MEDICAL CENTERS',
    journey: 'From first search to confirmed visit.',
    journeyBody: 'Patients need a clear next step. Your team needs one place to receive and manage requests. Clinahir connects both sides of that journey.',
    stages: [
      ['01 / BE FOUND', 'Help local patients find you', 'Clear service pages, a mobile friendly website, and Google visibility make your center easier to discover.'],
      ['02 / MAKE BOOKING SIMPLE', 'Turn interest into a request', 'Give patients a straightforward way to ask for an appointment, including outside opening hours.'],
      ['03 / KEEP THE TEAM ALIGNED', 'Move every request forward', 'See new requests, update their status, and keep schedules and center activity in one workspace.'],
    ],
    cta: 'See it for your center',
    proofEyebrow: 'SEE THE PRODUCT, THEN THE PLAN',
    proofTitle: 'A useful demo, not a slide deck.',
    proofBody: 'Explore the interactive admin dashboard above. Its records and metrics are illustrative. In a call, we can map your current patient journey and show which parts of Clinahir would fit your center.',
    proofPoints: ['Walk through the request and scheduling workflow', 'Identify the biggest friction in your current process', 'Leave with a scoped next step for your center'],
    processEyebrow: 'HOW WE WORK',
    processTitle: 'Clear steps from discovery to launch.',
    process: [
      ['01', 'Understand your center', 'We review your services, current website, appointment process, and team responsibilities.'],
      ['02', 'Define the scope', 'You receive a proposal for the platform and growth support that match your needs.'],
      ['03', 'Build and prepare', 'We set up the agreed experience and help your team prepare for the new workflow.'],
      ['04', 'Launch and improve', 'We confirm the support and maintenance plan before launch, then refine from real feedback.'],
    ],
    fitTitle: 'Choose the conversation that fits your starting point.',
    fits: [
      ['Digital foundation', 'Your center needs a clearer website and an easier way to receive appointment requests.', 'Website · service pages · booking flow · dashboard'],
      ['Visibility and growth', 'You have a digital presence and want more qualified local demand.', 'Google visibility · SEO · campaign planning'],
      ['Full patient journey', 'You want the public website, booking, and internal workflow to work together.', 'Discovery · booking · team workflow · growth'],
    ],
    fitNote: 'Every center has a different starting point. Scope, timing, and pricing are defined in a tailored proposal.',
    aboutEyebrow: 'ABOUT CLINAHIR',
    aboutTitle: 'Digital systems for medical centers in Morocco.',
    aboutBody: 'Clinahir brings the public facing patient experience and the team’s appointment workflow into one plan. We focus on clear service information, easier booking, and practical tools your center can use day to day.',
    aboutNote: 'The dashboard on this page is an interactive product demo with sample records. It is not a claim about live client results.',
    formEyebrow: 'START A CONVERSATION',
    formTitle: 'Show us where your center is today.',
    formBody: 'Tell us a little about your center and your main challenge. We’ll use that context to make the demo relevant to you.',
    fields: ['Center name', 'Your role', 'City', 'Work email', 'Phone number', 'What would you most like to improve?'],
    rolePlaceholder: 'Select your role',
    roles: ['Owner / director', 'Center manager', 'Operations / administration', 'Other decision maker'],
    challengePlaceholder: 'Choose a priority',
    challenges: ['More appointment requests', 'Easier booking and follow-up', 'A stronger website and local visibility', 'A connected end-to-end workflow'],
    privacy: 'Please do not include patient or medical information.',
    submit: 'Request a tailored demo',
    pending: 'The contact service is being connected. This form is ready for review but cannot send a request yet.',
    sending: 'Sending…',
    success: 'Your request was sent. We’ll be in touch about a tailored demo.',
    error: 'The request could not be sent. Please try again.',
  },
  fr: {
    eyebrow: 'CONÇU POUR LES CENTRES MÉDICAUX', journey: 'De la première recherche au rendez-vous confirmé.', journeyBody: 'Les patients ont besoin d’une prochaine étape claire. Votre équipe a besoin d’un endroit unique pour traiter les demandes. Clinahir relie les deux.',
    stages: [
      ['01 / ÊTRE TROUVÉ', 'Aidez les patients à vous trouver', 'Des pages de services claires, un site adapté au mobile et une meilleure visibilité sur Google.'],
      ['02 / FACILITER LA PRISE DE RDV', 'Transformez l’intérêt en demande', 'Permettez aux patients de demander un rendez-vous simplement, même hors des heures d’ouverture.'],
      ['03 / COORDONNER L’ÉQUIPE', 'Faites avancer chaque demande', 'Consultez les demandes, modifiez leur statut et suivez les plannings dans un même espace.'],
    ],
    cta: 'Voir Clinahir pour votre centre', proofEyebrow: 'VOYEZ LE PRODUIT ET LE PLAN', proofTitle: 'Une démonstration utile, pas un diaporama.', proofBody: 'Explorez le tableau de bord interactif ci-dessus. Ses données sont fictives. Lors d’un échange, nous pouvons examiner votre parcours patient actuel et les éléments de Clinahir adaptés à votre centre.',
    proofPoints: ['Parcourir les demandes et le planning', 'Repérer les difficultés du processus actuel', 'Définir une prochaine étape adaptée à votre centre'],
    processEyebrow: 'NOTRE MÉTHODE', processTitle: 'Des étapes claires jusqu’au lancement.',
    process: [['01', 'Comprendre votre centre', 'Nous examinons vos services, votre site, la gestion des rendez-vous et les rôles de l’équipe.'], ['02', 'Définir le périmètre', 'Vous recevez une proposition adaptée pour la plateforme et l’accompagnement.'], ['03', 'Créer et préparer', 'Nous configurons l’expérience convenue et préparons votre équipe au nouveau processus.'], ['04', 'Lancer et améliorer', 'Nous confirmons le plan de support avant le lancement, puis améliorons selon les retours.']],
    fitTitle: 'Commençons par votre priorité.',
    fits: [['Fondation numérique', 'Votre centre a besoin d’un site plus clair et d’un moyen simple de recevoir des demandes.', 'Site · services · prise de RDV · tableau de bord'], ['Visibilité et croissance', 'Vous avez déjà une présence numérique et souhaitez attirer davantage de demandes locales.', 'Google · SEO · campagnes'], ['Parcours patient complet', 'Vous souhaitez relier le site, les rendez-vous et le travail de votre équipe.', 'Découverte · réservation · équipe · croissance']],
    fitNote: 'Chaque centre a un point de départ différent. Le périmètre, les délais et le tarif sont définis dans une proposition personnalisée.',
    aboutEyebrow: 'À PROPOS DE CLINAHIR', aboutTitle: 'Des outils numériques pour les centres médicaux au Maroc.', aboutBody: 'Clinahir réunit le parcours public du patient et la gestion des rendez-vous par l’équipe dans un même projet. Nous privilégions des informations claires, une prise de rendez-vous simple et des outils pratiques au quotidien.', aboutNote: 'Le tableau de bord est une démonstration interactive avec des données fictives. Il ne présente pas des résultats clients réels.',
    formEyebrow: 'PRENONS CONTACT', formTitle: 'Parlez-nous de votre centre.', formBody: 'Quelques informations sur votre centre et votre priorité nous aideront à préparer une démonstration pertinente.',
    fields: ['Nom du centre', 'Votre rôle', 'Ville', 'E-mail professionnel', 'Numéro de téléphone', 'Quelle est votre priorité ?'], rolePlaceholder: 'Sélectionnez votre rôle', roles: ['Propriétaire / direction', 'Responsable du centre', 'Opérations / administration', 'Autre décideur'], challengePlaceholder: 'Choisissez une priorité', challenges: ['Recevoir plus de demandes de RDV', 'Simplifier la prise de RDV et le suivi', 'Améliorer le site et la visibilité locale', 'Relier tout le parcours patient'],
    privacy: 'N’incluez aucune information médicale ou sur les patients.', submit: 'Demander une démo personnalisée', pending: 'Le service de contact est en cours de connexion. Le formulaire est prêt, mais l’envoi n’est pas encore disponible.', sending: 'Envoi…', success: 'Votre demande a été envoyée. Nous vous contacterons pour une démonstration adaptée.', error: 'La demande n’a pas pu être envoyée. Veuillez réessayer.',
  },
} as const;

const inputClass = 'w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-[var(--text-primary)] outline-none transition focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary-10)]';

function FormDropdown({ id, name, label, placeholder, options, value, onChange, invalid }: { id: string; name: string; label: string; placeholder: string; options: readonly string[]; value: string; onChange: (value: string) => void; invalid?: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', closeOutside);
    optionRefs.current[Math.max(0, options.indexOf(value))]?.focus();
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open, options, value]);
  const choose = (next: string) => { onChange(next); setOpen(false); requestAnimationFrame(() => triggerRef.current?.focus()); };
  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = optionRefs.current.findIndex(element => element === document.activeElement);
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); triggerRef.current?.focus(); }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); optionRefs.current[(index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length]?.focus(); }
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); optionRefs.current[event.key === 'Home' ? 0 : options.length - 1]?.focus(); }
  };
  return <div ref={rootRef} className="relative min-w-0">
    <span id={`${id}-label`} className="mb-2 block text-sm font-semibold">{label}</span>
    <input type="hidden" name={name} value={value} />
    <button ref={triggerRef} id={id} type="button" aria-labelledby={`${id}-label ${id}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-options`} aria-invalid={invalid || undefined} onClick={() => setOpen(!open)} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); } }} className={`${inputClass} flex min-h-[52px] items-center justify-between gap-3 text-left font-medium ${!value ? 'text-[var(--text-secondary)]' : ''} ${invalid ? 'border-red-500' : ''}`}>
      <span className="truncate">{value || placeholder}</span><ChevronDown size={18} className={`shrink-0 text-[var(--text-secondary)] transition-transform ${open ? 'rotate-180' : ''}`}/>
    </button>
    {open && <div id={`${id}-options`} role="listbox" aria-labelledby={`${id}-label`} onKeyDown={onMenuKeyDown} className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-1.5 shadow-[0_22px_50px_rgba(0,0,0,.16)]">
      {options.map((option, index) => <button key={option} ref={element => { optionRefs.current[index] = element; }} type="button" role="option" aria-selected={value === option} onClick={() => choose(option)} className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition hover:bg-[var(--brand-primary-10)] focus:bg-[var(--brand-primary-10)] focus:outline-none ${value === option ? 'bg-[var(--brand-primary-10)] text-[var(--brand-primary-hover)]' : 'text-[var(--text-strong)]'}`}><span>{option}</span>{value === option && <Check size={16} className="shrink-0"/>}</button>)}
    </div>}
  </div>;
}

export default function LandingSections({ language = 'en' }: { language?: Language }) {
  const t = content[language];
  const reducedMotion = useReducedMotion();
  const sectionReveal = reducedMotion ? {} : {
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.08 },
    transition: { duration: 0.58, ease: 'easeOut' as const },
  };
  useEffect(() => { captureAttribution(); }, []);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [role, setRole] = useState('');
  const [priority, setPriority] = useState('');
  const [selectionError, setSelectionError] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    const form = event.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (!role || !priority) { setSelectionError(true); return; }
    const body = new FormData(form);
    setStatus('sending');
    try {
      await submitLead(body);
      form.reset();
      setRole(''); setPriority(''); setSelectionError(false);
      setStatus('success');
      setConfirmationOpen(true);
    } catch { setStatus('error'); }
  }

  return <>
    <LeadConfirmation open={confirmationOpen} language={language} onClose={() => setConfirmationOpen(false)}/>
    <motion.section {...sectionReveal} className="marketing-proof px-6 py-24"><div className="mx-auto grid max-w-6xl gap-10 rounded-[36px] border border-[var(--border)] bg-white p-8 shadow-[0_24px_70px_rgba(0,0,0,.05)] md:grid-cols-[1.2fr_.8fr] md:p-12"><div><p className="mb-4 text-xs font-bold tracking-[0.2em] text-[var(--brand-primary-hover)]">{t.proofEyebrow}</p><h2 className="mb-5 text-4xl font-semibold tracking-tight">{t.proofTitle}</h2><p className="max-w-xl text-lg leading-relaxed text-[var(--text-body)]">{t.proofBody}</p><a href="#interactive-demo" className="mt-7 inline-flex items-center gap-2 font-semibold text-[var(--brand-primary-hover)] underline underline-offset-4">{language === 'fr' ? 'Explorer la démo interactive' : 'Explore the interactive demo'}<ArrowRight size={17}/></a></div><div className="flex flex-col justify-center gap-4">{t.proofPoints.map((point) => <div key={point} className="flex gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"><Check className="mt-0.5 shrink-0 text-[var(--brand-primary)]" size={19}/><span className="font-medium text-[var(--text-strong)]">{point}</span></div>)}</div></div></motion.section>

    <motion.section {...sectionReveal} id="process" className="marketing-process scroll-mt-8 px-6 py-28"><div className="mx-auto max-w-6xl"><p className="mb-4 text-xs font-bold tracking-[0.2em] text-[var(--brand-primary-hover)]">{t.processEyebrow}</p><h2 className="mb-12 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">{t.processTitle}</h2><div className="grid gap-4 md:grid-cols-4">{t.process.map(([number,title,body]) => <article key={number} className="border-t-2 border-[var(--brand-primary)] pt-6"><span className="mb-8 block text-sm font-bold text-[var(--brand-primary-hover)]">{number}</span><h3 className="mb-3 text-xl font-semibold">{title}</h3><p className="leading-relaxed text-[var(--text-body)]">{body}</p></article>)}</div></div></motion.section>

    <motion.section {...sectionReveal} className="marketing-fit px-6 py-28"><div className="mx-auto max-w-6xl"><h2 className="mb-10 max-w-3xl text-4xl font-semibold tracking-tight">{t.fitTitle}</h2><div className="grid gap-4 md:grid-cols-3">{t.fits.map(([title,body,scope]) => <article key={title} className="flex flex-col rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm"><div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-primary-10)] text-[var(--brand-primary-hover)]"><Sparkles size={23}/></div><h3 className="mb-3 text-2xl font-semibold">{title}</h3><p className="mb-8 flex-1 leading-relaxed text-[var(--text-body)]">{body}</p><p className="border-t border-[var(--border)] pt-5 text-sm font-medium text-[var(--brand-primary-hover)]">{scope}</p></article>)}</div><p className="mt-6 text-sm text-[var(--text-body)]">{t.fitNote}</p></div></motion.section>

    <motion.section {...sectionReveal} id="about" className="marketing-about scroll-mt-8 px-6 py-28 text-white"><div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center"><div><p className="mb-4 text-xs font-bold tracking-[0.2em] text-[var(--brand-primary)]">{t.aboutEyebrow}</p><h2 className="text-4xl font-semibold tracking-tight md:text-5xl">{t.aboutTitle}</h2></div><div><p className="mb-6 text-lg leading-relaxed text-white/75">{t.aboutBody}</p><div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-5 text-sm leading-relaxed text-white/70"><ShieldCheck size={20} className="shrink-0 text-[var(--brand-primary)]"/>{t.aboutNote}</div></div></div></motion.section>

    <motion.section {...sectionReveal} id="book-demo" className="marketing-form scroll-mt-8 px-6 py-28"><div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[.85fr_1.15fr]"><div><p className="mb-4 text-xs font-bold tracking-[0.2em] text-[var(--brand-primary-hover)]">{t.formEyebrow}</p><h2 className="mb-5 text-4xl font-semibold tracking-tight md:text-5xl">{t.formTitle}</h2><p className="text-lg leading-relaxed text-[var(--text-body)]">{t.formBody}</p><div className="mt-9 flex items-center gap-3 rounded-2xl bg-[var(--surface-muted)] p-5 text-sm text-[var(--text-body)]"><MessageCircle className="shrink-0 text-[var(--brand-primary)]"/>{t.privacy}</div></div><form noValidate onSubmit={submit} className="rounded-[32px] border border-[var(--border)] bg-[var(--surface-muted)] p-6 shadow-[0_24px_70px_rgba(0,0,0,.06)] md:p-9"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">{t.fields[0]}<input className={inputClass+' mt-2'} name="center_name" required autoComplete="organization"/></label><FormDropdown id="demo-role" name="role" label={t.fields[1]} placeholder={t.rolePlaceholder} options={t.roles} value={role} onChange={value => { setRole(value); setSelectionError(false); }} invalid={selectionError && !role}/><label className="text-sm font-semibold">{t.fields[2]}<input className={inputClass+' mt-2'} name="city" required autoComplete="address-level2"/></label><label className="text-sm font-semibold">{t.fields[3]}<input className={inputClass+' mt-2'} name="email" type="email" required autoComplete="email"/></label><label className="text-sm font-semibold sm:col-span-2">{t.fields[4]}<input className={inputClass+' mt-2'} name="phone" type="tel" required autoComplete="tel"/></label><div className="sm:col-span-2"><FormDropdown id="demo-priority" name="priority" label={t.fields[5]} placeholder={t.challengePlaceholder} options={t.challenges} value={priority} onChange={value => { setPriority(value); setSelectionError(false); }} invalid={selectionError && !priority}/></div></div>{selectionError && <p role="alert" className="mt-4 text-sm font-medium text-red-600">{language === 'fr' ? 'Sélectionnez votre rôle et votre priorité.' : 'Select your role and priority.'}</p>}<button type="submit" disabled={status === 'sending'} className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-primary)] px-6 py-4 font-bold text-white transition hover:bg-[var(--brand-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-55">{status === 'sending' ? t.sending : t.submit}<ArrowRight size={18}/></button><p aria-live="polite" className="mt-4 text-sm text-[var(--text-body)]">{status === 'success' ? t.success : status === 'error' ? t.error : t.privacy}</p></form></div></motion.section>
  </>;
}
