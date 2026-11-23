import { HeroJourney } from '../../../src/PatientJourney';
import { demoCta } from '../../../src/content/landing';
import {lazy, Suspense} from 'react';
import {useSiteContent} from '../../../src/content/SiteContent';
import {siteDefaults} from '../../../src/content/schema';
import {DeferredSection} from '../../../src/components/DeferredSection';
const DemoDashboard = lazy(() => import('../../../src/DemoDashboard'));


// ============================================================================
export default function AiMarketingHeroKelo({ className, language = "en", onLanguageChange }: { className?: string; language?: "en" | "fr"; onLanguageChange?: (language: "en" | "fr") => void }) {
  const { document: site } = useSiteContent();
  const hero=site.hero[language];
  return (
    <>
      <section className={"min-h-[110vh] flex flex-col bg-[#173c30] relative " + (className || "")}>
        <img src="/hero-landscape.jpg" alt="" width={1440} height={810} decoding="async" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover z-0" />
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
              <div className="hidden xl:flex items-center gap-5 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
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
                <label data-language-selector className="flex items-center"><span className="sr-only">{language === "fr" ? "Langue" : "Language"}</span><select aria-label="Site language / Langue du site" value={language} onChange={event => onLanguageChange?.(event.target.value as "en" | "fr")} className="rounded-full border border-white/25 bg-white/10 px-2 py-2 text-xs font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><option className="text-black" value="en">EN</option><option className="text-black" value="fr">FR</option></select></label>
                <a href="#book-demo" data-i18n-managed="true" className="hidden sm:inline-flex rounded-full px-4 py-2 text-sm font-semibold bg-[var(--surface)] text-[var(--text-primary)] hover:bg-white/90 transition-colors">
                  {demoCta[language]}
                </a>
              </div>
            </div>
          </nav>
        </div>

        {/* Hero Content */}
        <div className="relative flex-1 flex flex-col items-center text-center px-6 pt-28 sm:pt-36 pb-16 z-10">
          <div className="flex flex-col items-center w-full">
            <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.18fr_1fr] lg:gap-12">
              <div className="lg:text-left" data-i18n-managed="true">
                <h1 className="mb-4 text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:text-5xl lg:text-[clamp(2.75rem,4.3vw,4rem)]">
                  {hero.headline !== siteDefaults.hero[language].headline ? hero.headline : language === "fr"
                    ? <>Transformez les recherches en <span className="hero-journey-highlight">rendez-vous confirmés</span></>
                    : <>Turn more searches into <span className="hero-journey-highlight">booked appointments</span></>}
                </h1>
                <p className="mx-auto mb-7 max-w-[480px] text-base leading-relaxed text-white/90 md:text-lg lg:mx-0">{hero.description}</p>
                <div className="flex flex-col items-center gap-3 lg:items-start">
                  <a href="#book-demo" className="rounded-full border border-white/80 bg-white px-8 py-3.5 text-base font-semibold text-[var(--text-primary)] shadow-lg transition-colors hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                    {demoCta[language]}
                  </a>
                  <span className="text-sm text-white/80">{hero.note}</span>
                </div>
              </div>
              <div className="mx-auto w-full max-w-lg lg:mx-0"><HeroJourney language={language} /></div>
            </div>

            {/* Dashboard */}
            <div id="interactive-demo" tabIndex={-1} aria-label={language === "fr" ? "Démonstration interactive" : "Interactive demonstration"} className="mt-14 w-full max-w-7xl scroll-mt-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
              <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-[#102c23] px-4 py-2 text-xs font-medium text-white">
                <span>{language === "fr" ? "Démonstration interactive" : "Interactive radiology preview"}</span>
                <span className="text-white/40" aria-hidden="true">—</span>
                <span className="text-white/90">{language === "fr" ? "Explorer le tableau de bord" : "Explore the dashboard"}</span>
              </div>
              <DeferredSection className="demo-reserved" language={language} hashTargets={['interactive-demo']}><Suspense fallback={<p role="status" data-i18n-managed="true">{language === 'fr' ? 'Chargement de la démonstration…' : 'Loading the demo…'}</p>}><DemoDashboard language={language} /></Suspense></DeferredSection>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
