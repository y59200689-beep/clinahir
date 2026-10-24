import { landingDefaults as content } from './content/landing';
import { useManagedCopy, useSiteContent } from './content/SiteContent';
import { PrivacyLink } from './PrivacyNotice';
import { LeadConfirmation } from './LeadConfirmation';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowRight, CalendarCheck2, Check, ChevronDown, ClipboardList, MessageCircle, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

type Language = 'en' | 'fr';
import { captureAttribution, submitLead } from './leads/client';


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
    <button ref={triggerRef} id={id} type="button" aria-labelledby={`${id}-label ${id}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-options`} aria-invalid={invalid || undefined} aria-describedby={invalid ? "selection-error" : undefined} onClick={() => setOpen(!open)} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); } }} className={`${inputClass} flex min-h-[52px] items-center justify-between gap-3 text-left font-medium ${!value ? 'text-[var(--text-secondary)]' : ''} ${invalid ? 'border-red-500' : ''}`}>
      <span className="truncate">{value || placeholder}</span><ChevronDown size={18} className={`shrink-0 text-[var(--text-secondary)] transition-transform ${open ? 'rotate-180' : ''}`}/>
    </button>
    {open && <div id={`${id}-options`} role="listbox" aria-labelledby={`${id}-label`} onKeyDown={onMenuKeyDown} className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-1.5 shadow-[0_22px_50px_rgba(0,0,0,.16)]">
      {options.map((option, index) => <button key={option} ref={element => { optionRefs.current[index] = element; }} type="button" role="option" aria-selected={value === option} onClick={() => choose(option)} className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition hover:bg-[var(--brand-primary-10)] focus:bg-[var(--brand-primary-10)] focus:outline-none ${value === option ? 'bg-[var(--brand-primary-10)] text-[var(--brand-primary-hover)]' : 'text-[var(--text-strong)]'}`}><span>{option}</span>{value === option && <Check size={16} className="shrink-0"/>}</button>)}
    </div>}
  </div>;
}

export default function LandingSections({ language = 'en' }: { language?: Language }) {
  const t = useManagedCopy('landing',content[language],language);
  const {document:site}=useSiteContent();
  const reducedMotion = useReducedMotion();
  const sectionReveal = reducedMotion ? {} : {
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.08 },
    transition: { duration: 0.58, ease: 'easeOut' as const },
  };
  useEffect(() => { captureAttribution(); }, []);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [role, setRole] = useState('');
  const [priority, setPriority] = useState('');
  const [selectionError, setSelectionError] = useState(false);
  const [fieldErrors,setFieldErrors]=useState<Record<string,string>>({});
  useEffect(()=>{
    const other = language === 'fr' ? content.en : content.fr;
    setPriority(value => { const index=other.challenges.findIndex(item=>item===value);return index>=0?content[language].challenges[index]:value; });
    setRole(value => { const index=other.roles.findIndex(item=>item===value);return index>=0?content[language].roles[index]:value; });
    setFieldErrors({});
  },[language]);
  const processOutputs = t.processOutputs;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    const form = event.currentTarget;
    const errors: Record<string,string>={};
    for (const node of Array.from(form.elements)) {
      if(node instanceof HTMLInputElement && !node.validity.valid) errors[node.name]=language==='fr'?((node.validity.typeMismatch || node.validity.patternMismatch)?'Indiquez un numéro WhatsApp avec l’indicatif du pays, par exemple +212 6 12 34 56 78.':'Veuillez remplir ce champ.'):((node.validity.typeMismatch || node.validity.patternMismatch)?'Enter a WhatsApp number with country code, for example +212 6 12 34 56 78.':'Complete this field.');
    }
    setFieldErrors(errors);
    if(Object.keys(errors).length){(form.elements.namedItem(Object.keys(errors)[0]) as HTMLElement)?.focus();return;}
    if (!role || !priority) { setSelectionError(true); requestAnimationFrame(()=>document.getElementById(!role ? "demo-role" : "demo-priority")?.focus()); return; }
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
    <LeadConfirmation returnFocusRef={submitButtonRef} open={confirmationOpen} language={language} onClose={() => setConfirmationOpen(false)}/>
    <motion.section {...sectionReveal} className="marketing-proof px-6 py-24"><div className="mx-auto grid max-w-6xl gap-10 rounded-[36px] border border-[var(--border)] bg-white p-8 shadow-[0_24px_70px_rgba(0,0,0,.05)] md:grid-cols-[1.2fr_.8fr] md:p-12"><div><p className="mb-4 text-xs font-bold tracking-[0.2em] text-[var(--brand-primary-hover)]">{t.proofEyebrow}</p><h2 className="mb-5 text-4xl font-semibold tracking-tight">{t.proofTitle}</h2><p className="max-w-xl text-lg leading-relaxed text-[var(--text-body)]">{t.proofBody}</p><a href="#interactive-demo" className="mt-7 inline-flex items-center gap-2 font-semibold text-[var(--brand-primary-hover)] underline underline-offset-4">{language === 'fr' ? 'Explorer la démo interactive' : 'Explore the interactive demo'}<ArrowRight size={17}/></a></div><div className="flex flex-col justify-center gap-4">{t.proofPoints.map((point) => <div key={point} className="flex gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"><Check className="mt-0.5 shrink-0 text-[var(--brand-primary)]" size={19}/><span className="font-medium text-[var(--text-strong)]">{point}</span></div>)}</div></div></motion.section>

    <motion.section {...sectionReveal} id="process" className="marketing-process scroll-mt-8 px-6 py-28"><div className="mx-auto max-w-6xl"><p className="mb-4 text-xs font-bold tracking-[0.2em] text-[var(--brand-primary-hover)]">{t.processEyebrow}</p><h2 className="mb-12 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">{t.processTitle}</h2><div className="grid gap-4 md:grid-cols-4">{t.process.map(([number,title,body],index) => <article key={number} className="border-t-2 border-[var(--brand-primary)] pt-6"><span className="mb-8 block text-sm font-bold text-[var(--brand-primary-hover)]">{number}</span><h3 className="mb-3 text-xl font-semibold">{title}</h3><p className="leading-relaxed text-[var(--text-body)]">{body}</p><p className="mt-5 border-t border-white/15 pt-4 text-sm font-medium text-white/85">{processOutputs[index]}</p></article>)}</div></div></motion.section>

    <motion.section {...sectionReveal} className="marketing-fit px-6 py-28"><div className="mx-auto max-w-6xl"><h2 className="mb-10 max-w-3xl text-4xl font-semibold tracking-tight">{t.fitTitle}</h2><div className="grid gap-4 md:grid-cols-3">{t.fits.map(([title,body,scope],index) => <article key={title} className="flex flex-col rounded-[28px] border border-[var(--border)] bg-white p-7 shadow-sm"><div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-primary-10)] text-[var(--brand-primary-hover)]"><Sparkles size={23}/></div><h3 className="mb-3 text-2xl font-semibold">{title}</h3><p className="mb-8 flex-1 leading-relaxed text-[var(--text-body)]">{body}</p><p className="border-t border-[var(--border)] pt-5 text-sm font-medium text-[var(--brand-primary-hover)]">{scope}</p><a href="#book-demo" onClick={()=>{setPriority(t.challenges[[2,0,3][index]]);setSelectionError(false);}} className="mt-5 inline-flex items-center gap-2 font-semibold text-[var(--brand-primary-hover)] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)]">{language === "fr" ? "Parlons de votre centre" : "Discuss your center"}<ArrowRight size={16}/></a></article>)}</div><p className="mt-6 text-sm text-[var(--text-body)]">{t.fitNote}</p></div></motion.section>

    <motion.section {...sectionReveal} id="about" className="marketing-about scroll-mt-8 px-6 py-28 text-white"><div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center"><div><p className="mb-4 text-xs font-bold tracking-[0.2em] text-[var(--brand-primary)]">{t.aboutEyebrow}</p><h2 className="text-4xl font-semibold tracking-tight md:text-5xl">{t.aboutTitle}</h2></div><div><p className="mb-6 text-lg leading-relaxed text-white/75">{t.aboutBody}</p><div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-5 text-sm leading-relaxed text-white/70"><ShieldCheck size={20} className="shrink-0 text-[var(--brand-primary)]"/>{t.aboutNote}</div>{site.settings.sections.client && <a href="#client-project" className="mt-5 inline-flex items-center gap-2 font-semibold text-white underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">{language === "fr" ? "Découvrir notre projet client" : "Explore our client project"}<ArrowRight size={16}/></a>}</div></div></motion.section>

    <motion.section {...sectionReveal} id="book-demo" className="marketing-form scroll-mt-8 px-6 py-28"><div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[.85fr_1.15fr]"><div><p className="mb-4 text-xs font-bold tracking-[0.2em] text-[var(--brand-primary-hover)]">{t.formEyebrow}</p><h2 className="mb-5 text-4xl font-semibold tracking-tight md:text-5xl">{t.formTitle}</h2><p className="text-lg leading-relaxed text-[var(--text-body)]">{t.formBody}</p><div className="mt-9 flex items-center gap-3 rounded-2xl bg-[var(--surface-muted)] p-5 text-sm text-[var(--text-body)]"><MessageCircle className="shrink-0 text-[var(--brand-primary)]"/>{t.privacy}</div></div><form noValidate onInput={event=>{const node=event.target;if(node instanceof HTMLInputElement && node.validity.valid)setFieldErrors(errors=>{const next={...errors};delete next[node.name];return next;});}} onSubmit={submit} className="min-w-0 rounded-[32px] border border-[var(--border)] bg-[var(--surface-muted)] p-6 shadow-[0_24px_70px_rgba(0,0,0,.06)] md:p-9"><div className="absolute -left-[10000px]" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">{t.fields[0]}<input className={inputClass+' mt-2'} aria-invalid={!!fieldErrors.center_name || undefined} aria-describedby={fieldErrors.center_name ? "error-center_name" : undefined} name="center_name" maxLength={200} required autoComplete="organization"/>{fieldErrors.center_name && <span id="error-center_name" role="alert" className="mt-2 block text-xs font-medium text-red-700">{fieldErrors.center_name}</span>}</label><FormDropdown id="demo-role" name="role" label={t.fields[1]} placeholder={t.rolePlaceholder} options={t.roles} value={role} onChange={value => { setRole(value); setSelectionError(false); }} invalid={selectionError && !role}/><label className="text-sm font-semibold">{t.fields[2]}<input className={inputClass+' mt-2'} aria-invalid={!!fieldErrors.city || undefined} aria-describedby={fieldErrors.city ? "error-city" : undefined} name="city" maxLength={120} required autoComplete="address-level2"/>{fieldErrors.city && <span id="error-city" role="alert" className="mt-2 block text-xs font-medium text-red-700">{fieldErrors.city}</span>}</label><label className="text-sm font-semibold">{language === 'fr' ? 'Nom complet' : 'Full name'}<input className={inputClass+' mt-2'} name="contact_name" required autoComplete="name" maxLength={200} aria-invalid={!!fieldErrors.contact_name || undefined} aria-describedby={fieldErrors.contact_name ? 'error-contact_name' : undefined}/>{fieldErrors.contact_name && <span id="error-contact_name" role="alert" className="mt-2 block text-xs font-medium text-red-700">{fieldErrors.contact_name}</span>}</label><label className="text-sm font-semibold sm:col-span-2">{t.fields[4]}<input className={inputClass+' mt-2'} aria-invalid={!!fieldErrors.phone || undefined} aria-describedby={fieldErrors.phone ? "error-phone" : undefined} name="phone" placeholder="+212 6 12 34 56 78" pattern="[+][1-9][0-9 ]{7,24}" maxLength={26} type="tel" required autoComplete="tel"/>{fieldErrors.phone && <span id="error-phone" role="alert" className="mt-2 block text-xs font-medium text-red-700">{fieldErrors.phone}</span>}</label><div className="sm:col-span-2"><FormDropdown id="demo-priority" name="priority" label={t.fields[5]} placeholder={t.challengePlaceholder} options={t.challenges} value={priority} onChange={value => { setPriority(value); setSelectionError(false); }} invalid={selectionError && !priority}/></div></div>{selectionError && <p id="selection-error" role="alert" className="mt-4 text-sm font-medium text-red-600">{language === 'fr' ? 'Sélectionnez votre rôle et votre priorité.' : 'Select your role and priority.'}</p>}<button ref={submitButtonRef} type="submit" disabled={status === 'sending'} className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-primary)] px-6 py-4 font-bold text-white transition hover:bg-[var(--brand-primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)] disabled:cursor-not-allowed disabled:opacity-55">{status === 'sending' ? t.sending : t.submit}<ArrowRight size={18}/></button><p aria-live="polite" className="mt-4 text-sm text-[var(--text-body)]">{status === 'success' ? t.success : status === 'error' ? t.error : t.privacy}</p><p className="mt-4 text-xs leading-relaxed text-[var(--text-body)]"><PrivacyLink language={language}/></p><p className="mt-3 text-sm leading-relaxed text-[var(--text-body)]">{language === "fr" ? "Votre numéro WhatsApp sera utilisé pour vous transmettre la démonstration et donner suite à votre demande." : "We’ll use your WhatsApp number to share the demo and follow up on your request."}</p></form></div></motion.section>
  </>;
}
