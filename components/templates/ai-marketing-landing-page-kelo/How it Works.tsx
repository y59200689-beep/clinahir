"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Target, Mail, Zap, BarChart3, CheckCircle2, Search, Brain, Sparkles, TrendingUp, Compass, Wand2, Workflow, BarChart4, ArrowRight } from "lucide-react";

interface StepData {
  id: string;
  tabLabel: string;
  tabIcon: React.ReactNode;
  badge: string;
  heading: string;
  description: string;
  image: string;
  mockupType: "discovery" | "outreach" | "workflows" | "insights";
}

const steps: StepData[] = [
  {
    id: "step-1",
    tabLabel: "1. Get Found",
    tabIcon: <Compass className="w-5 h-5" />,
    badge: "PHASE 01: VISIBILITY",
    heading: "Help patients find your center.",
    description: "Improve your visibility through Google, local SEO and optimized medical service pages.",
    image: "https://cdn.jiro.build/Kelo/a-breathtaking-3d-rendered-landscape-of-smooth-rol.jpg",
    mockupType: "discovery",
  },
  {
    id: "step-2",
    tabLabel: "2. Convert",
    tabIcon: <Wand2 className="w-5 h-5" />,
    badge: "PHASE 02: BOOKING",
    heading: "Make booking simple for patients.",
    description: "Turn website visitors into appointment requests with a clear and simple booking journey.",
    image: "https://cdn.jiro.build/Kelo/a-worn-vintage-yellow-wooden-desk-sitting-in-an-op.jpeg",
    mockupType: "outreach",
  },
  {
    id: "step-3",
    tabLabel: "3. Follow Up",
    tabIcon: <Workflow className="w-5 h-5" />,
    badge: "PHASE 03: RESPONSE",
    heading: "Keep every request organized.",
    description: "Keep appointment requests organized and make it easier for your team to respond quickly.",
    image: "https://cdn.jiro.build/Kelo/a-breathtaking-3d-rendered-landscape-of-smooth-rol.jpg",
    mockupType: "workflows",
  },
  {
    id: "step-4",
    tabLabel: "4. Measure",
    tabIcon: <BarChart4 className="w-5 h-5" />,
    badge: "PHASE 04: INSIGHT",
    heading: "See what supports your growth.",
    description: "Track appointments, activity and performance through a centralized dashboard.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200",
    mockupType: "insights",
  },
];

const discoveryVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const staggerVisible: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function DiscoveryMockup() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white/80 p-3 rounded-xl border border-white/50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary-10)] flex items-center justify-center text-[var(--brand-primary)]">
            <Search className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-[var(--brand-dark)]">Reviewing Requests...</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-pulse" />
          <span className="text-[10px] font-bold text-[var(--brand-primary)]">ACTIVE</span>
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerVisible}
        className="grid grid-cols-1 gap-3"
      >
        {[
          { name: "New Appointment", match: "Open", status: "Online Request" },
          { name: "Follow-up", match: "Ready", status: "Staff Review" },
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={discoveryVariants}
            className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center text-[var(--brand-dark)] font-bold text-xs">
                {item.name[0]}
              </div>
              <div>
                <p className="font-bold text-sm text-[var(--brand-dark)]">{item.name}</p>
                <p className="text-[10px] text-[var(--text-secondary)]">{item.status}</p>
              </div>
            </div>
            <div className="bg-[var(--brand-primary-05)] px-3 py-1 rounded-full border border-[var(--brand-primary-10)]">
              <span className="text-xs font-black text-[var(--brand-primary)]">{item.match}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

const outreachLineVariants: Variants = {
  hidden: { opacity: 0, x: -5 },
  visible: { opacity: 1, x: 0 },
};

const outreachStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

function OutreachMockup() {
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden"
      >
        <div className="bg-[var(--surface-muted-50)] px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Request Review</span>
          <Sparkles className="w-3 h-3 text-[var(--brand-primary)]" />
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-[var(--border)]" />
            <div className="h-2 w-24 bg-[var(--surface-muted)] rounded-full" />
          </div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={outreachStagger}
            className="space-y-2"
          >
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                variants={outreachLineVariants}
                className={"h-2 rounded-full " + (i === 3 ? "w-4/5 bg-[var(--surface-muted)]" : "w-full bg-[var(--surface-muted)]")}
              />
            ))}
            <motion.div
              variants={outreachLineVariants}
              className="h-2 w-3/4 bg-[var(--brand-primary-10)] rounded-full"
            />
          </motion.div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-between px-2"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shadow-sm">
            <Mail className="w-4 h-4 text-[var(--text-secondary)]" />
          </div>
          <span className="text-[11px] font-bold text-[var(--brand-dark)]">Booking Request Ready</span>
        </div>
        <div className="px-3 py-1.5 bg-[var(--brand-primary)] text-white rounded-lg text-[10px] font-bold shadow-lg shadow-[var(--brand-primary-20)]">
          Review Request
        </div>
      </motion.div>
    </div>
  );
}

const workflowNodeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

function WorkflowsMockup() {
  return (
    <div className="space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerVisible}
        className="flex items-center justify-around py-4 relative"
      >
        <div className="absolute top-1/2 left-0 w-full h-px bg-[var(--surface-muted)] -translate-y-1/2" />
        {[
          { icon: <Search />, active: true },
          { icon: <Wand2 />, active: true },
          { icon: <Workflow />, active: true },
          { icon: <CheckCircle2 />, active: false },
        ].map((item, i) => (
          <motion.div
            key={i}
            variants={workflowNodeVariants}
            className={"relative z-10 w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 " + (item.active ? "bg-[var(--surface)] border-[var(--brand-primary)] text-[var(--brand-primary)] shadow-md" : "bg-[var(--surface-muted)] border-[var(--border)] text-[var(--border-strong)]")}
          >
            {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[var(--brand-dark)]">Appointment Status</span>
          <span className="text-[10px] font-bold text-[var(--brand-primary)] bg-[var(--brand-primary-05)] px-2 py-0.5 rounded">Requests Organized</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-secondary)]">
            <span>Reviewing Requests</span>
            <span>In Progress</span>
          </div>
          <div className="h-1.5 w-full bg-[var(--surface-muted)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "80%" }}
              className="h-full bg-[var(--brand-primary)]"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const insightCardVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

function InsightsMockup() {
  return (
    <div className="space-y-5">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerVisible}
        className="grid grid-cols-2 gap-4"
      >
        {[
          { icon: <TrendingUp />, value: "Clear", label: "Activity", color: "var(--brand-primary)", isGreen: true },
          { icon: <Brain />, value: "Ready", label: "Reporting", color: "var(--brand-dark)", isGreen: false },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={insightCardVariants}
            className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--border)] shadow-sm"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: stat.isGreen ? "rgba(0, 188, 125, 0.05)" : "var(--surface-muted)", color: stat.color }}
            >
              {React.cloneElement(stat.icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
            </div>
            <p className="text-2xl font-black text-[var(--brand-dark)]">{stat.value}</p>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--brand-dark)] p-5 rounded-2xl text-white shadow-xl"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)]" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)]">Growth Insight</span>
        </div>
        <p className="text-xs text-[var(--border-strong)] leading-relaxed">
          "Review your appointment activity and digital visibility to guide the next steps for your center."
        </p>
      </motion.div>
    </div>
  );
}

function DemoCta() {
  return <a href="#book-demo" className="relative overflow-hidden bg-[var(--brand-dark)] text-white rounded-2xl px-10 py-5 text-[16px] font-bold flex items-center justify-center gap-3 hover:bg-[var(--brand-primary)] transition-all duration-500 group">
    <span className="relative z-10">Book a Free Demo</span>
    <span className="relative z-10 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors"><ArrowRight className="w-3.5 h-3.5" /></span>
    <span className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:left-full transition-all duration-1000 ease-in-out" />
  </a>;
}

export default function HowItWroks03Kelo({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState(0);

  const renderMockup = () => {
    switch (steps[activeTab].mockupType) {
      case "discovery": return <DiscoveryMockup />;
      case "outreach": return <OutreachMockup />;
      case "workflows": return <WorkflowsMockup />;
      case "insights": return <InsightsMockup />;
      default: return null;
    }
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className={"bg-[var(--surface)] py-24 px-6 md:px-20 font-sans overflow-hidden " + (className || "")}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-medium text-4xl md:text-[48px] text-[var(--text-primary)] leading-tight mb-4 tracking-tight">
              Built to Increase Appointments
            </h2>
            <p className="text-[16px] text-[var(--text-secondary)] max-w-[520px] mx-auto leading-relaxed">
              A complete digital system designed to help medical centers get discovered, convert more visitors and manage incoming appointments.
            </p>
          </div>

          <div className="bg-[var(--surface-muted)] rounded-t-[32px] flex flex-row overflow-x-auto no-scrollbar border-x border-t border-[var(--border)] p-2">
            {steps.map((step, index) => (
              <motion.button
                key={step.id}
                onClick={() => setActiveTab(index)}
                whileHover={{ scale: 1.02 }}
                className={"flex-1 min-w-[180px] md:min-w-0 py-4 px-6 flex items-center justify-center gap-3.5 transition-all duration-500 relative rounded-[22px] group outline-none border " + (activeTab === index ? "bg-[var(--surface)] border-[var(--border)] text-[var(--brand-dark)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-strong)] hover:bg-white/50")}
              >
                <div className={"w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 " + (activeTab === index ? "bg-[var(--brand-primary)] text-white shadow-[0_8px_20px_-4px_rgba(0,188,125,0.4)]" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] group-hover:border-[var(--brand-primary-30)] group-hover:text-[var(--brand-primary)]")}>
                  <motion.div
                    animate={activeTab === index ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity as number, duration: 2 }}
                  >
                    {React.cloneElement(step.tabIcon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
                  </motion.div>
                </div>
                <span className={"text-[15px] whitespace-nowrap tracking-tight transition-all duration-300 " + (activeTab === index ? "font-bold" : "font-medium")}>
                  {step.tabLabel}
                </span>
              </motion.button>
            ))}
          </div>

          <div className="bg-[var(--surface)] rounded-b-[32px] border-x border-b border-[var(--border)] min-h-[520px] p-8 md:p-20 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
                className="grid lg:grid-cols-[45%_55%] gap-8 lg:gap-16 items-center"
              >
                <div className="flex flex-col gap-8">
                  <div>
                    <span className="inline-block border border-[var(--brand-primary-20)] rounded-full px-4 py-1 text-[11px] font-bold tracking-[2px] text-[var(--brand-primary)] bg-[var(--brand-primary-05)] mb-4 uppercase">
                      {steps[activeTab].badge}
                    </span>
                    <h3 className="font-medium text-3xl md:text-[40px] text-[var(--text-primary)] leading-[1.2] mt-2 tracking-tight line-clamp-2">
                      {steps[activeTab].heading}
                    </h3>
                  </div>

                  <p className="text-[16px] text-[var(--text-body)] leading-[1.7] max-w-[440px]">
                    {steps[activeTab].description}
                  </p>

                  <div className="mt-4 hidden lg:block"><DemoCta /></div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="relative w-full max-w-[600px] aspect-[4/3] bg-[var(--surface-muted)] rounded-[48px] p-10 md:p-14 flex items-center justify-center overflow-hidden group border border-[var(--border)]">
                    <div className="absolute inset-0 z-0">
                      <img
                        src={steps[activeTab].image}
                        alt="Step visualization"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity as number, duration: 4, ease: "easeInOut" as const }}
                      className="w-full relative z-10 bg-white/60 backdrop-blur-[24px] border border-white/80 rounded-[32px] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.1)] overflow-hidden"
                    >
                      <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/40 to-transparent rotate-45 pointer-events-none" />
                      <div className="relative z-10">
                        {renderMockup()}
                      </div>
                    </motion.div>
                  </div>
                </div>
                <div className="lg:hidden"><DemoCta /></div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.section>
    </>
  );
}
