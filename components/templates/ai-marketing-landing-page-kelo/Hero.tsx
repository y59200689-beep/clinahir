import {lazy, Suspense, useEffect, useRef, useState} from 'react';
import {useSiteContent} from '../../../src/content/SiteContent';
import {siteDefaults} from '../../../src/content/schema';
import {DeferredSection} from '../../../src/components/DeferredSection';
const DemoDashboard = lazy(() => import('../../../src/DemoDashboard'));


// ============================================================================
export default function AiMarketingHeroKelo({ className, language = "en", onLanguageChange }: { className?: string; language?: "en" | "fr"; onLanguageChange?: (language: "en" | "fr") => void }) {
  const { document: site } = useSiteContent();
  const hero=site.hero[language];
  const [reducedMotion, setReducedMotion] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  useEffect(() => { const media=window.matchMedia('(prefers-reduced-motion: reduce)'); const changed=()=>setReducedMotion(media.matches); changed(); media.addEventListener('change',changed); return ()=>media.removeEventListener('change',changed); }, []);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.6;
    }
  }, []);

  return (
    <>
      <section className={"min-h-[110vh] flex flex-col bg-[#173c30] relative " + (className || "")}>
        <img src="/hero-landscape.jpg" alt="" width={1440} height={810} decoding="async" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover z-0" />
        {/* Optional motion shares the same landscape; no autoplay transfer on initial load. */}
        {!reducedMotion && videoEnabled && <video
          ref={videoRef}
          autoPlay
          aria-hidden="true"
          preload="none"
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="https://cdn.jiro.build/Kelo/Hero%202%20Video.mp4" type="video/mp4" />
        </video>}

        {!reducedMotion && <button type="button" onClick={() => setVideoEnabled(value => !value)} className="absolute right-4 top-24 z-20 rounded-full border border-white/40 bg-[#173c30] px-3 py-2 text-xs text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white" aria-pressed={videoEnabled} data-i18n-managed="true">{language === 'fr' ? (videoEnabled ? 'Arrêter l’animation' : 'Animer le paysage') : (videoEnabled ? 'Stop background motion' : 'Animate landscape')}</button>}
        {/* Overlay */}
        <div className="absolute inset-0 bg-[var(--hero-veil)] z-[1]" />

        {/* Navigation Bar — centering wrapper holds translate, motion handles only the entrance animation */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
<nav>
            <div className="relative flex items-center justify-between p-[10px] rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
              {/* Left: Logo */}
              <div className="flex items-center pl-3">
                <span className="text-xl font-bold tracking-tight text-white" aria-label="Clinahir">Clinahir</span>
              </div>

              {/* Center: Nav Links — absolutely centered relative to pill */}
              <div className="hidden lg:flex items-center gap-5 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
                {["Solutions", "Demo", "Process", "About"].map((item, index) => item === "Solutions" && !site.settings.sections.solutions ? null : (
                  <a
                    key={item}
                    href={"#" + ["solutions", "interactive-demo", "process", "about"][index]}
                    className="text-[15px] font-medium text-white/70 hover:text-white transition-colors relative group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[var(--surface)] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
                  </a>
                ))}
              </div>

              {/* Right: Buttons */}
              <div className="flex items-center gap-3">
                <label data-language-selector className="flex items-center"><span className="sr-only">{language === "fr" ? "Langue" : "Language"}</span><select aria-label="Site language / Langue du site" value={language} onChange={event => onLanguageChange?.(event.target.value as "en" | "fr")} className="rounded-full border border-white/25 bg-white/10 px-2 py-2 text-xs font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><option className="text-black" value="en">EN</option><option className="text-black" value="fr">FR</option></select></label><a href="#book-demo" className="hidden xl:inline-flex text-[15px] font-medium text-white/70 hover:text-white transition-colors px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                  Contact
                </a>
                <a href="#book-demo" className="rounded-full px-5 py-2 text-[15px] font-semibold bg-[var(--surface)] text-[var(--text-primary)] hover:bg-white/90 transition-colors">
                  Book a Demo
                </a>
              </div>
            </div>
          </nav>
        </div>

        {/* Hero Content */}
        <div className="relative flex-1 flex flex-col items-center text-center px-6 pt-36 sm:pt-40 pb-16 z-10">
          <div className="flex flex-col items-center w-full">

            {/* Headline */}
            <h1 data-i18n-managed="true"
              className="text-center font-semibold text-4xl sm:text-5xl md:text-6xl lg:text-[62px] leading-[1.1] tracking-[-0.02em] text-white max-w-4xl mt-0 mb-4"
            >
              {hero.headline!==siteDefaults.hero[language].headline ? hero.headline : language === "fr" ? <>Transformez les recherches<br className="hidden sm:block"/> en rendez-vous confirmés</> : <>Turn More Searches Into<br />Booked Appointments</>}
            </h1>

            {/* Subheadline */}
            <p data-i18n-managed="true"
              className="text-center text-base md:text-lg text-white/90 max-w-[480px] leading-relaxed mb-8"
            >
              {hero.description}
            </p>

            {/* CTA */}
<div className="flex flex-col items-center gap-3">
              <a href="#book-demo"
                className="rounded-full px-8 py-3.5 text-base font-semibold bg-white border border-white/80 text-[var(--text-primary)] hover:bg-white/90 transition-colors shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                {hero.cta}
              </a>
              <span className="text-sm text-white/60">
                {hero.note}
              </span>
            </div>

            {/* Dashboard */}
            <div id="interactive-demo" tabIndex={-1} aria-label={language === "fr" ? "Démonstration interactive" : "Interactive demonstration"} className="mt-10 w-full scroll-mt-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
              <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md">
                <span>{language === "fr" ? "Démonstration interactive" : "Interactive radiology preview"}</span>
                <span className="text-white/40" aria-hidden="true">—</span>
                <span className="text-white/90">{language === "fr" ? "Explorer le tableau de bord" : "Explore the dashboard"}</span>
              </div>
              <p className="mb-4 text-sm font-medium text-white/85">{language === "fr" ? "Données fictives uniquement. Aucun dossier patient réel. Modifications temporaires." : "Fictional data only. No real patient records. Changes reset on reload."}</p>
              <DeferredSection className="demo-reserved" language={language} hashTargets={['interactive-demo']}><Suspense fallback={<p role="status" data-i18n-managed="true">{language === 'fr' ? 'Chargement de la démonstration…' : 'Loading the demo…'}</p>}><DemoDashboard language={language} /></Suspense></DeferredSection>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
