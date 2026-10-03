import AnimatedMetricValue from './AnimatedMetricValue';
import { useMemo, useState } from 'react';
import { Check, CheckCheck, Inbox, Mail, MailOpen, MessageSquare, RotateCw } from 'lucide-react';

type Language = 'en' | 'fr';
type Message = { id: number; sender: string; receivedAt: string; subject: string; preview: string; body: string; category: 'reminder' | 'availability' | 'question'; read: boolean };
type Filter = 'all' | 'unread' | 'read';

const messageSubjects = [
  ['Appointment reminder', 'Please confirm the time for my examination.', 'Hello, I would like to confirm the time of my upcoming examination. Please let me know if I need to bring any documents.'],
  ['Morning availability', 'I am available in the morning.', 'Hello, I am available in the morning for my appointment. Could you let me know which time slots are still open?'],
  ['Examination documents', 'Which documents should I bring?', 'Hello, could you tell me which documents I need to bring for my imaging appointment? Thank you.'],
  ['Change of appointment', 'I need another time for my appointment.', 'Hello, I am unable to attend at the scheduled time. Could you help me choose another available time?'],
  ['Report collection', 'When can I collect my report?', 'Hello, I would like to know when my examination report will be ready for collection.'],
  ['Preparation question', 'Is any preparation needed beforehand?', 'Hello, please let me know whether I need to prepare for my examination before arriving at the center.'],
] as const;

const initialMessages: Message[] = Array.from({ length: 21 }, (_, index) => {
  const content = messageSubjects[index % messageSubjects.length];
  const day = 29 - Math.floor(index / 4);
  const hour = 9 + (index % 8);
  return {
    id: index + 1,
    sender: ['Youssef', 'Salma', 'Amine', 'Lina', 'Nadia', 'Karim'][index % 6],
    receivedAt: `2026-09-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${index % 2 ? '45' : '15'}:00`,
    subject: content[0],
    preview: content[1],
    body: content[2],
    category: index % 6 === 0 ? 'reminder' : index % 6 === 1 ? 'availability' : 'question',
    read: index >= 18,
  };
});

const copy = {
  en: { title: 'Messages', total: 'Total messages', unread: 'Unread', read: 'Read', all: 'All', refresh: 'Refresh', updated: 'Up to date', select: 'Select a message to read it', noMessages: 'No messages in this view', noMessagesHint: 'Choose another filter to see more messages.', reminder: 'Reminder', availability: 'Availability', question: 'Question', markUnread: 'Mark as unread', markRead: 'Mark as read', received: 'Received' },
  fr: { title: 'Messages', total: 'Messages au total', unread: 'Non lus', read: 'Déjà lus', all: 'Tous', refresh: 'Actualiser', updated: 'À jour', select: 'Sélectionnez un message pour le lire', noMessages: 'Aucun message dans cette vue', noMessagesHint: 'Choisissez un autre filtre pour voir les messages.', reminder: 'Rappel', availability: 'Disponibilité', question: 'Question', markUnread: 'Marquer comme non lu', markRead: 'Marquer comme lu', received: 'Reçu le' },
};

const maskSender = (name: string) => `${name.trim().slice(0, 2).toLocaleUpperCase()}*****`;

export default function MessagesPage({ language }: { language: Language }) {
  const t = copy[language];
  const [messages, setMessages] = useState(initialMessages);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showUpdated, setShowUpdated] = useState(false);
  const selected = messages.find((message) => message.id === selectedId) ?? null;
  const unread = messages.filter((message) => !message.read).length;
  const read = messages.length - unread;
  const visible = useMemo(() => messages.filter((message) => filter === 'all' || (filter === 'read' ? message.read : !message.read)), [messages, filter]);
  const dateFormat = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const labelForCategory = (category: Message['category']) => t[category];
  const summary = [
    { label: t.total, value: messages.length, icon: MessageSquare, tone: 'text-cyan-200', surface: 'bg-cyan-400/10' },
    { label: t.unread, value: unread, icon: Mail, tone: 'text-amber-200', surface: 'bg-amber-400/10' },
    { label: t.read, value: read, icon: MailOpen, tone: 'text-emerald-200', surface: 'bg-emerald-400/10' },
  ];
  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: t.all, count: messages.length },
    { key: 'unread', label: t.unread, count: unread },
    { key: 'read', label: t.read, count: read },
  ];

  function openMessage(message: Message) {
    setSelectedId(message.id);
    setMessages((current) => current.map((item) => item.id === message.id ? { ...item, read: true } : item));
  }

  function toggleRead(message: Message) {
    setMessages((current) => current.map((item) => item.id === message.id ? { ...item, read: !item.read } : item));
  }

  return <div className="min-w-0 space-y-5 text-left text-white/90">
    <h1 className="text-2xl font-bold">{t.title}</h1>
    <div className="grid gap-4 sm:grid-cols-3">{summary.map((card) => <div key={card.label} className="flex min-w-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/5 backdrop-blur-xl"><span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${card.surface} ${card.tone}`}><card.icon size={27} /></span><div className="min-w-0"><p className="text-3xl font-bold leading-none"><AnimatedMetricValue value={card.value} /></p><p className="mt-2 text-xs font-medium text-white/60">{card.label}</p></div></div>)}</div>

    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl" aria-label={t.title}>{filters.map((item) => <button key={item.key} type="button" onClick={() => setFilter(item.key)} aria-pressed={filter === item.key} className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 ${filter === item.key ? 'bg-white/15 text-white shadow-sm' : 'text-white/55 hover:bg-white/10 hover:text-white'}`}>{item.label}<span className={`ml-2 text-xs ${filter === item.key ? 'text-cyan-100' : 'text-white/40'}`}>{item.count}</span></button>)}</div>
      <button type="button" onClick={() => { setShowUpdated(true); window.setTimeout(() => setShowUpdated(false), 2500); }} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-white/75 backdrop-blur-xl transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"><RotateCw size={16} />{showUpdated ? t.updated : t.refresh}</button>
    </div>
    <span role="status" aria-live="polite" className="sr-only">{showUpdated ? t.updated : ''}</span>

    <div className="grid min-h-[490px] min-w-0 gap-4 lg:grid-cols-[minmax(260px,0.88fr)_minmax(0,1.12fr)]">
      <section aria-label={t.title} className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/5 backdrop-blur-xl">
        <div className="max-h-[510px] overflow-y-auto overscroll-contain" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.25) transparent' }}>
          {visible.length ? visible.map((message) => <button key={message.id} type="button" onClick={() => openMessage(message)} aria-current={selectedId === message.id ? 'true' : undefined} className={`flex w-full items-start gap-3 border-b border-white/10 px-4 py-4 text-left transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-200 ${selectedId === message.id ? 'bg-cyan-300/15' : 'hover:bg-white/10'}`}>
            <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${message.read ? 'border-white/10 bg-white/5 text-white/50' : 'border-cyan-200/20 bg-cyan-300/10 text-cyan-100'}`}>{message.read ? <MailOpen size={19} /> : <Mail size={19} />}</span>
            <span className="min-w-0 flex-1"><span className="flex min-w-0 items-center justify-between gap-2"><span className={`truncate text-sm ${message.read ? 'font-medium text-white/75' : 'font-semibold text-white'}`}>{maskSender(message.sender)}</span>{!message.read && <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-300" aria-label={t.unread} />}</span><span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/50"><time dateTime={message.receivedAt}>{dateFormat.format(new Date(message.receivedAt))}</time><span className="rounded-md bg-cyan-300/10 px-1.5 py-0.5 font-medium text-cyan-100/80">{labelForCategory(message.category)}</span></span><span className="mt-2 block truncate text-xs text-white/55">{message.preview}</span></span>
          </button>) : <div className="flex min-h-[330px] flex-col items-center justify-center px-5 text-center"><Inbox size={35} className="text-white/30" /><p className="mt-3 text-sm font-medium">{t.noMessages}</p><p className="mt-1 text-xs text-white/50">{t.noMessagesHint}</p></div>}
        </div>
      </section>

      <section aria-label={selected?.subject ?? t.select} className="flex min-h-[490px] min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/5 backdrop-blur-xl">
        {selected ? <><div className="border-b border-white/10 px-5 py-5 sm:px-6"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100/70">{labelForCategory(selected.category)}</span><h2 className="mt-2 text-lg font-semibold text-white">{selected.subject}</h2></div><button type="button" onClick={() => toggleRead(selected)} className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white/75 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">{selected.read ? <Mail size={15} /> : <CheckCheck size={15} />}{selected.read ? t.markUnread : t.markRead}</button></div><div className="mt-5 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-300/15 text-xs font-bold text-cyan-100">{selected.sender.slice(0, 2).toUpperCase()}</span><div className="min-w-0"><p className="text-sm font-semibold">{maskSender(selected.sender)}</p><p className="text-xs text-white/50">{t.received} <time dateTime={selected.receivedAt}>{dateFormat.format(new Date(selected.receivedAt))}</time></p></div></div></div><div className="flex-1 px-5 py-6 sm:px-6"><p className="max-w-prose text-sm leading-7 text-white/75">{selected.body}</p></div><div className="flex items-center gap-2 border-t border-white/10 px-5 py-3 text-xs text-white/45"><Check size={14} className="text-emerald-200/70" />{selected.read ? t.read : t.unread}</div></> : <div className="flex flex-1 flex-col items-center justify-center px-6 text-center"><span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-white/35"><MailOpen size={35} strokeWidth={1.4} /></span><p className="mt-5 text-base font-medium text-white/65">{t.select}</p></div>}
      </section>
    </div>
  </div>;
}
