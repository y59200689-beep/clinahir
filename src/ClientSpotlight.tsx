import { ArrowRight, ArrowUpRight, Globe2, Camera, MapPin, Search, Megaphone } from 'lucide-react';
import websitePreview from './assets/bab-doukkala-website.jpg';

type Language = 'en' | 'fr';
const copy = {
  en: {
    eyebrow: 'FEATURED CLIENT PROJECT', title: 'A real center. A connected digital presence.',
    client: 'Radiologie Bab Doukkala', location: 'Medical imaging · Marrakech, Morocco',
    body: 'We built the center’s website and continue to manage its Instagram presence, website SEO, Google Maps SEO, and paid advertising to attract new patients.',
    built: 'Website built by Clinahir', ongoing: 'Ongoing growth support',
    website: 'Explore the website', instagram: 'View Instagram', cta: 'See what this could look like for your center',
    caption: 'The center’s public website', alt: 'Homepage of the Radiologie Bab Doukkala website built by Clinahir',
    services: [
      ['Website & booking', 'Full website design and development, examination pages, and online appointment requests.'],
      ['Search & local visibility', 'Ongoing SEO for the website and the center’s Google Maps presence.'],
      ['Social & paid campaigns', 'Instagram management and paid advertising focused on attracting new patients.'],
    ],
  },
  fr: {
    eyebrow: 'PROJET CLIENT À LA UNE', title: 'Un centre réel. Une présence digitale connectée.',
    client: 'Radiologie Bab Doukkala', location: 'Imagerie médicale · Marrakech, Maroc',
    body: 'Nous avons créé le site du centre et continuons à gérer sa présence Instagram, le référencement du site, le SEO Google Maps et les campagnes publicitaires pour attirer de nouveaux patients.',
    built: 'Site créé par Clinahir', ongoing: 'Accompagnement continu',
    website: 'Découvrir le site', instagram: 'Voir Instagram', cta: 'Voyons ce que cela pourrait apporter à votre centre',
    caption: 'Le site public du centre', alt: 'Page d’accueil du site Radiologie Bab Doukkala créé par Clinahir',
    services: [
      ['Site & rendez-vous', 'Conception et développement du site complet, pages d’examens et demandes de rendez-vous en ligne.'],
      ['Référencement & visibilité locale', 'SEO du site et référencement de la présence du centre sur Google Maps.'],
      ['Réseaux sociaux & publicité', 'Gestion Instagram et campagnes publicitaires pour attirer de nouveaux patients.'],
    ],
  },
};

export default function ClientSpotlight({ language = 'en' }: { language?: Language }) {
  const t = copy[language];
  const icons = [Globe2, Search, Megaphone];
  const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-primary)]';
  return <section id="client-project" aria-labelledby="client-project-title" className="scroll-mt-8 bg-[var(--surface)] px-6 pb-24 md:px-12">
    <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-white/10 bg-[var(--brand-dark)] text-white shadow-[0_24px_70px_rgba(0,0,0,.12)]">
      <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:p-12">
        <div className="min-w-0">
          <p className="mb-5 text-xs font-bold tracking-[.18em] text-[var(--brand-primary)]">{t.eyebrow}</p>
          <h2 id="client-project-title" className="max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">{t.title}</h2>
          <div className="mt-8 border-l-2 border-[var(--brand-primary)] pl-5">
            <h3 className="text-xl font-semibold">{t.client}</h3>
            <p className="mt-2 flex items-start gap-2 text-sm text-white/70"><MapPin size={15} className="mt-0.5 shrink-0"/>{t.location}</p>
          </div>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75">{t.body}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="https://www.radiologie-babdoukkala.com/" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--brand-dark)] transition-colors hover:bg-white/90 ${focus}`}>{t.website}<ArrowUpRight size={17} aria-hidden="true"/></a>
            <a href="https://www.instagram.com/radiologie_bab_doukkala/" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold transition-colors hover:bg-white/10 ${focus}`}><Camera size={17} aria-hidden="true"/>{t.instagram}<ArrowUpRight size={15} aria-hidden="true"/></a>
          </div>
        </div>
        <figure className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/5 shadow-[0_20px_50px_rgba(0,0,0,.25)]">
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3"><Globe2 size={14} className="shrink-0 text-white/60" aria-hidden="true"/><span className="min-w-0 truncate text-xs text-white/80">radiologie-babdoukkala.com</span><ArrowUpRight size={14} className="ml-auto shrink-0 text-white/50" aria-hidden="true"/></div>
            <img src={websitePreview} alt={t.alt} width="1265" height="712" loading="lazy" decoding="async" className="block h-auto w-full"/>
          </div>
          <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-white/65"><span>{t.caption}</span><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-primary)]" aria-hidden="true"/>{t.built}</span></figcaption>
        </figure>
      </div>
      <div className="grid border-t border-white/10 md:grid-cols-3">
        {t.services.map(([title,body],index)=>{const Icon=icons[index];return <div key={title} className={`min-w-0 p-7 sm:p-8 ${index?'border-t border-white/10 md:border-l md:border-t-0':''}`}><Icon size={22} className="mb-5 text-[var(--brand-primary)]" aria-hidden="true"/><h4 className="mb-3 text-base font-semibold">{title}</h4><p className="text-sm leading-relaxed text-white/65">{body}</p></div>;})}
      </div>
      <div className="flex flex-col gap-4 border-t border-white/10 bg-white/5 px-7 py-6 sm:px-10 md:flex-row md:items-center md:justify-between lg:px-12"><span className="text-xs font-medium text-white/65">{t.ongoing}</span><a href="#book-demo" className={`inline-flex items-center gap-3 text-sm font-semibold text-[var(--brand-primary)] underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current ${focus}`}>{t.cta}<ArrowRight size={17} className="shrink-0" aria-hidden="true"/></a></div>
    </div>
  </section>;
}
