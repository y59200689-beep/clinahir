import { useEffect, useState } from 'react';
import { useAdminLocale } from '../i18n';

export function MapsSearchProgress({ status, startedAt }: { status: string; startedAt?: string }) {
  const { t, intlLocale } = useAdminLocale();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const started = Date.parse(startedAt ?? '');
  const elapsed = Math.max(0, Math.floor((now - started) / 1000));
  const minutes = new Intl.NumberFormat(intlLocale).format(Math.floor(elapsed / 60));
  const seconds = new Intl.NumberFormat(intlLocale, { minimumIntegerDigits: 2 }).format(elapsed % 60);
  const running = status === 'running';
  const phase = running ? t('Searching Google Maps') : status === 'starting' ? t('Starting the search') : t('Waiting for the search worker');
  const hint = running ? t('Results appear as they’re captured. Remaining time varies by search.')
    : status === 'starting' ? t('The first image download can take a few minutes.')
    : t('Online searches can take a few minutes to start. You can leave and return to check progress.');

  return (
    <div className="maps-progress">
      <div className="maps-progress-heading">
        <p role="status">{phase}</p>
        {Number.isFinite(started) && <span>{t('Elapsed {{minutes}}:{{seconds}}', { minutes, seconds })}</span>}
      </div>
      <div className="maps-progress-track" role="progressbar" aria-label={t('Search progress')} aria-valuetext={phase}>
        <span data-state={running ? 'complete' : 'active'} />
        <span data-state={running ? 'active' : 'pending'} />
        <span data-state="pending" />
      </div>
      <div className="maps-progress-labels" aria-hidden="true">
        <span data-current={!running}>{t('Start')}</span>
        <span data-current={running}>{t('Search')}</span>
        <span>{t('Results')}</span>
      </div>
      <p className="maps-progress-hint">{hint}</p>
    </div>
  );
}
