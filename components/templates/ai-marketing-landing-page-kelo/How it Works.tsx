import {useSiteContent} from '../../../src/content/SiteContent';
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Clock3, Target, Mail, Zap, BarChart3, CheckCircle2, Search, Brain, Sparkles, TrendingUp, Compass, Wand2, Workflow, BarChart4, ArrowRight } from "lucide-react";

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

const stepDefaults: StepData[] = [
  {
    id: "step-1",
    tabLabel: "1. Get Found",
    tabIcon: <Compass className="w-5 h-5" />,
    badge: "Phase 01 · Visibility",
    heading: "Help patients find your center.",
    description: "Improve your visibility through Google, local SEO and optimized medical service pages.",
    image: "https://cdn.jiro.build/Kelo/a-breathtaking-3d-rendered-landscape-of-smooth-rol.jpg",
    mockupType: "discovery",
  },
  {
    id: "step-2",
    tabLabel: "2. Convert",
    tabIcon: <Wand2 className="w-5 h-5" />,
    badge: "Phase 02 · Booking",
    heading: "Make booking simple for patients.",
    description: "Turn website visitors into appointment requests with a clear and simple booking journey.",
    image: "https://cdn.jiro.build/Kelo/a-worn-vintage-yellow-wooden-desk-sitting-in-an-op.jpeg",
    mockupType: "outreach",
  },
  {
    id: "step-3",
    tabLabel: "3. Follow Up",
    tabIcon: <Workflow className="w-5 h-5" />,
    badge: "Phase 03 · Response",
    heading: "Keep every request organized.",
    description: "Keep appointment requests organized and make it easier for your team to respond quickly.",
    image: "https://cdn.jiro.build/Kelo/a-breathtaking-3d-rendered-landscape-of-smooth-rol.jpg",
    mockupType: "workflows",
  },
  {
    id: "step-4",
    tabLabel: "4. Measure",
    tabIcon: <BarChart4 className="w-5 h-5" />,
    badge: "Phase 04 · Insight",
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

function DiscoveryMockup({ language }: { language: 'en' | 'fr' }) {
  const fr = language === 'fr';
  return <div className="space-y-4"><div className="flex items-center gap-3 rounded-full border border-white/70 bg-white p-4 text-sm"><Search size={18} className="shrink-0 text-[var(--brand-primary-hover)]"/>{fr ? 'Radiologie à proximité' : 'Radiology near me'}</div><div className="rounded-2xl border border-white/70 bg-white p-5"><p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{fr ? 'Exemple de fiche locale' : 'Sample local listing'}</p><p className="text-lg font-semibold">{fr ? 'Centre de radiologie exemple' : 'Example Radiology Center'}</p><p className="mt-2 text-sm text-[var(--text-secondary)]">{fr ? 'IRM · Scanner · Échographie' : 'MRI · CT scan · Ultrasound'}</p><div className="mt-5 border-t border-[var(--border)] pt-4 text-sm font-semibold text-[var(--brand-primary-hover)]">{fr ? 'Consulter les examens et demander un RDV' : 'Explore examinations and request a time'}</div></div><p className="text-center text-xs text-[var(--text-body)]">{fr ? 'Une prochaine étape claire depuis la recherche.' : 'A clear next step from local search.'}</p></div>;
}

const outreachLineVariants: Variants = { hidden: { opacity: 0, x: -5 }, visible: { opacity: 1, x: 0 } };
const outreachStagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };

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

function InsightsMockup({ language }: { language: 'en' | 'fr' }) {
 const fr = language === 'fr';
 return <div className="rounded-2xl border border-white/70 bg-white p-5"><p className="text-xs font-semibold text-[var(--brand-primary-hover)]">{fr ? 'RAPPORT FICTIF · CETTE SEMAINE' : 'SAMPLE REPORT · THIS WEEK'}</p><h4 className="mt-3 text-xl font-semibold">{fr ? 'Suivi des rendez-vous' : 'Appointment overview'}</h4><div className="mt-6 grid grid-cols-2 gap-4">{[[48,fr?'Demandes':'Requests'],[40,fr?'Confirmés':'Confirmed']].map(([value,label])=><div key={label} className="rounded-xl bg-[var(--surface-muted)] p-4"><p className="text-3xl font-semibold">{value}</p><p className="mt-2 text-xs text-[var(--text-body)]">{label}</p></div>)}</div><div className="mt-5 flex items-center gap-2 text-sm"><Clock3 size={17}/>{fr ? '8 demandes à traiter' : '8 requests to review'}</div><p className="mt-5 border-t border-[var(--border)] pt-4 text-xs text-[var(--text-secondary)]">{fr ? 'Chiffres illustratifs, aucun résultat client réel.' : 'Illustrative figures, not client results.'}</p></div>;
}

function DemoCta() {
  return <a href="#book-demo" className="bg-[var(--brand-dark)] text-white rounded-xl px-7 py-3.5 text-[15px] font-semibold flex items-center justify-center gap-3 hover:bg-[var(--brand-primary)] transition-colors">
    <span>Book a Free Demo</span>
    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center"><ArrowRight className="w-3.5 h-3.5" /></span>
  </a>;
}

export default function HowItWroks03Kelo({ className, language = "en" }: { className?: string; language?: "en" | "fr" }) {
  const {document:site}=useSiteContent();
  const steps=stepDefaults.map((step,i)=>({...step,...site.outcomes[language][i]}));
  const [activeTab, setActiveTab] = useState(0);

  const renderMockup = () => {
    switch (steps[activeTab].mockupType) {
      case "discovery": return <DiscoveryMockup language={language} />;
      case "outreach": return <OutreachMockup />;
      case "workflows": return <WorkflowsMockup />;
      case "insights": return <InsightsMockup language={language} />;
      default: return null;
    }
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <section
        className={"bg-[var(--surface)] py-20 px-6 md:px-12 font-sans overflow-hidden " + (className || "")}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-semibold text-3xl md:text-4xl text-[var(--text-primary)] leading-tight mb-3 tracking-tight">
              Built to Increase Appointments
            </h2>
            <p className="text-base text-[var(--text-secondary)] max-w-[520px] mx-auto leading-relaxed">
              A complete digital system designed to help medical centers get discovered, convert more visitors and manage incoming appointments.
            </p>
          </div>

          <div className="bg-[var(--surface-muted)] rounded-t-3xl flex flex-row overflow-x-auto no-scrollbar border-x border-t border-[var(--border)] p-2">
            {steps.map((step, index) => (
              <button
                type="button"
                key={step.id}
                onClick={() => setActiveTab(index)}
                className={"flex-1 min-w-[180px] md:min-w-0 py-3.5 px-5 flex items-center justify-center gap-3 transition-colors relative rounded-2xl outline-none border " + (activeTab === index ? "bg-[var(--surface)] border-[var(--border)] text-[var(--brand-dark)] shadow-sm" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-strong)] hover:bg-white/50")}
              >
                <div className={"w-9 h-9 rounded-lg flex items-center justify-center transition-colors " + (activeTab === index ? "bg-[var(--brand-primary)] text-white" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]")}>
                  {React.cloneElement(step.tabIcon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
                </div>
                <span className={"text-sm whitespace-nowrap tracking-tight " + (activeTab === index ? "font-semibold text-[var(--text-primary)]" : "font-medium")}>
                  {step.tabLabel}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-[var(--surface)] rounded-b-3xl border-x border-b border-[var(--border)] min-h-[480px] p-8 md:p-14 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" as const }}
                className="grid lg:grid-cols-[45%_55%] gap-8 lg:gap-14 items-center"
              >
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="inline-block border border-[var(--brand-primary-20)] rounded-full px-3.5 py-1 text-xs font-semibold text-[var(--brand-primary-hover)] bg-[var(--brand-primary-10)] mb-3">
                      {steps[activeTab].badge}
                    </span>
                    <h3 className="font-semibold text-2xl md:text-3xl text-[var(--text-primary)] leading-snug mt-1 tracking-tight">
                      {steps[activeTab].heading}
                    </h3>
                  </div>

                  <p className="text-base text-[var(--text-body)] leading-relaxed max-w-[440px]">
                    {steps[activeTab].description}
                  </p>

                  <div className="mt-2 hidden lg:block"><DemoCta /></div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="relative w-full max-w-[560px] bg-[var(--surface-muted)] rounded-3xl p-6 md:p-8 flex items-center justify-center overflow-hidden border border-[var(--border)]">
                    <div className="w-full relative z-10 bg-white rounded-2xl p-6 shadow-sm border border-[var(--border)]">
                      {renderMockup()}
                    </div>
                  </div>
                </div>
                <div className="lg:hidden"><DemoCta /></div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
}
