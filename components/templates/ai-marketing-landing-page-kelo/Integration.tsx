"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, ChartNoAxesCombined, FileText, LayoutDashboard, MapPin, Megaphone, Monitor, Search } from "lucide-react";

export default function Integration03Kelo({ className }: { className?: string }) {
  const integrations = [
    {
      name: "Website",
      description: "Modern, fast and mobile-first.",
      icon: (
        <div className="w-[48px] h-[48px] bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl flex items-center justify-center mb-6">
          <Monitor aria-label="Website" className="w-5 h-5 text-[var(--text-secondary)]" />
        </div>
      )
    },
    {
      name: "Online booking",
      description: "Simple appointment requests available 24/7.",
      icon: (
        <div className="w-[48px] h-[48px] bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl flex items-center justify-center mb-6">
          <CalendarDays aria-label="Online booking" className="w-5 h-5 text-[var(--text-secondary)]" />
        </div>
      )
    },
    {
      name: "Admin dashboard",
      description: "Manage appointments and center activity.",
      icon: (
        <div className="w-[48px] h-[48px] bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl flex items-center justify-center mb-6">
          <LayoutDashboard aria-label="Admin dashboard" className="w-5 h-5 text-[var(--text-secondary)]" />
        </div>
      )
    },
    {
      name: "Google Maps",
      description: "Strengthen local search visibility.",
      icon: (
        <div className="w-[48px] h-[48px] bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl flex items-center justify-center mb-6">
          <MapPin aria-label="Google Maps" className="w-5 h-5 text-[var(--text-secondary)]" />
        </div>
      )
    },
    {
      name: "SEO",
      description: "Build long-term organic visibility.",
      icon: (
        <div className="w-[48px] h-[48px] bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl flex items-center justify-center mb-6">
          <Search aria-label="SEO" className="w-5 h-5 text-[var(--text-secondary)]" />
        </div>
      )
    },
    {
      name: "Meta Ads",
      description: "Generate qualified appointment leads.",
      icon: (
        <div className="w-[48px] h-[48px] bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl flex items-center justify-center mb-6">
          <Megaphone aria-label="Meta Ads" className="w-5 h-5 text-[var(--text-secondary)]" />
        </div>
      )
    },
    {
      name: "Content",
      description: "Maintain a professional digital presence.",
      icon: (
        <div className="w-[48px] h-[48px] bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl flex items-center justify-center mb-6">
          <FileText aria-label="Content" className="w-5 h-5 text-[var(--text-secondary)]" />
        </div>
      )
    },
    {
      name: "Reporting",
      description: "Track activity and monthly performance.",
      icon: (
        <div className="w-[48px] h-[48px] bg-[var(--surface-muted)] border border-[var(--border)] rounded-xl flex items-center justify-center mb-6">
          <ChartNoAxesCombined aria-label="Reporting" className="w-5 h-5 text-[var(--text-secondary)]" />
        </div>
      )
    }
  ];

  return (
    <section className={"bg-[var(--surface)] py-20 px-[60px] font-sans " + (className || "")}>
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
          <div className="w-full md:w-[55%]">
            <h2 className="text-[var(--text-primary)] font-semibold text-[36px] md:text-[48px] leading-[1.1] mb-4 tracking-tight">
              Everything Your Center Needs in One Place
            </h2>
            <p className="text-[var(--text-body)] text-[15px] leading-[1.65] max-w-[480px]">
              From your website to patient acquisition and reporting, we build and manage the systems that support your digital growth.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none bg-[var(--surface-muted)] text-[var(--text-primary)] border border-[var(--border)] rounded-full px-[22px] py-3 text-sm font-medium hover:bg-[var(--border)] transition-colors cursor-pointer">
              Book a Demo
            </button>
            <button className="flex-1 md:flex-none bg-[var(--brand-primary)] text-white rounded-full px-[22px] py-3 text-sm font-semibold hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer">
              Explore Solutions
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((app, index) => (
            <motion.div
              key={app.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 flex flex-col hover:border-[var(--text-secondary)] transition-colors duration-200 group cursor-default"
            >
              {app.icon}
              <h3 className="text-[var(--text-primary)] font-semibold text-base mb-2">
                {app.name}
              </h3>
              <p className="text-[var(--text-body)] text-sm leading-[1.6]">
                {app.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
