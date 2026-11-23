import { demoCta } from '../../../src/content/landing';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, Sparkles, MessageCircle, ShieldCheck, Search, Users } from 'lucide-react';
import { useSiteContent } from '../../../src/content/SiteContent';

interface FAQProps {
  className?: string;
  language?: 'en' | 'fr';
}

export default function FAQ({ className, language = 'en' }: FAQProps) {
  const fr = language === 'fr';
  const { document: site } = useSiteContent();
  const faqs = site.faq[language];

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories = fr ? [
    { id: 'all', label: 'Toutes les questions' },
    { id: 'booking', label: 'Réservation & WhatsApp' },
    { id: 'growth', label: 'Google Maps & SEO' },
    { id: 'tech', label: 'Déploiement & Données' },
  ] : [
    { id: 'all', label: 'All Questions' },
    { id: 'booking', label: 'Booking & WhatsApp' },
    { id: 'growth', label: 'Google Maps & SEO' },
    { id: 'tech', label: 'Deployment & Privacy' },
  ];

  // Filter or tag faqs
  const filteredFaqs = faqs.filter((_, idx) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'booking') return idx === 0 || idx === 6 || idx === 7 || idx === 10;
    if (filterCategory === 'growth') return idx === 8 || idx === 9 || idx === 11;
    if (filterCategory === 'tech') return idx === 1 || idx === 2 || idx === 3 || idx === 4 || idx === 5;
    return true;
  });

  return (
    <section 
      id="faq" 
      aria-labelledby="faq-title"
      className={`relative bg-[#060907] py-24 px-6 text-white md:px-12 ${className || ''}`}
    >
      <div className="relative mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-emerald-400">
            <HelpCircle size={13} />
            <span>Questions fréquentes</span>
          </span>

          <h2 
            id="faq-title"
            className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl"
          >
            {fr ? (
              <>Questions des directeurs <br className="hidden sm:inline" /><span className="text-white/60">de centres de radiologie</span></>
            ) : (
              <>Everything medical directors <br className="hidden sm:inline" /><span className="text-white/60">ask about Clinahir</span></>
            )}
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            {fr ? (
              'Des réponses précises et transparentes sur l’implémentation, l’impact sur votre secrétariat et les résultats attendus.'
            ) : (
              'Clear answers regarding setup timelines, staff onboarding, data protection, and expected clinical returns.'
            )}
          </p>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setFilterCategory(cat.id);
                  setOpenIndex(null);
                }}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  filterCategory === cat.id 
                    ? 'bg-white text-black shadow-md' 
                    : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion Container */}
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-2xl divide-y divide-white/10 shadow-2xl">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={faq.question}
                className={`transition-colors duration-200 ${isOpen ? 'bg-white/[0.02]' : 'hover:bg-white/[0.015]'}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#01bc7c]"
                >
                  <span className="text-sm font-semibold tracking-tight text-white sm:text-base">
                    {faq.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60"
                  >
                    <ChevronDown size={15} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0 text-xs leading-relaxed text-white/70 sm:text-sm">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Bottom Reassurance Banner */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:flex-row">
          <div className="flex items-center gap-3 text-xs text-white/70">
            <MessageCircle size={18} className="text-[#01bc7c] shrink-0" />
            <span>{fr ? 'Une question spécifique concernant votre matériel ou logiciel existant ?' : 'Specific inquiry regarding your current PACS/RIS or center hardware?'}</span>
          </div>
          <a
            href="#book-demo" data-i18n-managed="true"
            className="shrink-0 rounded-full bg-[#01bc7c] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#01a76f]"
          >
            {demoCta[language]}
          </a>
        </div>

      </div>
    </section>
  );
}
