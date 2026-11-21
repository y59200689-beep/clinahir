import { useEffect, useState } from 'react';
import { ArrowRight, CalendarCheck, CalendarClock } from 'lucide-react';
import { useAdminLocale } from '../i18n';
import { adminApi, type Lead } from '../types';
import { LeadWhatsAppLink } from './LeadContact';
import '../follow-ups.css';

const buckets = { unanswered: 'Awaiting first reply', due: 'All due', overdue: 'Overdue', today: 'Due today', upcoming: 'Upcoming' } as const;
type Bucket = keyof typeof buckets;
interface Queue {
  today: string;
  counts: Record<Exclude<Bucket, 'due'>, number>;
  leads: Lead[];
}

export function FollowUpQueue({ onOpen, onBrowse }: { onOpen: (lead: Lead) => void; onBrowse: () => void }) {
  const { t, intlLocale } = useAdminLocale();
  const [bucket, setBucket] = useState<Bucket>('unanswered');
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<Queue>();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'unavailable'>('loading');

  useEffect(() => {
    let current = true;
    void adminApi<Queue>('follow-ups', undefined, `&bucket=${bucket}&page=${page}`).then(data => {
      if (!current) return;
      setResult(data);
      setStatus('ready');
    }).catch((error: Error & { status?: number }) => {
      if (!current) return;
      setStatus(error.status === 404 ? 'unavailable' : 'error');
    });
    return () => { current = false; };
  }, [bucket, page, revision]);

  function changeView(next: Bucket, nextPage: number) {
    if (next === bucket && nextPage === page) return;
    setStatus('loading');
    setBucket(next);
    setPage(nextPage);
  }

  const counts = result?.counts;
  const due = counts ? counts.overdue + counts.today : 0;
  const total = bucket === 'due' ? due : counts?.[bucket] ?? 0;
  const date = new Intl.DateTimeFormat(intlLocale, { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const dateWithYear = new Intl.DateTimeFormat(intlLocale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const number = new Intl.NumberFormat(intlLocale);

  return <section className="overview-panel follow-up-queue" aria-labelledby="follow-up-title">
    <header className="overview-panel-heading">
      <div className="follow-up-heading">
        <span className="follow-up-icon"><CalendarClock size={20} aria-hidden="true" /></span>
        <div><h2 id="follow-up-title">{t('Today queue')}</h2><p>{t('New inquiries and scheduled follow-ups')}</p></div>
      </div>
      <button type="button" className="overview-text-button" onClick={onBrowse}>
        {t('View leads')} <ArrowRight size={15} aria-hidden="true" />
      </button>
    </header>
    <div className="follow-up-filters" role="group" aria-label={t('Follow-up filters')}>
      {(Object.keys(buckets) as Bucket[]).map(key => <button key={key} type="button"
        aria-pressed={bucket === key} onClick={() => changeView(key, 0)}>
        {t(buckets[key])}
        {counts && <span data-urgent={key === 'overdue' && counts.overdue > 0}>
          {number.format(key === 'due' ? due : counts[key])}
        </span>}
      </button>)}
    </div>
    <div className="follow-up-results" aria-busy={status === 'loading'}>
      {status === 'loading' && <p className="follow-up-message" role="status">{t('Loading follow-ups…')}</p>}
      {(status === 'error' || status === 'unavailable') && <div className="follow-up-message" role="alert">
        {t(status === 'unavailable' ? 'Follow-ups are unavailable in this environment.' : 'Could not load follow-ups.')}
        <button type="button" className="overview-text-button" onClick={() => {
          setStatus('loading');
          setRevision(value => value + 1);
        }}>{t('Try again')}</button>
      </div>}
      {status === 'ready' && result && (result.leads.length ? <ul className="follow-up-list">
        {result.leads.map(lead => {
          const dueDate = bucket === 'unanswered' ? null : lead.admin_due_date;
          const urgency = !dueDate ? undefined : dueDate < result.today ? 'overdue' : dueDate === result.today ? 'today' : 'upcoming';
          const formattedDate = dueDate
            ? (dueDate.slice(0, 4) === result.today.slice(0, 4) ? date : dateWithYear).format(new Date(dueDate + 'T00:00:00Z'))
            : '';
          const phone = lead.phone?.trim().replace(/[\s().-]/g, '').replace(/^00/, '+');
          const email = lead.email?.trim();
          return <li key={lead.external_id}>
            <button type="button" className="follow-up-row" onClick={() => onOpen(lead)}>
              <span className="follow-up-row-detail"><strong>{dueDate ? lead.admin_next_action : t('First reply')}</strong>
                <span>{lead.company_name}</span>
              </span>
              {dueDate && <time dateTime={dueDate} data-urgency={urgency}>
                {urgency === 'today' ? t('Due today') : formattedDate}
                {urgency === 'overdue' && <span><span aria-hidden="true"> · </span>{t('Overdue')}</span>}
              </time>}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <div className="lead-contact-actions px-3 pb-2">
              {phone && /^\+?[0-9]{7,15}$/.test(phone) && <a href={`tel:${phone}`}>{t('Call')}</a>}
              <LeadWhatsAppLink phone={lead.phone} />
              {email && /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email) && <a href={`mailto:${encodeURIComponent(email).replace('%40', '@')}`}>{t('Email')}</a>}
            </div>
          </li>;
        })}
      </ul> : <div className="follow-up-message" role="status">
        <CalendarCheck size={18} aria-hidden="true" />
        {t(bucket === 'unanswered' ? 'No inquiries awaiting a first reply.' : bucket === 'upcoming' ? 'No upcoming follow-ups.' : bucket === 'today' ? 'Nothing due today.' : bucket === 'overdue' ? 'No overdue follow-ups.' : 'You’re caught up on follow-ups.')}
      </div>)}
    </div>
    {status === 'ready' && (total > 10 || page > 0) && <footer className="follow-up-pagination">
      <button type="button" disabled={page === 0} onClick={() => changeView(bucket, page - 1)}>{t('Previous page')}</button>
      <span>{number.format(page + 1)} / {number.format(Math.max(1, Math.ceil(total / 10)))}</span>
      <button type="button" disabled={(page + 1) * 10 >= total} onClick={() => changeView(bucket, page + 1)}>{t('Next page')}</button>
    </footer>}
  </section>;
}
