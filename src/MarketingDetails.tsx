import { useSiteContent } from './content/SiteContent';
import ClientSpotlight from './ClientSpotlight';
import Features from '../components/templates/ai-marketing-landing-page-kelo/Features';
import HowItWorks from '../components/templates/ai-marketing-landing-page-kelo/How it Works';
import LandingSections from './LandingSections';
import FAQ from '../components/templates/ai-marketing-landing-page-kelo/FAQ';
import Footer from '../components/templates/ai-marketing-landing-page-kelo/Footer';

export default function MarketingDetails({ language, onLanguageChange }: { language: 'en' | 'fr'; onLanguageChange: (language: 'en' | 'fr') => void }) {
  const { document: site } = useSiteContent();
  return <>
    {site.settings.sections.solutions && <div id="solutions" className="deferred-section"><Features language={language} /></div>}
    {site.settings.sections.client && <ClientSpotlight language={language} />}
    {site.settings.sections.outcomes && <div className="deferred-section"><HowItWorks language={language} /></div>}
    <LandingSections language={language} />
    {site.settings.sections.faq && <div className="deferred-section"><FAQ language={language} /></div>}
    <Footer language={language} onLanguageChange={onLanguageChange} />
  </>;
}
