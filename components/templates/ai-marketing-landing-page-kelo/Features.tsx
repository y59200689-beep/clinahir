"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Command,
  MousePointer2,
  Users,
  Zap
} from "lucide-react";

const ACCENT_COLOR = "var(--brand-primary)";

function GridLine({ vertical = false }: { vertical?: boolean }) {
  return (
    <div
      className={
        "absolute " +
        (vertical ? "w-px h-full top-0" : "h-px w-full left-0") +
        " bg-[var(--border-60)]"
      }
    />
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={"relative p-8 group overflow-hidden flex flex-col " + className}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors duration-300">
            <Icon size={20} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">{title}</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 max-w-[280px]">
          {description}
        </p>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary-05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}

export default function Features02Kelo({ className }: { className?: string }) {
  const [activeMetric, setActiveMetric] = useState(0);

  const metrics = [
    { label: "Requests", value: "Visible", trend: "+ Ready" },
    { label: "Booking", value: "Simple", trend: "Clear" },
    { label: "Support", value: "Ongoing", trend: "Stable" },
  ];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
        crossOrigin="anonymous"
      />

      <section
        className={"bg-[var(--surface)] py-24 px-6 md:px-12 font-sans overflow-hidden " + (className || "")}
      >
        <div className="max-w-7xl mx-auto relative">

          {/* Header Section */}
          <div className="mb-20 relative">
            <div className="grid md:grid-cols-2 gap-12 items-end">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[48px] font-semibold text-[var(--text-primary)] tracking-tight leading-[1.1]"
              >
                One System for <br />
                Your Digital Patient Journey
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-md"
              >
                Give patients a modern way to discover your center, understand your services and book an appointment while giving your team the tools to manage requests efficiently.
              </motion.p>
            </div>
          </div>

          {/* Main Grid Showcase */}
          <div className="relative border border-[var(--border)] rounded-[32px] overflow-hidden bg-[var(--surface-muted-30)]">

            <GridLine />
            <div className="absolute top-0 left-1/2 w-px h-full bg-[var(--border-60)] hidden md:block" />
            <div className="absolute top-1/2 left-0 w-full h-px bg-[var(--border-60)] hidden md:block" />
            <div className="absolute top-0 left-3/4 w-px h-full bg-[var(--border-60)] hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-4 min-h-[600px]">

              {/* Feature 1: Real-time Analytics (Large) */}
              <FeatureCard
                title="Patient Experience"
                description="A modern mobile-first website with clear examination pages, easy navigation and online appointment booking."
                icon={Activity}
                className="md:col-span-2 md:row-span-2 border-b md:border-b-0 md:border-r border-[var(--border)]"
              >
                <div className="flex-1 bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-sm relative overflow-hidden group/chart flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-2">
                      {metrics.map((m, i) => (
                        <button
                          key={m.label}
                          onClick={() => setActiveMetric(i)}
                          className={
                            "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all " +
                            (activeMetric === i
                              ? "bg-[var(--brand-primary)] text-white"
                              : "bg-[var(--surface-muted)] text-[var(--text-muted)] hover:bg-[var(--background)]")
                          }
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                        {metrics[activeMetric].value}
                      </p>
                      <p
                        className={
                          "text-[10px] font-bold " +
                          (metrics[activeMetric].trend.startsWith("+")
                            ? "text-[var(--brand-primary)]"
                            : "text-[var(--text-muted)]")
                        }
                      >
                        {metrics[activeMetric].trend} for your center
                      </p>
                    </div>
                  </div>

                  {/* Animated Bars */}
                  <div className="flex-1 flex items-end gap-1.5 min-h-[200px]">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: "20%" }}
                        animate={{
                          height:
                            activeMetric === 0
                              ? (Math.random() * 60 + 40) + "%"
                              : activeMetric === 1
                              ? (Math.random() * 30 + 10) + "%"
                              : "80%",
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity as number,
                          repeatType: "reverse" as const,
                          delay: i * 0.05,
                        }}
                        className={
                          "flex-1 rounded-t-sm " +
                          (i > 18
                            ? "bg-[var(--surface-muted)]"
                            : "bg-[var(--brand-primary-20)] group-hover/chart:bg-[var(--brand-primary-40)] transition-colors")
                        }
                      />
                    ))}
                  </div>

                  {/* Monospace Data Overlay */}
                  <div className="absolute bottom-2 right-4 font-mono text-[9px] text-[var(--border-strong)] uppercase tracking-widest">
                    Booking_Activity_Visible
                  </div>
                </div>
              </FeatureCard>

              {/* Feature 2: Smart Automations */}
              <FeatureCard
                title="Center Dashboard"
                description="Manage appointments, patient requests, schedules and activity from one organized workspace."
                icon={Zap}
                className="md:col-span-2 border-b border-[var(--border)]"
              >
                <div className="mt-4 flex flex-col gap-3">
                  {[
                    { label: "Request: New Booking", status: "Active", color: "var(--brand-primary)" },
                    { label: "Action: Staff Follow-up", status: "Pending", color: "var(--warning)" },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={false}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center justify-between bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)] shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-medium text-[var(--text-body)]">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                        {item.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </FeatureCard>

              {/* Feature 3: Developer API */}
              <FeatureCard
                title="Search Visibility"
                description="Help patients find your center through Google Maps, SEO and clear service pages."
                icon={Command}
                className="border-b md:border-b-0 md:border-r border-[var(--border)]"
              >
                <div className="mt-4 bg-[var(--brand-dark)] rounded-xl p-4 font-mono text-[10px] leading-tight overflow-hidden relative group/api">
                  <div className="flex gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--danger-soft)]" />
                    <div className="w-2 h-2 rounded-full bg-[var(--warning-soft)]" />
                    <div className="w-2 h-2 rounded-full bg-[var(--success-soft)]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <span className="text-[var(--soft-purple)]">report</span>
                      <span className="text-[var(--brand-blue-light)]">CenterActivity</span>
                      <span className="text-[var(--text-muted)]">{"{"}</span>
                    </div>
                    <div className="pl-4 flex gap-2">
                      <span className="text-[var(--brand-blue-light)]">center</span>
                      <span className="text-[var(--text-muted)]">{"{"}</span>
                    </div>
                    <div className="pl-8 text-[var(--brand-primary)]">booking</div>
                    <div className="pl-8 text-[var(--brand-primary)]">requests</div>
                    <div className="pl-4 text-[var(--text-muted)]">{"}"}</div>
                    <div className="text-[var(--text-muted)]">{"}"}</div>
                  </div>
                  <motion.div
                    animate={{ opacity: [1, 0] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity as number,
                    }}
                    className="absolute bottom-4 left-[90px] w-1.5 h-3 bg-[var(--brand-primary-60)]"
                  />
                </div>
              </FeatureCard>

              {/* Feature 4: Team Collaboration */}
              <FeatureCard
                title="Team Coordination"
                description="Keep your staff aligned around appointments, incoming requests and patient follow-up."
                icon={Users}
                className=""
              >
                <div className="mt-4 relative h-24 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border border-dashed border-[var(--border)] animate-[spin_10s_linear_infinite]" />
                    <div className="absolute w-20 h-20 rounded-full border border-dashed border-[var(--border)] animate-[spin_15s_linear_infinite_reverse]" />
                  </div>
                  <div className="relative flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="relative"
                      >
                        <img
                          src={"https://picsum.photos/seed/collab" + i + "/100/100"}
                          alt={"Team member " + i}
                          className="w-10 h-10 rounded-full border-2 border-[var(--surface)] shadow-sm object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {i === 1 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--brand-primary)] rounded-full border-2 border-[var(--surface)]" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[var(--surface)] px-2 py-1 rounded-full border border-[var(--border)] shadow-sm">
                    <MousePointer2 size={10} className="text-[var(--brand-primary)] fill-[var(--brand-primary)]" />
                    <span className="text-[9px] font-bold text-[var(--text-secondary)]">Staff is reviewing...</span>
                  </div>
                </div>
              </FeatureCard>

            </div>
          </div>

        </div>
      </section>
    </>
  );
}
