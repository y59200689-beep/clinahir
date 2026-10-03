"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

export default function Pricing02Kelo({ className }: { className?: string }) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <section className={"w-full bg-[var(--surface)] py-[80px] px-6 md:px-[60px] font-sans overflow-hidden " + (className || "")}>
        <div className="max-w-[1200px] mx-auto flex flex-col items-center">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-[56px] flex flex-col items-center"
          >
            <h2 className="font-sans font-semibold text-[48px] text-[var(--text-primary)] leading-[1.15] mb-3 max-w-[800px]">
              A Solution Built <br /> Around Your Center
            </h2>
            <p className="text-[16px] text-[var(--text-secondary)] font-normal">
              Choose the level of digital support your center needs today and expand as your growth strategy evolves.
            </p>
          </motion.div>

          {/* Pricing Cards Row */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="w-full flex flex-col lg:flex-row gap-6 items-stretch"
          >

            {/* CARD 1 - Pro */}
            <motion.div
              variants={itemVariants}
              className="flex-1 bg-[var(--surface-muted)] rounded-[20px] p-8 relative overflow-hidden flex flex-col justify-between min-h-[500px] border border-[var(--border)]"
            >
              <div className="relative z-10">
                <h3 className="font-medium text-[28px] text-[var(--text-primary)] mb-3">Digital Platform</h3>
                <p className="text-[14px] text-[var(--text-primary)] font-medium leading-[1.5] mb-6 opacity-90">
                  A complete digital foundation for your medical center.
                </p>

                <div className="flex items-baseline mb-6">
                  <span className="font-medium text-[44px] text-[var(--text-primary)] tracking-tight">Custom</span>
                  <span className="text-[15px] text-[var(--text-secondary)] font-normal ml-2">proposal</span>
                </div>

                <div className="h-[1px] w-full bg-[var(--border)] mb-6" />

                <ul className="space-y-[10px]">
                  {[
                    "Professional website",
                    "Online appointment booking",
                    "Admin dashboard",
                    "Mobile-first experience",
                    "Technical setup"
                  ].map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-[15px] text-[var(--text-body)] font-medium">
                      <span className="text-[var(--text-muted)] text-[10px]">&#8226;</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative mt-10">
                <div className="absolute -bottom-4 left-4 right-4 h-8 bg-[var(--brand-primary)] blur-xl opacity-30 rounded-full" />
                <button className="relative z-10 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-[14px] py-[14px] px-7 text-[15px] font-bold flex items-center gap-2.5 transition-all duration-200">
                  Request a Proposal
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5">
                    <path d="M7 7v6a4 4 0 0 0 4 4h9" />
                    <path d="m17 14 3 3-3 3" />
                  </svg>
                </button>
              </div>
            </motion.div>

            {/* CARD 2 - Premium */}
            <motion.div
              variants={itemVariants}
              className="flex-1 bg-[var(--surface-muted)] rounded-[20px] p-8 relative overflow-hidden flex flex-col justify-between min-h-[500px] border border-[var(--border)]"
            >
              <div className="relative z-10">
                <h3 className="font-medium text-[28px] text-[var(--text-primary)] mb-3">Growth Management</h3>
                <p className="text-[14px] text-[var(--text-primary)] font-medium leading-[1.5] mb-6 opacity-90">
                  Ongoing acquisition and visibility for centers that want consistent digital growth.
                </p>

                <div className="flex items-baseline mb-6">
                  <span className="font-medium text-[44px] text-[var(--text-primary)] tracking-tight">Custom</span>
                  <span className="text-[15px] text-[var(--text-secondary)] font-normal ml-2">proposal</span>
                </div>

                <div className="h-[1px] w-full bg-[var(--border)] mb-6" />

                <ul className="space-y-[10px]">
                  {[
                    "SEO",
                    "Google Maps optimization",
                    "Content",
                    "Meta Ads",
                    "Reporting"
                  ].map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-[15px] text-[var(--text-body)] font-medium">
                      <span className="text-[var(--text-muted)] text-[10px]">&#8226;</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative mt-10">
                <div className="absolute -bottom-4 left-4 right-4 h-8 bg-[var(--brand-primary)] blur-xl opacity-30 rounded-full" />
                <button className="relative z-10 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-[14px] py-[14px] px-7 text-[15px] font-bold flex items-center gap-2.5 transition-all duration-200">
                  Discuss Your Growth
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5">
                    <path d="M7 7v6a4 4 0 0 0 4 4h9" />
                    <path d="m17 14 3 3-3 3" />
                  </svg>
                </button>
              </div>
            </motion.div>

            {/* CARD 3 - Enterprise (DARK) */}
            <motion.div
              variants={itemVariants}
              className="flex-1 rounded-[20px] p-8 relative overflow-hidden flex flex-col justify-between min-h-[500px] group"
            >
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage: "url('https://cdn.jiro.build/Kelo/67594d4535b941c71eee76123efaf48a.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              />
              <div className="absolute inset-0 bg-[var(--brand-dark-70)] z-0" />

              <div className="relative z-10">
                <h3 className="font-medium text-[28px] text-white mb-3">Complete Partnership</h3>
                <p className="text-[14px] text-white font-medium leading-[1.5] mb-6">
                  Platform, acquisition and ongoing support managed as one complete system.
                </p>

                <div className="flex items-baseline mb-6">
                  <span className="font-medium text-[44px] text-white tracking-tight">Custom</span>
                  <span className="text-[16px] text-white/80 font-normal ml-2">proposal</span>
                </div>

                <div className="h-[1px] w-full bg-white/30 mb-6" />

                <ul className="space-y-[10px]">
                  {[
                    "Digital platform",
                    "Growth management",
                    "Ongoing optimization",
                    "Reporting",
                    "Support"
                  ].map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-[15px] text-white font-medium">
                      <span className="text-white/60 text-[10px]">&#8226;</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10">
                <button className="relative z-10 bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white rounded-[12px] py-[14px] px-8 text-[15px] font-bold transition-all duration-200">
                  Book a Consultation
                </button>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>
    </>
  );
}
