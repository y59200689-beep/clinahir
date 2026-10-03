"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "How long does it take to build the platform?",
    answer: "Timelines depend on your center’s website, booking and dashboard requirements. We define the scope and schedule together before work begins."
  },
  {
    question: "What happens in the first demo call?",
    answer: "We discuss your center’s current website and appointment process, then walk through the relevant parts of the interactive platform. You can ask for a proposed scope afterward."
  },
  {
    question: "Will our team receive training?",
    answer: "We define onboarding and staff training with you as part of the implementation scope, so your team knows what to expect before launch."
  },
  {
    question: "How are patient data and access handled?",
    answer: "The dashboard on this page uses sample data. For a real implementation, we review data handling, access needs, and responsibilities with your center before any patient information is used."
  },
  {
    question: "Can patients book appointments directly online?",
    answer: "Yes. The platform includes online appointment requests so patients can start the booking process at any time."
  },
  {
    question: "Can our staff manage appointments from the dashboard?",
    answer: "Yes. The dashboard is designed to keep appointment requests, schedules and center activity in one workspace."
  },
  {
    question: "Do you manage Google Maps and SEO?",
    answer: "Yes. Our growth support includes Google Maps optimization, local SEO and clear service pages for your center."
  },
  {
    question: "Can you manage advertising campaigns for our center?",
    answer: "Yes. Meta Ads and lead generation can be included as part of your center’s growth management."
  },
  {
    question: "Is hosting and maintenance included?",
    answer: "Technical setup and ongoing support can be included in the proposal. We confirm hosting and maintenance scope with each center before work begins."
  },
  {
    question: "Can the platform be adapted to our specific workflow?",
    answer: "Yes. We shape booking and dashboard workflows around how your center handles patient requests and appointments."
  },
  {
    question: "Do you work with centers outside Marrakech?",
    answer: "Yes. We work with radiology and medical centers across Morocco."
  }
];

export default function Faq05Kelo({ className }: { className?: string }) {
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

          {/* Accordion Area with Background Image Box */}
          <div className="relative max-w-[580px] mx-auto group">
            {/* Background Image Box */}
            <div className="absolute -inset-4 md:-inset-8 bg-[var(--surface-muted)] rounded-[40px] overflow-hidden z-0 shadow-inner">
              <img
                src="https://cdn.jiro.build/Kelo/a-breathtaking-3d-rendered-landscape-of-smooth-rol.jpg"
                alt="3D Landscape Background"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
            </div>

            {/* FAQ Accordion Container */}
            <div className="relative z-10 bg-white/40 backdrop-blur-2xl rounded-[32px] border border-white/40 overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
              {faqs.map((faq: { question: string; answer: string }, index: number) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={index}
                    className={"relative bg-transparent transition-colors duration-150 border-b border-white/20 last:border-b-0 " + (!isOpen ? "hover:bg-white/20" : "")}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      className="w-full text-left p-[24px_28px] flex items-center justify-between cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--brand-primary)]"
                    >
                      <span className="text-[var(--text-primary)] text-[16px] font-semibold tracking-tight">
                        {faq.question}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] as const }}
                        className="text-[var(--text-secondary)] text-[18px] flex items-center justify-center"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
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
                          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] as const }}
                          className="overflow-hidden"
                        >
                          <div id={`faq-answer-${index}`} className="px-7 pb-7 pt-0">
                            <p className="text-[var(--text-body)] text-[15px] leading-[1.7] font-medium">
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
