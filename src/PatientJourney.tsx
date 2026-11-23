import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarCheck2, Check, Clock, MapPin, RotateCcw, Search } from 'lucide-react';
import { landingDefaults, demoCta } from './content/landing';
import './patient-journey.css';

type Language = 'en' | 'fr';

const labels = {
  en: {
    example: 'Fictional patient journey', replay: 'Replay', center: 'Jardin Imaging Center',
    steps: ['Find a center', 'Send a request', 'Confirm the visit'],
    search: 'Radiology near me', location: 'Medical imaging · Marrakech', service: 'Ultrasound',
    request: 'Appointment request', examination: 'Examination', showNew: 'Show new request', showConfirmed: 'Show confirmation', sent: 'Sent after hours', appointment: 'Appointments',
    fresh: 'New', confirmed: 'Confirmed', date: 'Wednesday at 10:30',
  },
  fr: {
    example: 'Parcours patient fictif', replay: 'Rejouer', center: 'Centre d’imagerie du Jardin',
    steps: ['Trouver un centre', 'Envoyer une demande', 'Confirmer le rendez-vous'],
    search: 'Radiologie à proximité', location: 'Imagerie médicale · Marrakech', service: 'Échographie',
    request: 'Demande de rendez-vous', examination: 'Examen', showNew: 'Voir la nouvelle demande', showConfirmed: 'Voir la confirmation', sent: 'Envoyée hors horaires', appointment: 'Rendez-vous',
    fresh: 'Nouveau', confirmed: 'Confirmé', date: 'Mercredi à 10 h 30',
  },
};

function Preview({ language, step, confirmed }: { language: Language; step: number; confirmed: boolean }) {
  const t = labels[language];
  if (step === 0) return (
    <div className="journey-crop journey-crop-search">
      <div className="journey-screen">
        <div className="journey-field"><Search size={15} />{t.search}</div>
        <div className="journey-result">
          <MapPin size={19} />
          <div><strong>{t.center}</strong><small>{t.location}</small></div>
        </div>
      </div>
    </div>
  );
  if (step === 1) return (
    <div className="journey-crop journey-crop-request">
      <div className="journey-screen">
        <strong>{t.request}</strong>
        <div className="journey-field journey-form-field"><span>{t.examination}</span><strong>{t.service}</strong></div>
        <div className="journey-stamp"><Clock size={13} /><time>22:47</time><span>{t.sent}</span></div>
      </div>
    </div>
  );
  return (
    <div className="journey-crop journey-crop-dashboard">
      <div className="journey-screen">
        <div className="journey-dashboard-label"><CalendarCheck2 size={15} />{t.appointment}</div>
        <div className="journey-record">
          <div><strong>{t.service}</strong><small>{confirmed ? t.date : '22:47'}</small></div>
          <span key={String(confirmed)} className="journey-status" data-confirmed={confirmed}>
            {confirmed && <Check size={13} />}{confirmed ? t.confirmed : t.fresh}
          </span>
        </div>
      </div>
    </div>
  );
}

export function HeroJourney({ language }: { language: Language }) {
  const t = labels[language];
  const target = useRef<HTMLDivElement>(null);
  const visible = useInView(target, { once: true, amount: 0.35 });
  const reduced = useReducedMotion();
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const activeFrame = playing && reduced ? 3 : frame;
  const step = Math.min(activeFrame, 2);

  useEffect(() => {
    if (!visible || reduced || !playing || frame >= 3) return;
    const timer = window.setTimeout(() => setFrame(frame + 1), 1450);
    return () => window.clearTimeout(timer);
  }, [visible, reduced, playing, frame]);

  return (
    <div ref={target} data-i18n-managed="true" className="hero-journey">
      <div className="hero-journey-bar">
        <span>{t.example}</span>
        {!reduced && <button type="button" onClick={() => { setFrame(0); setPlaying(true); }}><RotateCcw size={14} />{t.replay}</button>}
      </div>
      <div className="hero-journey-preview" key={step}>
        <Preview language={language} step={step} confirmed={activeFrame === 3} />
      </div>
      <div className="hero-journey-steps">
        {t.steps.map((label, index) => (
          <button key={label} type="button" aria-pressed={step === index} onClick={() => {
            setPlaying(false);
            setFrame(index === 2 ? 3 : index);
          }}>{label}</button>
        ))}
      </div>
    </div>
  );
}

export function PatientJourney({ language, className = '' }: { language: Language; className?: string }) {
  const t = labels[language];
  const copy = landingDefaults[language];
  const heading = useRef<HTMLHeadingElement>(null);
  const headingVisible = useInView(heading, { once: true });
  const reduced = useReducedMotion();
  const dashboard = useRef<HTMLDivElement>(null);
  const visible = useInView(dashboard, { once: true, amount: 0.5 });
  const [confirmed, setConfirmed] = useState(false);
  const [manualStatus, setManualStatus] = useState<boolean | null>(null);
  const showConfirmed = manualStatus ?? (Boolean(reduced) || confirmed);

  useEffect(() => {
    if (!visible || reduced || manualStatus !== null) return;
    const timer = window.setTimeout(() => setConfirmed(true), 1250);
    return () => window.clearTimeout(timer);
  }, [visible, reduced, manualStatus]);

  return (
    <section id="outcomes" aria-labelledby="outcomes-title" data-i18n-managed="true" className={`patient-journey ${className}`}>
      <div className="patient-journey-content">
        <header>
          <h2 ref={heading} id="outcomes-title" data-highlight={headingVisible}>{language === 'fr' ? <>De la première recherche au <span>rendez-vous confirmé.</span></> : <>From first search to <span>confirmed visit.</span></>}</h2>
          <p>{copy.journeyBody}</p>
        </header>
        <ol className="patient-journey-grid">
          {copy.stages.map(([, title, description], index) => (
            <li key={index}>
              <motion.div ref={index === 2 ? dashboard : undefined}
                initial={reduced ? false : { y: 10 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.45 }}
                transition={{ duration: reduced ? 0 : 0.4 }}>
                <Preview language={language} step={index} confirmed={showConfirmed} />
              </motion.div>
              <h3>{title}</h3>
              <p>{description}</p>
              {index === 2 && (
                <button className="journey-toggle" type="button" onClick={() => setManualStatus(!showConfirmed)}>
                  {showConfirmed ? t.showNew : t.showConfirmed}<ArrowRight size={13} aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ol>
        <div className="patient-journey-footer"><span>{t.example}</span><a href="#book-demo" data-cta-placement="how-it-works">{demoCta[language]} <ArrowRight size={16} /></a></div>
      </div>
    </section>
  );
}
