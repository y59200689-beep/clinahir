"use client";

import React from "react";
import { motion } from "framer-motion";

const stats = [
  {
    index: "001",
    value: "24/7",
    label: "ONLINE BOOKING",
    barHeights: [40, 60, 30, 80],
    litCount: 1,
  },
  {
    index: "002",
    value: "Simpler",
    label: "PATIENT JOURNEY",
    barHeights: [30, 50, 80, 40],
    litCount: 2,
  },
  {
    index: "003",
    value: "Centralized",
    label: "MANAGEMENT",
    barHeights: [20, 40, 60, 90],
    litCount: 3,
  },
  {
    index: "004",
    value: "Improved",
    label: "DIGITAL VISIBILITY",
    barHeights: [30, 50, 70, 100],
    litCount: 4,
  },
];

function MiniBarChart({ heights, litCount }: { heights: number[]; litCount: number }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {heights.map((h: number, i: number) => (
        <div
          key={i}
          className="w-[3px] rounded-full transition-colors duration-500"
          style={{
            height: h + "%",
            backgroundColor: i < litCount ? "var(--accent)" : "var(--border)",
          }}
        />
      ))}
    </div>
  );
}

export default function StatsMetrics02Kelo({ className }: { className?: string }) {
  return (
    <section className={"w-full bg-[var(--surface)] py-20 font-sans " + (className || "")}>
      {/* Header Area */}
      <div className="max-w-7xl mx-auto px-8 md:px-16 lg:px-20 mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] leading-tight tracking-tight"
        >
          Built for Real<br />Medical Workflows
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm md:text-base text-[var(--text-secondary)] max-w-xs md:text-right leading-relaxed"
        >
          Our systems are designed around the way medical centers actually receive, manage and convert patient demand.
        </motion.p>
      </div>

      {/* Metrics Panel with Background Image */}
      <div className="relative w-full overflow-hidden">
        <div className="relative h-[400px] md:h-[450px] w-full">
          {/* Background Image */}
          <img
            src="https://cdn.jiro.build/Kelo/the-interior-of-a-vintage-retro-train-carriage-wit.jpg"
            alt="Vintage train interior"
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-[var(--brand-dark-10)]" />

          {/* White Stats Panel */}
          <div className="absolute inset-0 flex items-center justify-center px-8 md:px-16 lg:px-20">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="bg-[var(--surface)] w-full rounded-[16px] shadow-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100"
            >
              {stats.map((stat) => (
                <div
                  key={stat.index}
                  className="px-8 py-12 flex flex-col justify-between min-h-[220px]"
                >
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-medium text-[var(--text-muted)] tracking-widest">
                      {stat.index}
                    </span>
                    <MiniBarChart heights={stat.barHeights} litCount={stat.litCount} />
                  </div>

                  <div>
                    <div className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tighter">
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-bold text-[var(--text-muted)] tracking-[0.15em] leading-tight uppercase">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
