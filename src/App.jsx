import Hero from '../components/templates/ai-marketing-landing-page-kelo/Hero';
import Features from '../components/templates/ai-marketing-landing-page-kelo/Features';
import HowItWorks from '../components/templates/ai-marketing-landing-page-kelo/How it Works';
import LandingSections from './LandingSections';
import FAQ from '../components/templates/ai-marketing-landing-page-kelo/FAQ';
import Footer from '../components/templates/ai-marketing-landing-page-kelo/Footer';
import { useEffect, useRef, useState } from 'react';
import { french } from './translations';

function usePageLanguage(language) {
  const originalsRef = useRef(new WeakMap());
  const originalAttributesRef = useRef(new WeakMap());
  useEffect(() => {
    const originals = originalsRef.current;
    const originalAttributes = originalAttributesRef.current;
    const translate = () => {
      const root = document.querySelector('main');
      if (!root) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement?.closest('[data-language-selector], script, style')) continue;
        if (!node.nodeValue?.trim()) continue;
        let original = originals.get(node) ?? node.nodeValue;
        const currentTranslation = original.trim() === 'Appointments' && node.parentElement?.closest('h1')
          ? 'confirmés'
          : french[original.trim()];
        if (node.nodeValue !== original && node.nodeValue.trim() !== currentTranslation) {
          original = node.nodeValue;
        }
        originals.set(node, original);
        const key = original.trim();
        const translated = key === 'Appointments' && node.parentElement?.closest('h1')
          ? 'confirmés'
          : french[key];
        const next = language === 'fr' && translated
          ? original.replace(key, translated)
          : original;
        if (node.nodeValue !== next) node.nodeValue = next;
      }
      root.querySelectorAll('[placeholder], [aria-label], [alt], [title]').forEach((element) => {
        for (const attribute of ['placeholder', 'aria-label', 'alt', 'title']) {
          if (!element.hasAttribute(attribute) || element.closest('[data-language-selector]')) continue;
          let values = originalAttributes.get(element);
          if (!values) { values = {}; originalAttributes.set(element, values); }
          if (!(attribute in values)) values[attribute] = element.getAttribute(attribute);
          const original = values[attribute];
          const next = language === 'fr' ? (french[original] ?? original) : original;
          if (element.getAttribute(attribute) !== next) element.setAttribute(attribute, next);
        }
      });
    };
    translate();
    const observer = new MutationObserver(translate);
    observer.observe(document.querySelector('main'), { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'alt', 'title'] });
    return () => observer.disconnect();
  }, [language]);
}

export function App() {
  const [language, setLanguage] = useState(() => localStorage.getItem('site-language') === 'fr' ? 'fr' : 'en');
  usePageLanguage(language);
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('site-language', language);
  }, [language]);
  return <main className="min-h-screen"><Hero language={language} /><div id="solutions"><Features /></div><HowItWorks /><LandingSections language={language} /><FAQ /><Footer language={language} onLanguageChange={setLanguage} /></main>;
}
