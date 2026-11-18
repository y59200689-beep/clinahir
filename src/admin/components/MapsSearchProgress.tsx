import { useEffect, useState } from 'react';
import { useAdminLocale } from '../i18n';

export function MapsSearchProgress({ status, startedAt, lastWorkerUpdate, total, preparing }: {
  status: string; startedAt?: string; lastWorkerUpdate?: string; total: number; preparing?: boolean;
}) {
  const { t, intlLocale } = useAdminLocale();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const elapsed = Math.max(0, Math.floor((now - Date.parse(startedAt ?? '')) / 1000));
  const number = new Intl.NumberFormat(intlLocale);
  const elapsedText = Number.isFinite(elapsed)
    ? elapsed >= 60
      ? t('{{minutes}}m {{seconds}}s', { minutes: number.format(Math.floor(elapsed / 60)), seconds: number.format(elapsed % 60) })
      : t('{{seconds}}s', { seconds: number.format(elapsed) })
    : '';
  const heartbeatAge = Math.max(0, Math.floor((now - Date.parse(lastWorkerUpdate ?? '')) / 1000));
  const relative = new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' });
  const running = status === 'running';
  const crawling = running && !preparing;
  const delayed = status === 'queued' && elapsed >= 300;
  const stale = running && heartbeatAge >= 120;
  const phase = preparing ? t('Preparing the search worker') : running ? t('Searching Google Maps') : status === 'starting' ? t('Starting the search') : t('Queued');
  const hint = running && !preparing ? t('{{total}} businesses found so far', { total: number.format(total) })
    : status === 'starting' || preparing ? t('The first image download can take a few minutes.')
    : t('The search worker hasn’t picked up this job yet. You can leave and return to check progress.');

  return (
    <div className="maps-progress">
      <div className="maps-progress-heading">
        <p role="status">{phase}</p>
        {elapsedText && <span aria-label={t('Elapsed time')}>{elapsedText}</span>}
      </div>
      <div className="maps-progress-track" role="progressbar" aria-label={t('Search progress')} aria-valuetext={phase}>
        <span data-state={crawling ? 'complete' : 'active'} />
        <span data-state={crawling ? 'active' : 'pending'} />
        <span data-state="pending" />
      </div>
      <div className="maps-progress-labels" aria-hidden="true">
        <span data-current={!crawling}>{t('Start')}</span>
        <span data-current={crawling}>{t('Search')}</span>
        <span>{t('Results')}</span>
      </div>
      {delayed && <p className="maps-progress-warning" role="status">{t('Taking longer than usual to start.')}</p>}
      <p className="maps-progress-hint" role={running && !preparing ? 'status' : undefined}>{hint}</p>
      {running && Number.isFinite(heartbeatAge) && (
        <p className={stale ? 'maps-progress-warning' : 'maps-progress-hint'}>
          {t('Last worker update {{when}}', { when: heartbeatAge >= 60
            ? relative.format(-Math.floor(heartbeatAge / 60), 'minute')
            : relative.format(-heartbeatAge, 'second') })}
        </p>
      )}
    </div>
  );
}
