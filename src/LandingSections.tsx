import React, { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { 
  ArrowRight, 
  CalendarCheck2, 
  Check, 
  ChevronDown, 
  ClipboardList, 
  Search, 
  ShieldCheck, 
  Building2, 
  Stethoscope, 
  Users, 
  Sliders, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Lock, 
  Zap,
  Activity,
  Award,
  PhoneCall
} from 'lucide-react';
import { landingDefaults as content, demoCta } from './content/landing';
import { useManagedCopy, useSiteContent } from './content/SiteContent';
import { PrivacyLink } from './PrivacyNotice';
import { LeadConfirmation } from './LeadConfirmation';
import { captureAttribution, submitLead } from './leads/client';

type Language = 'en' | 'fr';

const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-white/40 outline-none transition focus:border-[#01bc7c] focus:ring-4 focus:ring-[#01bc7c]/20';

function FormDropdown({
  id,
  name,
  label,
  placeholder,
  options,
  value,
  onChange,
  invalid
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    optionRefs.current[Math.max(0, options.indexOf(value))]?.focus();
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open, options, value]);

  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = optionRefs.current.findIndex(element => element === document.activeElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      optionRefs.current[(index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length]?.focus();
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      optionRefs.current[event.key === 'Home' ? 0 : options.length - 1]?.focus();
    }
  };

  return (
    <div ref={rootRef} className="relative min-w-0">
      <span id={`${id}-label`} className="mb-2 block text-xs font-semibold tracking-wide text-white/80">
        {label}
      </span>
      <input type="hidden" name={name} value={value} />
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-labelledby={`${id}-label ${id}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? "selection-error" : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={`${inputClass} flex min-h-[52px] items-center justify-between gap-3 text-left font-medium ${
          !value ? 'text-white/40' : 'text-white'
        } ${invalid ? 'border-red-500' : ''}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={18} className={`shrink-0 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          id={`${id}-options`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          onKeyDown={onMenuKeyDown}
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/15 bg-[#121a15] p-1.5 shadow-[0_22px_50px_rgba(0,0,0,.6)] backdrop-blur-2xl"
        >
          {options.map((option, index) => (
            <button
              key={option}
              ref={element => { optionRefs.current[index] = element; }}
              type="button"
              role="option"
              aria-selected={value === option}
              onClick={() => choose(option)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-xs font-semibold transition hover:bg-[#01bc7c]/20 focus:bg-[#01bc7c]/20 focus:outline-none ${
                value === option ? 'bg-[#01bc7c]/25 text-white' : 'text-white/80'
              }`}
            >
              <span>{option}</span>
              {value === option && <Check size={14} className="shrink-0 text-[#01bc7c]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function LandingSections({ language = 'en' }: { language?: Language }) {
  const fr = language === 'fr';
  const t = useManagedCopy('landing', content[language], language);
  const { document: site } = useSiteContent();

  useEffect(() => { captureAttribution(); }, []);

  // Form State
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [role, setRole] = useState('');
  const [priority, setPriority] = useState('');
  const [selectionError, setSelectionError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Interactive ROI Calculator State
  const [dailyScans, setDailyScans] = useState<number>(45);
  const [selectedModalityFocus, setSelectedModalityFocus] = useState<'mri_ct' | 'all'>('mri_ct');

  // Calculate dynamic ROI values
  // Assuming average ticket in Morocco: MRI ~ 1,400 MAD, CT ~ 1,100 MAD, Ultrasound ~ 450 MAD. Average weighted ~ 1,150 MAD
  const averageScanTicketMAD = selectedModalityFocus === 'mri_ct' ? 1350 : 850;
  const monthlyScans = dailyScans * 26; // 26 working days
  const recoveredNoShowsMonthly = Math.round(monthlyScans * 0.18); // 18% reduction in missed scans
  const recoveredRevenueMAD = recoveredNoShowsMonthly * averageScanTicketMAD;
  const newAppointmentsCaptured = Math.round(monthlyScans * 0.28); // 28% incremental demand via SEO + 24/7 booking
  const hoursSavedWeekly = Math.round((dailyScans * 5 * 26) / (60 * 4)); // ~5 min saved per patient triage / reception call

  useEffect(() => {
    const other = language === 'fr' ? content.en : content.fr;
    setPriority(value => {
      const index = other.challenges.findIndex(item => item === value);
      return index >= 0 ? content[language].challenges[index] : value;
    });
    setRole(value => {
      const index = other.roles.findIndex(item => item === value);
      return index >= 0 ? content[language].roles[index] : value;
    });
    setFieldErrors({});
  }, [language]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    const form = event.currentTarget;
    const errors: Record<string, string> = {};

    for (const node of Array.from(form.elements)) {
      if (node instanceof HTMLInputElement && (!node.validity.valid || (node.required && !node.value.trim()))) {
        errors[node.name] = language === 'fr'
          ? ((node.validity.typeMismatch || node.validity.patternMismatch)
              ? 'Indiquez un numéro WhatsApp avec indicatif (+212...)'
              : 'Veuillez remplir ce champ.')
          : ((node.validity.typeMismatch || node.validity.patternMismatch)
              ? 'Enter a WhatsApp number with country code (+212...)'
              : 'Complete this field.');
      }
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      (form.elements.namedItem(Object.keys(errors)[0]) as HTMLElement)?.focus();
      return;
    }

    if (!role || !priority) {
      setSelectionError(true);
      requestAnimationFrame(() => document.getElementById(!role ? "demo-role" : "demo-priority")?.focus());
      return;
    }

    const body = new FormData(form);
    setStatus('sending');

    try {
      await submitLead(body);
      form.reset();
      setRole('');
      setPriority('');
      setSelectionError(false);
      setStatus('success');
      setConfirmationOpen(true);
    } catch { setStatus('error'); }
  }

  return (
    <>
      <LeadConfirmation
        returnFocusRef={submitButtonRef}
        open={confirmationOpen}
        language={language}
        onClose={() => setConfirmationOpen(false)}
      />

      {/* ========================================================================= */}
      {/* 1. INTERACTIVE CLINICAL CAPACITY & ROI SIMULATOR (Apple Pro Style)        */}
      {/* ========================================================================= */}
      <section className="relative bg-[#070b09] px-6 py-24 text-white md:px-12">
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-400">
              <Sliders size={13} />
              {fr ? 'Scénario de capacité illustratif' : 'Illustrative capacity scenario'}
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {fr ? (
                <>Calculez la capacité révélée <br className="hidden sm:inline" /><span className="text-white/60">de votre centre</span></>
              ) : (
                <>Measure the unlocked potential <br className="hidden sm:inline" /><span className="text-white/60">of your practice</span></>
              )}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/65">
              {fr ? (
                'Explorez un scénario fictif à partir d’hypothèses explicites. Ce calcul ne représente ni des résultats clients ni une prévision pour votre centre.'
              ) : (
                'Explore a fictional scenario with explicit assumptions. This calculator shows neither customer results nor a forecast for your center.'
              )}
            </p>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-2xl sm:p-10 lg:p-12">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              
              {/* Controls Column (Span 6) */}
              <div className="space-y-8 lg:col-span-6">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <label htmlFor="daily-scans-slider" className="font-semibold text-white">
                      {fr ? 'Examens d\'imagerie par jour :' : 'Daily imaging scans performed:'}
                    </label>
                    <span className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-1 font-mono text-base font-bold text-[#01bc7c]">
                      {dailyScans} {fr ? 'patients / jour' : 'scans / day'}
                    </span>
                  </div>

                  <input
                    id="daily-scans-slider"
                    type="range"
                    min="15"
                    max="120"
                    step="5"
                    value={dailyScans}
                    onChange={e => setDailyScans(Number(e.target.value))}
                    className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/15 accent-[#01bc7c]"
                  />
                  <div className="mt-2 flex justify-between text-[11px] text-white/40">
                    <span>15 ({fr ? 'Cabinet spécialisé' : 'Boutique center'})</span>
                    <span>60 ({fr ? 'Centre moyen' : 'Medium center'})</span>
                    <span>120+ ({fr ? 'Grande clinique' : 'Large hospital'})</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-white/50">
                    {fr ? 'Profil principal des équipements :' : 'Equipment & modality focus:'}
                  </label>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedModalityFocus('mri_ct')}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selectedModalityFocus === 'mri_ct' 
                          ? 'border-[#01bc7c] bg-[#01bc7c]/15 text-white' 
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-white block">IRM & Scanner TDM</span>
                      <span className="text-[11px] text-white/50 mt-1 block">
                        {fr ? 'Haute valeur par examen' : 'High capital utilization'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedModalityFocus('all')}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selectedModalityFocus === 'all' 
                          ? 'border-[#01bc7c] bg-[#01bc7c]/15 text-white' 
                          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-white block">Centre Polyvalent</span>
                      <span className="text-[11px] text-white/50 mt-1 block">
                        {fr ? 'Écho, Mammo, Radio, Scanner' : 'Ultrasound, X-Ray, CT, Mammo'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white/70">
                  <span className="font-semibold text-white">{fr ? 'Méthodologie de calcul :' : 'Projection methodology:'}</span>{' '}
                  {fr ? (
                    'Hypothèses fictives : 26 jours par mois, 18% de créneaux récupérés, 28% de demandes supplémentaires et 5 minutes par appel. Montant par examen : 1 350 ou 850 MAD selon le scénario. Aucune donnée clinique ou étude de marché n’est utilisée.'
                  ) : (
                    'Fictional assumptions: 26 days per month, 18% recovered slots, 28% additional requests and 5 minutes per call. Amount per examination: 1,350 or 850 MAD depending on the scenario. No clinical data or market study is used.'
                  )}
                </div>
              </div>

              {/* Dynamic Output Cards (Span 6) */}
              <div className="space-y-4 lg:col-span-6">
                
                <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-emerald-950/20 to-black/60 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-xs font-medium text-emerald-400">
                    <span>{fr ? 'Revenu hypothétique du scénario' : 'Hypothetical scenario revenue'}</span>
                    <Sparkles size={16} />
                  </div>
                  <div className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    +{recoveredRevenueMAD.toLocaleString('fr-FR')} <span className="text-2xl font-normal text-emerald-300">MAD / mois</span>
                  </div>
                  <p className="mt-2 text-xs text-emerald-200/80">
                    {fr ? (
                      `Soit environ ${recoveredNoShowsMonthly} créneaux d'examens qui ne restent plus vides grâce au rappel WhatsApp.`
                    ) : (
                      `Equivalent to ~${recoveredNoShowsMonthly} diagnostic slots saved from remaining empty every month.`
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                    <span className="text-xs text-white/50">{fr ? 'Demandes supplémentaires hypothétiques' : 'Hypothetical additional requests'}</span>
                    <div className="mt-1 text-2xl font-bold text-white">
                      +{newAppointmentsCaptured}
                    </div>
                    <p className="mt-1 text-[11px] text-white/40">
                      {fr ? 'Via Google Maps & Web 24h/24' : 'Via local SEO & 24/7 web'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                    <span className="text-xs text-white/50">{fr ? 'Temps Secrétariat Économisé' : 'Staff Hours Saved'}</span>
                    <div className="mt-1 text-2xl font-bold text-emerald-400">
                      ~{hoursSavedWeekly}h / sem.
                    </div>
                    <p className="mt-1 text-[11px] text-white/40">
                      {fr ? 'Moins d’appels répétés' : 'Less phone friction'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <a
                    href="#book-demo" data-i18n-managed="true"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold text-black transition hover:bg-white/90"
                  >
                    <span>{demoCta[language]}</span>
                    <ArrowRight size={14} />
                  </a>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE CLINAHIR OPERATING STANDARD (Comparison Matrix)                    */}
      {/* ========================================================================= */}
      <section className="relative bg-[#0a0f0d] px-6 py-24 text-white md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-emerald-400">
              <Award size={13} />
              {fr ? 'Comparatif opérationnel' : 'Operational standard'}
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {fr ? (
                <>Pourquoi les centres modernes <br className="hidden sm:inline" /><span className="text-white/60">quittent le standard téléphonique</span></>
              ) : (
                <>Why modern centers <br className="hidden sm:inline" /><span className="text-white/60">leave manual phone triage behind</span></>
              )}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Legacy Approach */}
            <div className="rounded-[32px] border border-red-500/20 bg-red-950/10 p-7 backdrop-blur-xl sm:p-9">
              <div className="flex items-center gap-2 text-xs font-medium text-red-400">
                <XCircle size={16} />
                <span>{fr ? 'Fonctionnement Traditionnel' : 'Traditional Practice'}</span>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {fr ? 'Goulot d’étranglement téléphonique & perte de créneaux' : 'Phone congestion & uncoordinated agendas'}
              </h3>
              
              <ul className="mt-6 space-y-4 text-xs text-white/70">
                <li className="flex items-start gap-2.5">
                  <XCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                  <span>{fr ? 'Une ligne occupée peut retarder les demandes de rendez-vous.' : 'A busy phone line can delay appointment requests.'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                  <span>{fr ? 'Des rendez-vous non confirmés peuvent laisser des créneaux inutilisés.' : 'Unconfirmed appointments can leave unused slots.'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                  <span>{fr ? 'Patients arrivant sans préparation (non à jeun, créatinine manquante), entraînant des retards.' : 'Patients arrive unprepared (no fasting, missing labs), creating room delays.'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                  <span>{fr ? 'Absence de visibilité sur Google Maps : les patients se tournent vers les concurrents.' : 'Invisible on Google Maps: nearby patients book with visible competitor centers.'}</span>
                </li>
              </ul>
            </div>

            {/* Clinahir Connected Center */}
            <div className="rounded-[32px] border border-emerald-500/40 bg-emerald-950/20 p-7 backdrop-blur-xl sm:p-9 shadow-2xl shadow-emerald-950/30">
              <div className="flex items-center gap-2 text-xs font-medium text-[#01bc7c]">
                <CheckCircle2 size={16} />
                <span>{fr ? 'Le Standard Connecté Clinahir' : 'The Clinahir Connected Standard'}</span>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-white">
                {fr ? 'Flux patient continu 24h/24 & coordination zéro friction' : 'Continuous 24/7 flow & zero-friction coordination'}
              </h3>
              
              <ul className="mt-6 space-y-4 text-xs text-white/85">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#01bc7c]" />
                  <span>{fr ? 'Démonstration de prise de rendez-vous en ligne ; aucun document médical à transmettre.' : 'Online appointment demonstration; do not submit medical documents.'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#01bc7c]" />
                  <span>{fr ? 'Concept de rappels WhatsApp, sous réserve de configuration et de validation.' : 'WhatsApp reminder concept, subject to configuration and verification.'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#01bc7c]" />
                  <span>{fr ? 'Les consignes médicales restent définies et validées par votre équipe soignante.' : 'Medical preparation instructions remain defined and approved by your clinical team.'}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#01bc7c]" />
                  <span>{fr ? 'Accompagnement de la visibilité locale, sans garantie de classement.' : 'Local visibility support, without a ranking guarantee.'}</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THE 14-DAY CLINICAL DEPLOYMENT PROTOCOL (#process)                      */}
      {/* ========================================================================= */}
      <section id="process" className="scroll-mt-12 bg-[#080d0a] px-6 py-28 text-white md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center md:text-left">
            <span className="text-xs font-medium text-[#01bc7c]">
              {fr ? 'Méthodologie de Déploiement' : 'Deployment Protocol'}
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {t.processTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-base text-white/70">
              {fr ? 'Le calendrier de déploiement et les dépendances sont convenus dans une proposition adaptée à votre centre.' : 'The deployment schedule and dependencies are agreed in a proposal tailored to your center.'}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            {t.process.map(([number, title, body], index) => (
              <div 
                key={number}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition hover:border-[#01bc7c]/40 hover:bg-white/[0.05]"
              >
                <div>
                  <span className="text-xs font-medium text-[#01bc7c]">
                    {fr ? `Phase ${number}` : `Phase ${number}`}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/65">
                    {body}
                  </p>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <span className="text-[11px] font-semibold text-white/90">
                    {t.processOutputs[index]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. TAILORED PARTNERSHIP MODELS (#fit)                                     */}
      {/* ========================================================================= */}
      <section className="scroll-mt-12 bg-[#090e0b] px-6 py-28 text-white md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {t.fitTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-white/60">
              {t.fitNote}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {t.fits.map(([title, body, scope], index) => {
              const FitIcon = index === 0 ? Building2 : index === 1 ? Search : Stethoscope;
              const isPopular = index === 2;
              return (
                <div
                  key={title}
                  className={`relative flex flex-col justify-between overflow-hidden rounded-[32px] border p-7 backdrop-blur-2xl transition hover:scale-[1.01] ${
                    isPopular 
                      ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/30 to-black/60 shadow-2xl shadow-emerald-950/40' 
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute top-4 right-4 rounded-full bg-[#01bc7c] px-3 py-0.5 text-[10px] font-bold text-white">
                      {fr ? 'Recommandé' : 'Most Popular'}
                    </span>
                  )}

                  <div>
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#01bc7c]">
                      <FitIcon size={22} />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {title}
                    </h3>
                    <p className="mt-3 text-xs leading-relaxed text-white/70">
                      {body}
                    </p>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-5">
                    <p className="text-[11px] font-semibold text-[#01bc7c]">
                      {scope.replace(/ · /g, ', ')}
                    </p>
                    <a
                      href="#book-demo" data-i18n-managed="true"
                      onClick={() => {
                        setPriority(t.challenges[[2, 0, 3][index]]);
                        setSelectionError(false);
                      }}
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-[#01bc7c]"
                    >
                      <span>{demoCta[language]}</span>
                      <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ABOUT CLINAHIR MEDICAL (#about)                                        */}
      {/* ========================================================================= */}
      <section id="about" className="scroll-mt-12 bg-[#060907] px-6 py-28 text-white md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
          <div>
            <span className="text-xs font-medium text-[#01bc7c]">
              {t.aboutEyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {t.aboutTitle}
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/75">
              {t.aboutBody}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-xs leading-relaxed text-white/70 backdrop-blur-xl">
              <ShieldCheck size={20} className="shrink-0 text-[#01bc7c]" />
              <span>{t.aboutNote}</span>
            </div>

            {site.settings.sections.client && (
              <a
                href="#client-project"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                <span>{fr ? 'Découvrir notre réalisation client' : 'Explore our client showcase'}</span>
                <ArrowRight size={14} />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. THE EXECUTIVE VIP CONSULTATION TERMINAL (#book-demo)                   */}
      {/* ========================================================================= */}
      <section id="book-demo" data-i18n-managed="true" className="scroll-mt-12 bg-[#11583f] px-6 py-20 text-white md:px-12 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          
          {/* Left Context Information */}
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {demoCta[language]}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/85">{t.formBody}</p>
            <ul className="mt-8 divide-y divide-white/20 border-y border-white/20">
              {(fr ? [
                'Un aperçu du parcours de prise de rendez-vous de votre centre',
                'Une démonstration du tableau de bord Clinahir',
                'Une prochaine étape adaptée à votre centre, avec un périmètre clair',
              ] : [
                'A walkthrough of your center’s booking flow',
                'A demo of the Clinahir dashboard',
                'A scoped next step for your center',
              ]).map(item => (
                <li key={item} className="flex items-start gap-3 py-4 text-sm leading-relaxed text-white">
                  <Check size={17} className="mt-0.5 shrink-0 text-[#a7f2c9]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 flex items-center gap-2 text-sm text-white/80">
              <Lock size={14} className="shrink-0" aria-hidden="true" />{t.privacy}
            </p>
          </div>

          {/* Right Consultation Form */}
          <form
            noValidate
            onInput={event => {
              const node = event.target;
              if (node instanceof HTMLInputElement && node.validity.valid) {
                setFieldErrors(errors => {
                  const next = { ...errors };
                  delete next[node.name];
                  return next;
                });
              }
            }}
            onSubmit={submit}
            className="rounded-[32px] border border-white/20 bg-[#0c3024] p-5 shadow-2xl backdrop-blur-2xl sm:p-9"
          >
            {/* Honeypot */}
            <div className="absolute -left-[10000px]" aria-hidden="true">
              <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              
              {/* Center Name */}
              <label className="text-xs font-semibold text-white/80">
                {t.fields[0]}
                <input
                  className={`${inputClass} mt-1.5`}
                  aria-invalid={!!fieldErrors.center_name || undefined}
                  aria-describedby={fieldErrors.center_name ? "error-center_name" : undefined}
                  name="center_name"
                  placeholder={t.fields[0]}
                  maxLength={200}
                  required
                  autoComplete="organization"
                />
                {fieldErrors.center_name && (
                  <span id="error-center_name" role="alert" className="mt-1.5 block text-xs font-medium text-red-400">
                    {fieldErrors.center_name}
                  </span>
                )}
              </label>

              {/* Role Dropdown */}
              <FormDropdown
                id="demo-role"
                name="role"
                label={t.fields[1]}
                placeholder={t.rolePlaceholder}
                options={t.roles}
                value={role}
                onChange={value => {
                  setRole(value);
                  setSelectionError(false);
                }}
                invalid={selectionError && !role}
              />

              {/* City */}
              <label className="text-xs font-semibold text-white/80">
                {t.fields[2]}
                <input
                  className={`${inputClass} mt-1.5`}
                  aria-invalid={!!fieldErrors.city || undefined}
                  aria-describedby={fieldErrors.city ? "error-city" : undefined}
                  name="city"
                  placeholder={fr ? 'Casablanca, Marrakech, Rabat, Tanger...' : 'Casablanca, Rabat, Marrakech...'}
                  maxLength={120}
                  required
                  autoComplete="address-level2"
                />
                {fieldErrors.city && (
                  <span id="error-city" role="alert" className="mt-1.5 block text-xs font-medium text-red-400">
                    {fieldErrors.city}
                  </span>
                )}
              </label>

              {/* Contact Name */}
              <label className="text-xs font-semibold text-white/80">
                {language === 'fr' ? 'Nom complet du responsable' : 'Full name'}
                <input
                  className={`${inputClass} mt-1.5`}
                  name="contact_name"
                  placeholder={fr ? 'Dr. / M. / Mme...' : 'Dr. / Mr. / Ms...'}
                  required
                  autoComplete="name"
                  maxLength={200}
                  aria-invalid={!!fieldErrors.contact_name || undefined}
                  aria-describedby={fieldErrors.contact_name ? 'error-contact_name' : undefined}
                />
                {fieldErrors.contact_name && (
                  <span id="error-contact_name" role="alert" className="mt-1.5 block text-xs font-medium text-red-400">
                    {fieldErrors.contact_name}
                  </span>
                )}
              </label>

              {/* WhatsApp Phone */}
              <label className="text-xs font-semibold text-white/80 sm:col-span-2">
                {t.fields[4]}
                <input
                  className={`${inputClass} mt-1.5 font-mono`}
                  aria-invalid={!!fieldErrors.phone || undefined}
                  aria-describedby={fieldErrors.phone ? "error-phone" : undefined}
                  name="phone"
                  placeholder="+212 6 12 34 56 78"
                  pattern="[+][1-9][0-9 ]{7,24}"
                  maxLength={26}
                  type="tel"
                  required
                  autoComplete="tel"
                />
                {fieldErrors.phone && (
                  <span id="error-phone" role="alert" className="mt-1.5 block text-xs font-medium text-red-400">
                    {fieldErrors.phone}
                  </span>
                )}
              </label>

              {/* Priority Dropdown */}
              <div className="sm:col-span-2">
                <FormDropdown
                  id="demo-priority"
                  name="priority"
                  label={t.fields[5]}
                  placeholder={t.challengePlaceholder}
                  options={t.challenges}
                  value={priority}
                  onChange={value => {
                    setPriority(value);
                    setSelectionError(false);
                  }}
                  invalid={selectionError && !priority}
                />
              </div>

            </div>

            {selectionError && (
              <p id="selection-error" role="alert" className="mt-4 text-xs font-medium text-red-400">
                {language === 'fr' ? 'Sélectionnez votre rôle et votre priorité avant de valider.' : 'Select your role and priority before submitting.'}
              </p>
            )}

            {status === 'error' && <p role="alert" className="mt-5 rounded-xl border border-red-300/40 bg-red-950/40 p-4 text-sm text-red-100">{language === 'fr' ? 'Votre demande n’a pas pu être confirmée. Vérifiez votre connexion et réessayez. Vos informations sont conservées dans le formulaire.' : 'We could not confirm your request. Check your connection and try again. Your details remain in the form.'}</p>}
            <button
              ref={submitButtonRef}
              type="submit"
              disabled={status === 'sending'}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#a7f2c9] px-6 py-4 text-sm font-semibold text-[#102c23] shadow-xl shadow-emerald-950/40 transition hover:bg-[#c1f8dc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#01bc7c] disabled:opacity-50"
            >
              <span>{status === 'sending' ? t.sending : demoCta[language]}</span>
              <ArrowRight size={18} />
            </button>

            <div className="mt-4 flex items-center justify-between text-xs text-white/50">
              <PrivacyLink language={language} />
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck size={14} />
                <span>{language === 'fr' ? 'Contact professionnel uniquement' : 'Business contact only'}</span>
              </span>
            </div>
          </form>

        </div>
      </section>
    </>
  );
}
