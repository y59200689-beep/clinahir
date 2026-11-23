import { SiteContentProvider } from './content/SiteContent';
import Hero from '../components/templates/ai-marketing-landing-page-kelo/Hero';
import PrivacyNotice from './PrivacyNotice';
import { DeferredSection } from './components/DeferredSection';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
const MarketingDetails = lazy(() => import('./MarketingDetails'));
import { french } from './translations';

function usePageLanguage(language) {
  const originalsRef = useRef(new WeakMap());
  const originalAttributesRef = useRef(new WeakMap());
  useEffect(() => {
    const root = document.querySelector('main');
    if (!root) return;
    const ignored = '[data-language-selector], [data-i18n-managed], script, style';
    const originals = originalsRef.current;
    const attributes = originalAttributesRef.current;
    const translation = (text, element) => text === 'Appointments' && element?.closest('h1') ? 'confirmés' : french[text];
    const translateNode = node => {
      const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      if (!element || element.closest(ignored)) return;
      if (node.nodeType === Node.TEXT_NODE) {
        const current = node.nodeValue;
        if (!current?.trim()) return;
        let original = originals.get(node) ?? current;
        if (current !== original && current.trim() !== translation(original.trim(), element)) original = current;
        const translated = translation(original.trim(), element);
        if (!translated && !originals.has(node)) return;
        originals.set(node, original);
        const next = language === 'fr' && translated ? original.replace(original.trim(), translated) : original;
        if (current !== next) node.nodeValue = next;
      } else {
        for (const name of ['placeholder', 'aria-label', 'alt', 'title']) {
          if (!element.hasAttribute(name)) continue;
          let values = attributes.get(element);
          if (!values) { values = {}; attributes.set(element, values); }
          const current = element.getAttribute(name);
          let original = values[name] ?? current;
          if (current !== original && current !== french[original]) original = current;
          values[name] = original;
          const next = language === 'fr' ? french[original] ?? original : original;
          if (current !== next) element.setAttribute(name, next);
        }
      }
    };
    const translateTree = node => {
      if (!node.isConnected) return;
      translateNode(node);
      if (node.nodeType !== Node.ELEMENT_NODE || node.matches(ignored) || node.closest(ignored)) return;
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode: candidate => candidate.nodeType === Node.ELEMENT_NODE && candidate.matches(ignored) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
      });
      while (walker.nextNode()) translateNode(walker.currentNode);
    };
    translateTree(root);
    // English needs only the one restoration pass; React already renders English legacy copy.
    if (language !== 'fr') return;
    let frame = 0;
    const pending = new Set();
    const options = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'alt', 'title'] };
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === 'childList') record.addedNodes.forEach(node => pending.add(node));
        else pending.add(record.target);
      }
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        observer.disconnect();
        for (const node of pending) translateTree(node);
        pending.clear();
        observer.observe(root, options);
      });
    });
    observer.observe(root, options);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); pending.clear(); };
  }, [language]);
}

export function App() {
  const [language, setLanguage] = useState('fr');
  const languageChosen = useRef(false);
  const chooseLanguage = next => { languageChosen.current = true; setLanguage(next); };
  usePageLanguage(language);
  useEffect(() => { try { const intent=window.__clinahirLocaleIntent?.site; if (!languageChosen.current) { if(intent === 'fr' || intent === 'en') setLanguage(intent); else if(localStorage.getItem('site-language') === 'en') setLanguage('en'); } } catch { /* Optional preference. */ } }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    try { localStorage.setItem('site-language', language); } catch { /* Preference is optional. */ }
    const description = language === 'fr' ? 'Visibilité digitale et coordination des rendez-vous pour centres de radiologie au Maroc. Explorez la démonstration avec des données fictives.' : 'Digital visibility and appointment coordination for imaging centers in Morocco. Explore the demo with fictional data.';
    document.querySelector('meta[name=description]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', language === 'fr' ? 'fr_MA' : 'en_US');
    document.title = language === 'fr' ? 'Clinahir — Parcours patient pour centres de radiologie au Maroc' : 'Clinahir — Patient journeys for imaging centers in Morocco';
  }, [language]);
  return <><a href="#interactive-demo" className="skip-link">{language === 'fr' ? 'Accéder à la démonstration' : 'Skip to interactive demo'}</a><main data-public-site="true" className="min-h-screen"><PrivacyNotice language={language} /><Hero language={language} onLanguageChange={chooseLanguage} /><DeferredSection language={language} hashTargets={['solutions','outcomes','process','about','book-demo','faq']}><Suspense fallback={<p role="status" data-i18n-managed="true" className="marketing-loading">{language === 'fr' ? 'Chargement des informations…' : 'Loading details…'}</p>}><MarketingDetails language={language} onLanguageChange={chooseLanguage} /></Suspense></DeferredSection></main></>;
}

export function PublicRoot() { return <div data-public-root="true"><SiteContentProvider><App /></SiteContentProvider></div>; }
