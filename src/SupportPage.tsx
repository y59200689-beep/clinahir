import { useMemo, useRef, useState } from 'react';
import { CalendarDays, CalendarRange, Check, ChevronDown, CircleHelp, FileText, LifeBuoy, MessageSquare, Search, Send, Settings, ShieldCheck, X } from 'lucide-react';

type Language = 'en' | 'fr';
type Topic = 'appointments' | 'agenda' | 'messages' | 'settings';
type RequestCategory = Topic | 'other';

const content = {
  en: {
    title: 'Support', eyebrow: 'CLINAHIR HELP CENTER', hero: 'How can we help your team?', intro: 'Find guidance for everyday work in your center, or prepare a support request.', search: 'Search help topics…', clear: 'Clear search', quick: 'Quick guides', common: 'Common questions', request: 'Need more help?', requestIntro: 'Describe the issue and save a draft to follow up with your support contact.', demo: 'Drafts stay in this browser. Nothing is sent.', privacy: 'Do not include patient names or medical information.', category: 'Topic', subject: 'Short summary', subjectPlaceholder: 'What do you need help with?', details: 'Details', detailsPlaceholder: 'Describe what happened and what you expected…', save: 'Save support draft', saved: 'Support draft saved in this browser.', error: 'Add a summary and details before saving.', storageError: 'Could not save the draft in this browser.', noResults: 'No matching help topics. Try another search or save a support draft.', open: 'Open page', other: 'Other', topics: { appointments: 'Appointments', agenda: 'Agenda', messages: 'Messages', settings: 'Settings' }, descriptions: { appointments: 'Review requests, statuses, and patient lists.', agenda: 'Explore month, week, and day schedules.', messages: 'Read and organize incoming messages.', settings: 'Update contact details, hours, and templates.' }, faqs: [
      { topic: 'appointments' as Topic, question: 'How do I find an appointment?', answer: 'Open Appointments and use the search field or date selector. Status tabs narrow the list further.' },
      { topic: 'appointments' as Topic, question: 'How do I change an appointment status?', answer: 'In the Appointments agenda, drag a card to another status column. Changes in this demo last until the page reloads.' },
      { topic: 'agenda' as Topic, question: 'Where can I see the weekly schedule?', answer: 'Open Agenda and choose Week. Use the previous and next controls to move through dates.' },
      { topic: 'messages' as Topic, question: 'How do I see unread messages?', answer: 'Open Messages and select Unread. Opening a message marks it read in the current demo session.' },
      { topic: 'settings' as Topic, question: 'Where are center details and message templates?', answer: 'Open Settings to edit contact details, opening hours, social links, and WhatsApp / SMS message drafts. Save changes to keep them in this browser.' },
    ],
  },
  fr: {
    title: 'Assistance', eyebrow: 'CENTRE D’AIDE CLINAHIR', hero: 'Comment aider votre équipe ?', intro: 'Trouvez des réponses pour le travail quotidien du centre ou préparez une demande d’assistance.', search: 'Rechercher dans l’aide…', clear: 'Effacer la recherche', quick: 'Guides rapides', common: 'Questions fréquentes', request: 'Besoin d’aide ?', requestIntro: 'Décrivez le problème et enregistrez un brouillon à transmettre à votre contact d’assistance.', demo: 'Les brouillons restent dans ce navigateur. Aucun message n’est envoyé.', privacy: 'N’ajoutez pas de noms de patients ni de données médicales.', category: 'Sujet', subject: 'Résumé', subjectPlaceholder: 'Sur quoi avez-vous besoin d’aide ?', details: 'Détails', detailsPlaceholder: 'Décrivez ce qui s’est passé et ce que vous attendiez…', save: 'Enregistrer le brouillon', saved: 'Brouillon enregistré dans ce navigateur.', error: 'Ajoutez un résumé et des détails avant d’enregistrer.', storageError: 'Impossible d’enregistrer le brouillon dans ce navigateur.', noResults: 'Aucun résultat. Essayez une autre recherche ou enregistrez un brouillon.', open: 'Ouvrir la page', other: 'Autre', topics: { appointments: 'Rendez-vous', agenda: 'Agenda', messages: 'Messages', settings: 'Paramètres' }, descriptions: { appointments: 'Consultez les demandes, statuts et listes de patients.', agenda: 'Explorez les plannings au mois, à la semaine et au jour.', messages: 'Lisez et organisez les messages reçus.', settings: 'Modifiez les coordonnées, horaires et modèles.' }, faqs: [
      { topic: 'appointments' as Topic, question: 'Comment retrouver un rendez-vous ?', answer: 'Ouvrez Rendez-vous et utilisez la recherche ou le sélecteur de dates. Les onglets de statut affinent la liste.' },
      { topic: 'appointments' as Topic, question: 'Comment changer le statut d’un rendez-vous ?', answer: 'Dans la vue agenda des rendez-vous, déplacez la carte vers une autre colonne. Dans cette démo, le changement dure jusqu’au rechargement.' },
      { topic: 'agenda' as Topic, question: 'Où voir le planning hebdomadaire ?', answer: 'Ouvrez Agenda et choisissez Semaine. Utilisez les boutons précédent et suivant pour changer de date.' },
      { topic: 'messages' as Topic, question: 'Comment voir les messages non lus ?', answer: 'Ouvrez Messages et sélectionnez Non lus. L’ouverture d’un message le marque comme lu pendant la session de démonstration.' },
      { topic: 'settings' as Topic, question: 'Où modifier les informations et modèles de messages ?', answer: 'Ouvrez Paramètres pour modifier les coordonnées, horaires, liens sociaux et brouillons WhatsApp / SMS. Enregistrez pour les conserver dans ce navigateur.' },
    ],
  },
};

const guideItems = [
  { topic: 'appointments' as Topic, icon: CalendarDays, color: 'text-cyan-200', surface: 'bg-cyan-400/15' },
  { topic: 'agenda' as Topic, icon: CalendarRange, color: 'text-amber-200', surface: 'bg-amber-400/15' },
  { topic: 'messages' as Topic, icon: MessageSquare, color: 'text-emerald-200', surface: 'bg-emerald-400/15' },
  { topic: 'settings' as Topic, icon: Settings, color: 'text-violet-200', surface: 'bg-violet-400/15' },
];

function readDraft(): { category: RequestCategory; subject: string; details: string } {
  try {
    const saved = JSON.parse(window.localStorage.getItem('kelo-demo-support-draft') || '{}');
    return {
      category: ['appointments', 'agenda', 'messages', 'settings', 'other'].includes(saved.category) ? saved.category : 'appointments',
      subject: typeof saved.subject === 'string' ? saved.subject : '',
      details: typeof saved.details === 'string' ? saved.details : '',
    };
  } catch { return { category: 'appointments', subject: '', details: '' }; }
}

export default function SupportPage({ language, onNavigate }: { language: Language; onNavigate: (page: 'Appointments' | 'Agenda' | 'Messages' | 'Settings') => void }) {
  const t = content[language];
  const [query, setQuery] = useState('');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [draft] = useState(readDraft);
  const [category, setCategory] = useState<RequestCategory>(draft.category);
  const [subject, setSubject] = useState(draft.subject);
  const [details, setDetails] = useState(draft.details);
  const [feedback, setFeedback] = useState<'saved' | 'error' | 'storage' | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const normalized = query.trim().toLocaleLowerCase();
  const guides = useMemo(() => guideItems.filter(({ topic }) => `${t.topics[topic]} ${t.descriptions[topic]}`.toLocaleLowerCase().includes(normalized)), [normalized, t]);
  const questions = useMemo(() => t.faqs.filter((item) => `${item.question} ${item.answer} ${t.topics[item.topic]}`.toLocaleLowerCase().includes(normalized)), [normalized, t]);

  function saveDraft() {
    if (!subject.trim() || !details.trim()) { setFeedback('error'); return; }
    try {
      window.localStorage.setItem('kelo-demo-support-draft', JSON.stringify({ category, subject: subject.trim(), details: details.trim() }));
      setFeedback('saved');
    } catch { setFeedback('storage'); }
  }

  return <div className="min-w-0 space-y-6 text-left text-white/90">
    <div><h1 className="text-2xl font-bold">{t.title}</h1></div>
    <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-8"><span className="pointer-events-none absolute -right-12 -top-20 h-60 w-60 rounded-full bg-cyan-300/10 blur-3xl" /><div className="relative max-w-xl"><div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-cyan-200"><LifeBuoy size={15} />{t.eyebrow}</div><h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{t.hero}</h2><p className="mt-2 text-sm leading-6 text-white/60">{t.intro}</p><label className="relative mt-5 block"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45" /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search} className="w-full rounded-xl border border-white/15 bg-white/10 py-3 pl-11 pr-11 text-sm text-white placeholder:text-white/45 outline-none focus:border-cyan-200/60 focus:ring-2 focus:ring-cyan-200/20" />{query && <button type="button" onClick={() => { setQuery(''); searchRef.current?.focus(); }} aria-label={t.clear} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/55 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"><X size={16} /></button>}</label></div></section>

    {guides.length > 0 && <section aria-labelledby="support-guides"><div className="mb-3 flex items-center gap-2"><FileText size={17} className="text-cyan-200" /><h2 id="support-guides" className="text-base font-semibold">{t.quick}</h2></div><div className="grid gap-3 sm:grid-cols-2">{guides.map(({ topic, icon: Icon, color, surface }) => <button key={topic} type="button" onClick={() => onNavigate(topic === 'appointments' ? 'Appointments' : topic === 'agenda' ? 'Agenda' : topic === 'messages' ? 'Messages' : 'Settings')} className="group flex min-w-0 items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left shadow-lg shadow-black/5 backdrop-blur-xl transition-colors hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${surface} ${color}`}><Icon size={20} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{t.topics[topic]}</span><span className="mt-1 block text-xs leading-5 text-white/55">{t.descriptions[topic]}</span><span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-cyan-100/80 group-hover:text-cyan-50">{t.open} <span aria-hidden="true">↗</span></span></span></button>)}</div></section>}

    {questions.length > 0 ? <section aria-labelledby="support-faq"><div className="mb-3 flex items-center gap-2"><CircleHelp size={17} className="text-cyan-200" /><h2 id="support-faq" className="text-base font-semibold">{t.common}</h2></div><div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">{questions.map((item) => <div key={item.question} className="border-b border-white/10 last:border-b-0"><button type="button" aria-expanded={openQuestion === item.question} onClick={() => setOpenQuestion(openQuestion === item.question ? null : item.question)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-200"><span>{item.question}</span><ChevronDown size={16} className={`shrink-0 text-white/50 transition-transform ${openQuestion === item.question ? 'rotate-180' : ''}`} /></button>{openQuestion === item.question && <p className="px-5 pb-4 text-sm leading-6 text-white/60">{item.answer}</p>}</div>)}</div></section> : <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/55 backdrop-blur-xl">{t.noResults}</div>}

    <section aria-labelledby="support-request" className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/5 backdrop-blur-xl"><div className="flex items-start gap-3 border-b border-white/10 px-5 py-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200"><Send size={18} /></span><div><h2 id="support-request" className="text-base font-semibold">{t.request}</h2><p className="mt-0.5 text-xs text-white/55">{t.requestIntro}</p></div></div><div className="grid gap-4 p-5 sm:grid-cols-2"><fieldset className="sm:col-span-2"><legend className="text-xs font-semibold text-white/75">{t.category}</legend><div className="mt-2 flex flex-wrap gap-2">{([...guideItems.map((item) => item.topic), 'other'] as RequestCategory[]).map((topic) => <button key={topic} type="button" aria-pressed={category === topic} onClick={() => { setCategory(topic); setFeedback(null); }} className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 ${category === topic ? 'border-cyan-200/40 bg-cyan-300/20 text-white' : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'}`}>{topic === 'other' ? t.other : t.topics[topic]}</button>)}</div></fieldset><div className="sm:col-span-2"><label htmlFor="support-subject" className="block text-xs font-semibold text-white/75">{t.subject}</label><input id="support-subject" value={subject} onChange={(event) => { setSubject(event.target.value); setFeedback(null); }} placeholder={t.subjectPlaceholder} className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-cyan-200/60 focus:ring-2 focus:ring-cyan-200/20" /></div><div className="sm:col-span-2"><label htmlFor="support-details" className="block text-xs font-semibold text-white/75">{t.details}</label><textarea id="support-details" rows={4} value={details} onChange={(event) => { setDetails(event.target.value); setFeedback(null); }} placeholder={t.detailsPlaceholder} className="mt-2 min-h-28 w-full resize-none rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-cyan-200/60 focus:ring-2 focus:ring-cyan-200/20" /></div><div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2"><div className="space-y-1 text-xs text-white/45"><p className="inline-flex items-center gap-1.5"><ShieldCheck size={14} />{t.privacy}</p><p>{t.demo}</p></div><button type="button" onClick={saveDraft} className="inline-flex items-center gap-2 rounded-xl border border-cyan-200/25 bg-cyan-400/20 px-4 py-2.5 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"><Check size={16} />{t.save}</button></div><p role="status" className={`text-xs sm:col-span-2 ${feedback === 'error' || feedback === 'storage' ? 'text-rose-200' : 'text-emerald-200'}`}>{feedback === 'error' ? t.error : feedback === 'storage' ? t.storageError : feedback === 'saved' ? t.saved : ''}</p></div></section>
  </div>;
}
