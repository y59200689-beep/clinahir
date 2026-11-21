import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Mail, MessageCircle, Phone, Plus, History } from 'lucide-react';
import { useAdminLocale } from '../i18n';
import { adminApi, type Lead } from '../types';
import { AdminSelect } from './AdminSelect';
import '../lead-contact.css';

const channelLabels = { phone: 'Phone call', whatsapp: 'WhatsApp', email: 'Email', other: 'Other' } as const;
const outcomeLabels = {
  reached: 'Reached', no_reply: 'No reply', follow_up_requested: 'Follow-up requested', declined: 'Declined',
} as const;
type Channel = keyof typeof channelLabels;
type Outcome = keyof typeof outcomeLabels;
interface Entry {
  id: string;
  channel: Channel;
  outcome: Outcome;
  note: string;
  created_at: string;
}

export function LeadWhatsAppLink({ phone, className }: { phone: Lead['phone']; className?: string }) {
  const { t } = useAdminLocale();
  const normalized = (phone ?? '').trim().replace(/[\s().-]/g, '');
  const mobile = /^(?:0|(?:\+|00)?212)([67][0-9]{8})$/.exec(normalized)?.[1];
  if (!mobile) return null;

  return <a className={className} href={`https://wa.me/212${mobile}`} target="_blank" rel="noopener noreferrer"
    onClick={event => event.stopPropagation()}>
    <MessageCircle size={15} aria-hidden="true" />{t('WhatsApp')}
  </a>;
}

export function LeadContact({ lead }: { lead: Lead }) {
  const { t, intlLocale, errorText } = useAdminLocale();
  const [editing, setEditing] = useState(false);
  const [channel, setChannel] = useState<Channel>('phone');
  const [outcome, setOutcome] = useState<Outcome | ''>('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [history, setHistory] = useState<{ entries: Entry[]; hasMore: boolean }>();
  const [loadError, setLoadError] = useState(false);
  const logButton = useRef<HTMLButtonElement>(null);
  const retry = useRef<{ payload: string; id: string } | null>(null);
  const phone = (lead.phone ?? '').trim().replace(/[\s().-]/g, '').replace(/^00/, '+');
  const callable = /^\+?[0-9]{7,15}$/.test(phone) && /[1-9]/.test(phone);
  const email = (lead.email ?? '').trim();
  const canEmail = /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email);
  const formatDate = new Intl.DateTimeFormat(intlLocale, {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Casablanca',
  });

  useEffect(() => {
    let active = true;
    void adminApi<{ entries: Entry[]; hasMore: boolean }>(
      'lead-contacts', undefined, `&id=${encodeURIComponent(lead.external_id)}&page=${page}`,
    ).then(result => { if (active) setHistory(result); })
      .catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, [lead.external_id, page, revision]);

  function load(nextPage: number) {
    setHistory(undefined);
    setLoadError(false);
    setPage(nextPage);
    setRevision(value => value + 1);
  }

  function closeForm() {
    setEditing(false);
    logButton.current?.focus();
  }

  async function logContact(event: FormEvent) {
    event.preventDefault();
    if (!outcome || saving) return;
    const payload = { id: lead.external_id, channel, outcome, note: note.trim() };
    const key = JSON.stringify(payload);
    if (retry.current?.payload !== key) retry.current = { payload: key, id: crypto.randomUUID() };
    setSaving(true);
    setSaveError('');
    try {
      await adminApi('lead-contact', { ...payload, entryId: retry.current.id });
      retry.current = null;
      setOutcome('');
      setNote('');
      setSaved(true);
      closeForm();
      load(0);
    } catch (error) {
      setSaveError((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return <section className="lead-contact" aria-labelledby="lead-contact-title">
    {(callable || canEmail) && <div className="lead-contact-actions" role="group" aria-label={t('Contact shortcuts')}>
      {callable && <a href={`tel:${phone}`}><Phone size={15} aria-hidden="true" />{t('Call')}</a>}
      <LeadWhatsAppLink phone={lead.phone} />
      {canEmail && <a href={`mailto:${encodeURIComponent(email).replace('%40', '@')}`}><Mail size={16} aria-hidden="true" />{t('Email')}</a>}
    </div>}
    <div className="lead-contact-history">
      <header>
        <span className="follow-up-icon"><History size={17} aria-hidden="true" /></span>
        <h3 id="lead-contact-title">{t('Contact history')}</h3>
        <button ref={logButton} className="lead-contact-log" type="button" aria-expanded={editing} aria-disabled={saving}
          onClick={() => {
            if (saving) return;
            setSaved(false);
            if (editing) closeForm();
            else setEditing(true);
          }}>
          <Plus size={15} aria-hidden="true" />{t('Log contact')}
        </button>
      </header>
      {editing && <form className="lead-contact-form" onSubmit={logContact}>
        <div className="lead-contact-fields">
          <div><span>{t('Contact method')}</span><AdminSelect label={t('Contact method')} variant="field" value={channel}
            choices={Object.entries(channelLabels).map(([value, label]) => ({ value, label: t(label) }))}
            onChange={value => setChannel(value as Channel)} /></div>
          <div><span>{t('Outcome')}</span><AdminSelect label={t('Outcome')} variant="field" value={outcome}
            choices={[{ value: '', label: t('Choose an outcome') }, ...Object.entries(outcomeLabels).map(([value, label]) => ({ value, label: t(label) }))]}
            onChange={value => setOutcome(value as Outcome | '')} /></div>
        </div>
        <label>{t('Contact note (optional)')}
          <textarea rows={2} maxLength={1500} value={note} onChange={event => setNote(event.target.value)} />
        </label>
        {saveError && <p role="alert" className="lead-contact-error">{errorText(saveError)}</p>}
        <div className="lead-contact-form-actions">
          <button type="button" disabled={saving} onClick={closeForm}>{t('Cancel')}</button>
          <button type="submit" disabled={saving || !outcome}>{t(saving ? 'Saving…' : 'Save contact')}</button>
        </div>
      </form>}
      {saved && <span className="sr-only" role="status">{t('Contact logged.')}</span>}
      {loadError ? <div className="lead-contact-message" role="alert">{t('Could not load contact history.')}
        <button type="button" onClick={() => load(page)}>{t('Try again')}</button>
      </div> : !history ? <p className="lead-contact-message" role="status">{t('Loading contact history…')}</p>
        : history.entries.length === 0 ? <p className="lead-contact-message">{t('No contact logged yet.')}</p>
        : <ol className="lead-contact-timeline">
          {history.entries.map(entry => <li key={entry.id}>
            <div><strong>{t(channelLabels[entry.channel])}</strong><span>{t(outcomeLabels[entry.outcome])}</span></div>
            <time dateTime={entry.created_at}>{formatDate.format(new Date(entry.created_at))}</time>
            {entry.note && <p>{entry.note}</p>}
          </li>)}
        </ol>}
      {history && (page > 0 || history.hasMore) && <footer className="lead-contact-pagination">
        <button type="button" disabled={page === 0} onClick={() => load(page - 1)}>{t('Newer contacts')}</button>
        <button type="button" disabled={!history.hasMore} onClick={() => load(page + 1)}>{t('Older contacts')}</button>
      </footer>}
    </div>
  </section>;
}
