import { useSiteContent } from '../../../src/content/SiteContent';
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";


export default function Faq05Kelo({ className, language = "en" }: { className?: string; language?: "en" | "fr" }) {
  const { document: site } = useSiteContent();
  const faqs=site.faq[language];
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <section id="faq" className={"w-full bg-[var(--surface)] py-20 px-6 font-sans " + (className || "")}>
        <div className="max-w-[620px] mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-[var(--text-primary)] font-sans text-[48px] font-semibold leading-[1.1] tracking-tight mb-5 text-center">
              Questions about <br /> your center?
            </h2>
            <p className="text-[var(--text-secondary)] text-[16px] leading-[1.6] text-center max-w-[450px] mx-auto">
              Clear answers about your digital platform and growth support.
            </p>
          </div>

          {/* Accordion Area */}
          <div className="relative max-w-[580px] mx-auto">
            {/* FAQ Accordion Container */}
            <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
              {faqs.map((faq: { question: string; answer: string }, index: number) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={index}
                    className={"relative bg-transparent transition-colors duration-150 border-b border-[var(--border)] last:border-b-0 " + (!isOpen ? "hover:bg-slate-50/80" : "")}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      className="w-full text-left p-6 flex items-center justify-between cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--brand-primary)]"
                    >
                      <span className="text-[var(--text-primary)] text-base font-semibold tracking-tight pr-4">
                        {faq.question}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" as const }}
                        className="text-[var(--text-secondary)] text-lg flex items-center justify-center shrink-0"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key={"faq-answer-" + index}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" as const }}
                          className="overflow-hidden"
                        >
                          <div id={`faq-answer-${index}`} className="px-6 pb-6 pt-0">
                            <p className="text-[var(--text-body)] text-sm leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
