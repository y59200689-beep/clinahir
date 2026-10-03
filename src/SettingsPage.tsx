import { useState, type ReactNode } from 'react';
import { Bell, Check, Clock3, ExternalLink, Link2, Mail, MapPin, Megaphone, MessageSquare, Music2, Phone, Save, Share2, Shield, Smartphone } from 'lucide-react';

type Language = 'en' | 'fr';
type Priority = 'info' | 'important' | 'urgent';
type SettingsValues = { enabled: boolean; announcement: string; priority: Priority; phone: string; mobile: string; email: string; maps: string; patientPortal: string; website: string; facebook: string; instagram: string; tiktok: string; weekdays: string; saturday: string; sunday: string; confirmationTemplate: string; reminderTemplate: string; noAnswerTemplate: string };

const emptyForm: SettingsValues = { enabled: false, announcement: '', priority: 'info', phone: '', mobile: '', email: '', maps: '', patientPortal: '', website: '', facebook: '', instagram: '', tiktok: '', weekdays: '08:00 - 20:00', saturday: '08:00 - 15:00', sunday: 'Closed', confirmationTemplate: 'Bonjour {NOM}, votre rendez-vous est confirmé pour le {DATE} à {HEURE} ({SERVICE}). Merci de vous présenter 15 minutes à l’avance.', reminderTemplate: 'Rappel : votre rendez-vous est prévu le {DATE} à {HEURE} ({SERVICE}). Merci !', noAnswerTemplate: 'Bonjour {NOM}, nous avons essayé de vous joindre au sujet de votre rendez-vous du {DATE}. Merci de nous rappeler.' };
const storageKey = 'kelo-demo-settings';
const copy = {
  en: {
    title: 'Settings', subtitle: 'Manage the information your team and patients see.', demo: 'Demo settings are saved in this browser only.', announcement: 'Internal announcement', announcementHint: 'Show a priority message at the top of the staff dashboard for shift updates and urgent information.', enabled: 'Show announcement', message: 'Announcement message', messagePlaceholder: 'Write an update for your team…', priority: 'Priority', info: 'Info', important: 'Important', urgent: 'Urgent', contacts: 'Contact details', contactHint: 'Add the public contact details for your center.', phone: 'Main phone', mobile: 'Mobile / WhatsApp', email: 'Email address', hours: 'Opening hours', weekdays: 'Monday to Friday', saturday: 'Saturday', sunday: 'Sunday', links: 'Useful links & social', linksHint: 'Add links your patients may need.', maps: 'Directions link', patientPortal: 'Patient results portal', website: 'Website', social: 'Social media links', socialHint: 'Add your center’s public profiles.', facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', templates: 'Message templates (WhatsApp / SMS)', templatesHint: 'Draft messages for appointment follow-up. Available variables:', confirmation: 'Confirmation template', reminder: 'Reminder template', noAnswer: 'No answer template', save: 'Save changes', saved: 'Settings saved in this browser.', optional: 'Optional',
  },
  fr: {
    title: 'Paramètres', subtitle: 'Gérez les informations visibles par votre équipe et vos patients.', demo: 'Ces paramètres de démonstration sont enregistrés uniquement dans ce navigateur.', announcement: 'Annonce interne', announcementHint: 'Affichez un message prioritaire en haut du tableau de bord du personnel pour les informations de service.', enabled: 'Afficher l’annonce', message: 'Message de l’annonce', messagePlaceholder: 'Rédigez une information pour votre équipe…', priority: 'Niveau de priorité', info: 'Info', important: 'Important', urgent: 'Urgent', contacts: 'Coordonnées', contactHint: 'Ajoutez les coordonnées publiques de votre centre.', phone: 'Téléphone standard', mobile: 'Mobile / WhatsApp', email: 'Adresse e-mail', hours: "Horaires d'ouverture", weekdays: 'Lundi au vendredi', saturday: 'Samedi', sunday: 'Dimanche', links: 'Liens utiles', linksHint: 'Ajoutez les liens utiles pour vos patients.', maps: 'Lien Google Maps', patientPortal: 'Espace patients (résultats)', website: 'Site web', social: 'Liens des réseaux sociaux', socialHint: 'Ajoutez les profils publics de votre centre.', facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', templates: 'Modèles de messages (WhatsApp / SMS)', templatesHint: 'Rédigez des messages pour le suivi des rendez-vous. Variables disponibles :', confirmation: 'Modèle de confirmation', reminder: 'Modèle de rappel', noAnswer: 'Modèle — pas de réponse', save: 'Enregistrer', saved: 'Paramètres enregistrés dans ce navigateur.', optional: 'Facultatif',
  },
};

function readSettings(): SettingsValues {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return emptyForm;
    const parsed = JSON.parse(raw) as Partial<SettingsValues>;
    return { ...emptyForm, ...parsed, priority: ['info', 'important', 'urgent'].includes(parsed.priority ?? '') ? parsed.priority! : 'info' };
  } catch {
    return emptyForm;
  }
}

export default function SettingsPage({ language }: { language: Language }) {
  const t = copy[language];
  const [form, setForm] = useState<SettingsValues>(readSettings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const set = <K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) => { setForm((current) => ({ ...current, [key]: value })); setSaved(false); setError(''); };
  const inputClass = 'mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3.5 py-3 text-sm text-white placeholder:text-white/30 outline-none backdrop-blur-xl focus:border-cyan-200/60 focus:ring-2 focus:ring-cyan-200/15';

  function save() {
    if (form.enabled && !form.announcement.trim()) {
      setError(language === 'fr' ? 'Rédigez un message avant d’activer l’annonce.' : 'Write a message before enabling the announcement.');
      document.getElementById('settings-announcement')?.focus();
      return;
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(form));
      setSaved(true);
      setError('');
    } catch {
      setError(language === 'fr' ? 'Impossible d’enregistrer dans ce navigateur.' : 'Could not save in this browser.');
    }
  }

  return <div className="min-w-0 space-y-5 text-left text-white/90">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold">{t.title}</h1><p className="mt-1 text-sm text-white/55">{t.subtitle}</p></div><span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/55"><Shield size={13} />{t.demo}</span></div>

    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/5 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-400/15 text-rose-200"><Megaphone size={20} /></span><h2 className="text-base font-semibold">{t.announcement}</h2></div>
      <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <div className="space-y-4"><p className="text-sm leading-6 text-white/65">{t.announcementHint}</p><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm font-medium"><input type="checkbox" checked={form.enabled} onChange={(event) => set('enabled', event.target.checked)} className="h-4 w-4 accent-cyan-300" />{t.enabled}</label></div>
        <div className="space-y-4"><label htmlFor="settings-announcement" className="block text-sm font-medium">{t.message}<textarea id="settings-announcement" value={form.announcement} onChange={(event) => set('announcement', event.target.value)} placeholder={t.messagePlaceholder} rows={3} className={`${inputClass} resize-none`} /></label><fieldset><legend className="mb-2 text-sm font-medium">{t.priority}</legend><div className="flex flex-wrap gap-2">{(['info', 'important', 'urgent'] as const).map((priority) => <label key={priority} className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${form.priority === priority ? priority === 'urgent' ? 'border-rose-300/40 bg-rose-300/20 text-rose-100' : priority === 'important' ? 'border-amber-300/40 bg-amber-300/20 text-amber-100' : 'border-cyan-300/40 bg-cyan-300/20 text-cyan-100' : 'border-white/10 bg-white/5 text-white/55 hover:bg-white/10'}`}><input type="radio" name="priority" value={priority} checked={form.priority === priority} onChange={() => set('priority', priority)} className="sr-only" /><span className="inline-flex items-center gap-1.5">{form.priority === priority && <Check size={13} />}{t[priority]}</span></label>)}</div></fieldset></div>
      </div>
    </section>

    <div className="grid items-start gap-4 lg:grid-cols-2">
      <div className="min-w-0 space-y-4">
      <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/5 backdrop-blur-xl"><div className="flex items-center gap-3 border-b border-white/10 px-5 py-4"><MapPin size={20} className="text-cyan-200" /><div><h2 className="text-base font-semibold">{t.contacts}</h2><p className="text-xs text-white/45">{t.contactHint}</p></div></div><div className="space-y-4 p-5"><Field id="settings-phone" icon={<Phone size={15} />} label={t.phone} value={form.phone} onChange={(value) => set('phone', value)} inputClass={inputClass} autoComplete="tel" type="tel" optional={t.optional} /><Field id="settings-mobile" icon={<Smartphone size={15} />} label={t.mobile} value={form.mobile} onChange={(value) => set('mobile', value)} inputClass={inputClass} autoComplete="tel" type="tel" optional={t.optional} /><Field id="settings-email" icon={<Mail size={15} />} label={t.email} value={form.email} onChange={(value) => set('email', value)} inputClass={inputClass} autoComplete="email" type="email" optional={t.optional} /></div></section>
      <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/5 backdrop-blur-xl"><div className="flex items-center gap-3 border-b border-white/10 px-5 py-4"><Clock3 size={20} className="text-cyan-200" /><h2 className="text-base font-semibold">{t.hours}</h2></div><div className="space-y-4 p-5"><Field id="settings-weekdays" icon={null} label={t.weekdays} value={form.weekdays} onChange={(value) => set('weekdays', value)} inputClass={inputClass} type="text" optional="" /><Field id="settings-saturday" icon={null} label={t.saturday} value={form.saturday} onChange={(value) => set('saturday', value)} inputClass={inputClass} type="text" optional="" /><Field id="settings-sunday" icon={null} label={t.sunday} value={form.sunday === 'Closed' && language === 'fr' ? 'Fermé' : form.sunday} onChange={(value) => set('sunday', value)} inputClass={inputClass} type="text" optional="" /></div></section>
      </div>
      <div className="min-w-0 space-y-4">
      <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/5 backdrop-blur-xl"><div className="flex items-center gap-3 border-b border-white/10 px-5 py-4"><Link2 size={20} className="text-cyan-200" /><div><h2 className="text-base font-semibold">{t.links}</h2><p className="text-xs text-white/45">{t.linksHint}</p></div></div><div className="space-y-4 p-5"><Field id="settings-maps" icon={<MapPin size={15} />} label={t.maps} value={form.maps} onChange={(value) => set('maps', value)} inputClass={inputClass} type="url" optional={t.optional} /><Field id="settings-portal" icon={<ExternalLink size={15} />} label={t.patientPortal} value={form.patientPortal} onChange={(value) => set('patientPortal', value)} inputClass={inputClass} type="url" optional={t.optional} /><Field id="settings-website" icon={<Link2 size={15} />} label={t.website} value={form.website} onChange={(value) => set('website', value)} inputClass={inputClass} type="url" optional={t.optional} /></div></section>
      <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/5 backdrop-blur-xl"><div className="flex items-center gap-3 border-b border-white/10 px-5 py-4"><Share2 size={20} className="text-emerald-200" /><div><h2 className="text-base font-semibold">{t.social}</h2><p className="text-xs text-white/45">{t.socialHint}</p></div></div><div className="space-y-4 p-5"><Field id="settings-facebook" icon={<span className="w-[15px] text-center font-bold">f</span>} label={t.facebook} value={form.facebook} onChange={(value) => set('facebook', value)} inputClass={inputClass} type="url" optional={t.optional} /><Field id="settings-instagram" icon={<span className="w-[15px] text-center font-semibold">◎</span>} label={t.instagram} value={form.instagram} onChange={(value) => set('instagram', value)} inputClass={inputClass} type="url" optional={t.optional} /><Field id="settings-tiktok" icon={<Music2 size={15} />} label={t.tiktok} value={form.tiktok} onChange={(value) => set('tiktok', value)} inputClass={inputClass} type="url" optional={t.optional} /></div></section>
      </div>
    </div>
    <section className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/5 backdrop-blur-xl">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200"><MessageSquare size={20} /></span><h2 className="text-base font-semibold">{t.templates}</h2></div>
      <div className="space-y-5 p-5"><p className="text-sm leading-6 text-white/60">{t.templatesHint} <span className="inline-flex flex-wrap gap-1 align-middle">{['{NOM}', '{DATE}', '{HEURE}', '{SERVICE}'].map((token) => <code key={token} className="rounded-md border border-white/10 bg-white/10 px-1.5 py-0.5 text-xs text-white/80">{token}</code>)}</span></p>
        {([
          { key: 'confirmationTemplate' as const, label: t.confirmation, icon: <Check size={17} />, color: 'text-emerald-200' },
          { key: 'reminderTemplate' as const, label: t.reminder, icon: <Bell size={17} />, color: 'text-amber-200' },
          { key: 'noAnswerTemplate' as const, label: t.noAnswer, icon: <Phone size={17} />, color: 'text-violet-200' },
        ]).map((item) => <div key={item.key}><label htmlFor={`settings-${item.key}`} className={`inline-flex items-center gap-2 text-sm font-semibold ${item.color}`}>{item.icon}{item.label}</label><textarea id={`settings-${item.key}`} value={form[item.key]} onChange={(event) => set(item.key, event.target.value)} rows={3} className={`${inputClass} min-h-24 resize-none leading-6`} /></div>)}
      </div>
    </section>
    <div className="flex flex-wrap items-center justify-end gap-3"><span role="status" className={`text-xs ${error ? 'text-rose-200' : 'text-emerald-200'}`}>{error || (saved ? t.saved : '')}</span><button type="button" onClick={save} className="inline-flex items-center gap-2 rounded-xl border border-cyan-200/25 bg-cyan-400/20 px-4 py-2.5 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"><Save size={16} />{t.save}</button></div>
  </div>;
}

function Field({ id, icon, label, value, onChange, inputClass, type, autoComplete, optional }: { id: string; icon: ReactNode; label: string; value: string; onChange: (value: string) => void; inputClass: string; type: string; autoComplete?: string; optional: string }) {
  return <div><div className="flex items-center justify-between gap-2"><label htmlFor={id} className="inline-flex items-center gap-2 text-sm font-medium"><span className="text-white/50">{icon}</span>{label}</label><span className="text-[10px] text-white/35">{optional}</span></div><input id={id} type={type} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} /></div>;
}
