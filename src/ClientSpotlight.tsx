import { demoCta } from './content/landing';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Globe2, 
  Camera, 
  MapPin, 
  Search, 
  Megaphone, 
  Star, 
  TrendingUp, 
  CheckCircle2, 
  Smartphone, 
  Monitor, 
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { clientDefaults as copy } from './content/client';
import { useManagedCopy, useSiteContent } from './content/SiteContent';
import websitePreview from './assets/bab-doukkala-website.jpg';

type Language = 'en' | 'fr';

interface MetricItem {
  value: string;
  label: string;
  sublabel: string;
}

export default function ClientSpotlight({ language = 'en' }: { language?: Language }) {
  const fr = language === 'fr';
  const t = useManagedCopy('client', copy[language], language);
  const { document: site } = useSiteContent();

  const [activeTab, setActiveTab] = useState<'website' | 'seo' | 'social'>('website');
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');

  const metrics: MetricItem[] = fr ? [
    { value: '+340%', label: 'Demandes en Ligne', sublabel: 'Volume de rendez-vous digitalisés' },
    { value: '< 3 min', label: 'Temps de Traitement', sublabel: 'Prise en charge secrétaire par WhatsApp' },
    { value: '4.9 ★', label: 'Avis Google Maps', sublabel: 'Plus de 520 avis patients vérifiés' },
    { value: '-78%', label: 'Rendez-vous Manqués', sublabel: 'Grâce au rappel automatique' },
  ] : [
    { value: '+340%', label: 'Online Bookings', sublabel: 'Growth in digital appointment requests' },
    { value: '< 3 min', label: 'Response Time', sublabel: 'Average reception WhatsApp triage' },
    { value: '4.9 ★', label: 'Google Rating', sublabel: 'Over 520 verified patient reviews' },
    { value: '-78%', label: 'No-Show Rate', sublabel: 'Drop with automated appointment reminders' },
  ];

  return (
    <section 
      id="client-project" 
      aria-labelledby="client-project-title" 
      className="relative scroll-mt-12 bg-[#070b09] px-6 py-24 md:px-12"
    >
      <div className="relative mx-auto max-w-7xl">
        
        {/* Apple Keynote Style Header */}
        <div className="mb-14 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-400">
              <CheckCircle2 size={13} />
              {fr ? 'Étude de cas partenaire' : 'Verified partner case study'}
            </span>
            <span className="text-xs text-white/40">·</span>
            <span className="text-xs text-white/60">Marrakech, Maroc</span>
          </div>

          <h2 
            id="client-project-title" 
            className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[46px]"
          >
            {t.client}
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            {fr ? (
              'Comment le centre d’imagerie médicale Bab Doukkala a transformé son acquisition patient et éliminé les files d’attente téléphoniques grâce à l’écosystème Clinahir.'
            ) : (
              'How one leading medical imaging center in Marrakech modernized its patient journey, capturing high-intent demand and eliminating phone bottlenecks.'
            )}
          </p>
        </div>

        {/* Highlight Metrics Bar */}
        <div className="mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {metric.value}
              </div>
              <div className="mt-1 text-xs font-semibold text-[#01bc7c]">
                {metric.label}
              </div>
              <div className="mt-1 text-[11px] leading-snug text-white/50">
                {metric.sublabel}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Showcase Bento Card */}
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-2xl backdrop-blur-2xl sm:p-10 lg:p-12">
          
          {/* Interactive Navigation Pills */}
          <div className="mb-8 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('website')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === 'website' 
                    ? 'bg-white text-black shadow-md' 
                    : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Globe2 size={15} />
                <span>{fr ? 'Site Web Haute Conversion' : 'High-Conversion Website'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === 'seo' 
                    ? 'bg-white text-black shadow-md' 
                    : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Search size={15} />
                <span>{fr ? 'Google Maps #1' : 'Local SEO Dominance'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('social')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                  activeTab === 'social' 
                    ? 'bg-white text-black shadow-md' 
                    : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Camera size={15} />
                <span>{fr ? 'Réseaux & Instagram' : 'Social & Campaigns'}</span>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {site.settings.clientWebsite && (
                <a
                  href={site.settings.clientWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  <Globe2 size={14} />
                  <span>{fr ? 'Visiter le site en ligne' : 'Visit Live Site'}</span>
                  <ArrowUpRight size={13} className="text-white/60" />
                </a>
              )}

              {site.settings.clientInstagram && (
                <a
                  href={site.settings.clientInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <Camera size={14} />
                  <span>{fr ? 'Instagram du Centre' : 'Instagram'}</span>
                  <ArrowUpRight size={13} className="text-white/50" />
                </a>
              )}
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            
            {/* Left Context & Clinical Details (Span 5) */}
            <div className="space-y-6 lg:col-span-5">
              <AnimatePresence mode="wait">
                {activeTab === 'website' && (
                  <motion.div
                    key="tab-website"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-[#01bc7c]">
                      <Globe2 size={16} />
                      <span>{fr ? 'Expérience Patient Numérique' : 'Digital Patient Experience'}</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-white">
                      {fr ? 'Un site clair, rapide et pensé pour la prise de rendez-vous' : 'Clear, fast, engineered for appointment booking'}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/70">
                      {fr ? (
                        'Le site de Radiologie Bab Doukkala présente de façon détaillée chaque examen (IRM, Scanner, Échographie, Mammographie, Radiologie générale) avec les consignes de préparation, le dépôt d’ordonnance en 1 clic et la sélection d’un créneau horaire.'
                      ) : (
                        'The official Radiologie Bab Doukkala platform presents every diagnostic service with patient preparation guides, 1-click prescription upload, and instant scheduling.'
                      )}
                    </p>
                    <ul className="space-y-2 text-xs text-white/80">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-[#01bc7c]" />
                        <span>{fr ? 'Temps de chargement < 0.8s sur mobile' : 'Under 0.8s mobile page load time'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-[#01bc7c]" />
                        <span>{fr ? 'Formulaire sans friction avec envoi WhatsApp direct' : 'Frictionless form with instant WhatsApp dispatch'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-[#01bc7c]" />
                        <span>{fr ? 'Accessible en français et arabe' : 'Available in French & Arabic'}</span>
                      </li>
                    </ul>
                  </motion.div>
                )}

                {activeTab === 'seo' && (
                  <motion.div
                    key="tab-seo"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-[#01bc7c]">
                      <Search size={16} />
                      <span>{fr ? 'Visibilité Locale & Google Maps' : 'Local Search Dominance'}</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-white">
                      {fr ? 'Position #1 pour les requêtes médicales à Marrakech' : 'Rank #1 for high-intent radiology searches in Marrakech'}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/70">
                      {fr ? (
                        'Grâce à notre stratégie SEO locale, le centre apparaît en première position sur Google Maps et en recherche organique pour "centre de radiologie marrakech", "irm marrakech" et "scanner bab doukkala", générant un flux continu de patients qualifiés.'
                      ) : (
                        'Through localized medical SEO, the center ranks first on Google Maps and organic search for key radiology terms in Marrakech, capturing recurring high-intent patient appointments.'
                      )}
                    </p>
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs">
                      <div className="flex items-center justify-between text-white/80">
                        <span>{fr ? 'Note moyenne Google :' : 'Google rating:'}</span>
                        <strong className="text-amber-300">★ 4.9 / 5.0</strong>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-white/80">
                        <span>{fr ? 'Avis de patients :' : 'Patient reviews:'}</span>
                        <strong className="text-white">520+ avis</strong>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-white/80">
                        <span>{fr ? 'Appels générés / mois :' : 'Direct calls / month:'}</span>
                        <strong className="text-emerald-400">890+ appels</strong>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'social' && (
                  <motion.div
                    key="tab-social"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium text-[#01bc7c]">
                      <Camera size={16} />
                      <span>{fr ? 'Notoriété & Campagnes Ciblées' : 'Social & Brand Authority'}</span>
                    </div>
                    <h3 className="text-2xl font-semibold text-white">
                      {fr ? 'Éducation médicale des patients & visibilité Instagram' : 'Patient medical education & targeted acquisition'}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/70">
                      {fr ? (
                        'Production de contenus visuels soignés expliquant les examens (dépistage du cancer du sein par tomosynthèse, préparation à l’IRM) pour rassurer les patients et asseoir la réputation d’excellence du centre.'
                      ) : (
                        'High-quality visual content demystifying clinical scans (breast cancer screening, MRI prep protocols) building trust and positioning the center as the benchmark in the region.'
                      )}
                    </p>
                    <ul className="space-y-2 text-xs text-white/80">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-[#01bc7c]" />
                        <span>{fr ? 'Reels pédagogiques sur les examens d\'imagerie' : 'Educational radiology scan reels'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-[#01bc7c]" />
                        <span>{fr ? 'Campagnes de sensibilisation (Octobre Rose, etc.)' : 'Public health awareness campaigns'}</span>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-2">
                <a
                  href="#book-demo" data-i18n-managed="true"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#01bc7c] hover:underline"
                >
                  <span>{demoCta[language]}</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* Right Visual Interactive Frame (Span 7) */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/60 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
                
                {/* Browser Top Bar */}
                <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-black/40 px-4 py-1 text-xs text-white/70">
                    <Globe2 size={12} className="text-[#01bc7c]" />
                    <span className="font-mono text-[11px]">radiologiebabdoukkala.com</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-medium">En ligne</span>
                  </div>
                </div>

                {/* Screenshot Display with Subtle Zoom Effect */}
                <div className="relative overflow-hidden group">
                  <img
                    src={site.settings.clientImage || websitePreview}
                    alt={t.alt}
                    width="1265"
                    height="712"
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.01]"
                  />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Floating Live Badge */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl border border-white/15 bg-black/70 px-3.5 py-2 text-xs text-white backdrop-blur-md">
                    <Sparkles size={14} className="text-[#01bc7c]" />
                    <span>{fr ? 'Plateforme Clinahir déployée avec succès' : 'Powered by Clinahir clinical engine'}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
