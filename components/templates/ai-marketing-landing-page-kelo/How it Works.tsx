import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  Wand2, 
  Workflow, 
  BarChart4, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  Clock, 
  ShieldCheck, 
  Upload, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Bell,
  Check
} from 'lucide-react';
import { useSiteContent } from '../../../src/content/SiteContent';

interface HowItWorksProps {
  language?: 'en' | 'fr';
  className?: string;
}

export default function HowItWorks({ language = 'en', className = '' }: HowItWorksProps) {
  const fr = language === 'fr';
  const [currentStep, setCurrentStep] = useState(0);

  // Interactive micro-states
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false);
  const [reminderConfirmed, setReminderConfirmed] = useState(false);

  const steps = [
    {
      id: 'visibility',
      number: '01',
      tabLabel: fr ? '1. Découverte Google' : '1. Local Discovery',
      badge: fr ? 'Étape 1 : Visibilité Locale' : 'Phase 1: Local Visibility',
      heading: fr ? 'Aidez les patients à vous trouver en premier.' : 'Help local patients find your center first.',
      description: fr ? (
        'Positionnez votre centre en tête des recherches Google Maps à Casablanca, Rabat, Marrakech et Tanger. Les patients découvrent vos équipements de pointe et réservent sans hésiter.'
      ) : (
        'Position your center at the top of Google Maps and local search. Patients discover your specialized imaging equipment and book instantly.'
      ),
      metric: fr ? 'Objectif de visibilité à définir' : 'Visibility objective to agree',
      icon: Compass,
    },
    {
      id: 'booking',
      number: '02',
      tabLabel: fr ? '2. Réservation & Triage' : '2. 60s Triage & Booking',
      badge: fr ? 'Étape 2 : Prise de Rendez-Vous' : 'Phase 2: Frictionless Booking',
      heading: fr ? '60 secondes pour demander un examen.' : 'A 60-second frictionless patient journey.',
      description: fr ? (
        'Plus besoin d’attendre au téléphone. Le patient dépose son ordonnance en photo, choisit son examen (IRM, Scanner, Écho) et propose un créneau. Tout est vérifié avant confirmation.'
      ) : (
        'No endless phone waitlists. Patients photograph their prescription, select their scan modality, and propose a preferred slot verified before confirmation.'
      ),
      metric: fr ? '45s chrono pour réserver' : '45-second booking journey',
      icon: Wand2,
    },
    {
      id: 'dispatch',
      number: '03',
      tabLabel: fr ? '3. Confirmation WhatsApp' : '3. WhatsApp Dispatch',
      badge: fr ? 'Étape 3 : Traitement Secrétariat' : 'Phase 3: Reception Dispatch',
      heading: fr ? 'Une notification WhatsApp instantanée.' : 'Instant WhatsApp confirmation & prep guide.',
      description: fr ? (
        'La secrétaire valide la demande en 1 clic. Le patient reçoit instantanément une carte de rendez-vous sur WhatsApp avec le plan Google Maps et les consignes de jeûne ou d’injection.'
      ) : (
        'Your desk confirms requests in 1 click. Patients immediately receive a verified WhatsApp appointment card with preparation instructions and Google Maps directions.'
      ),
      metric: fr ? '< 2 min de délai moyen' : '< 2 min staff dispatch time',
      icon: Workflow,
    },
    {
      id: 'retention',
      number: '04',
      tabLabel: fr ? '4. Rappels & Zéro No-Show' : '4. Zero No-Show Retention',
      badge: fr ? 'Étape 4 : Rappels Automatisés' : 'Phase 4: Automated Retention',
      heading: fr ? 'Éliminez les rendez-vous manqués.' : 'Eliminate costly empty scan slots.',
      description: fr ? (
        'Des rappels automatisés par WhatsApp 24h et 2h avant l’examen avec bouton de confirmation 1-tap. Ce fonctionnement reste à configurer et à vérifier ; aucun résultat chiffré n’est garanti.'
      ) : (
        'Automated WhatsApp reminders sent 24h and 2h before the scan with a 1-tap presence confirmation. Configuration and verification are required; no numerical outcome is guaranteed.'
      ),
      metric: fr ? 'Suivi proposé des confirmations' : 'Proposed confirmation follow-up',
      icon: BarChart4,
    },
  ];

  const activeStepData = steps[currentStep];

  return (
    <section 
      id="outcomes" 
      aria-labelledby="outcomes-title"
      className={`relative bg-[#0a0f0d] py-24 px-6 text-white md:px-12 ${className}`}
    >
      <div className="relative mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-emerald-400">
            <Sparkles size={13} />
            <span>{fr ? 'Parcours patient connecté' : 'Connected patient journey'}</span>
          </div>

          <h2 
            id="outcomes-title"
            className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl"
          >
            {fr ? (
              <>De la recherche Google au <br className="hidden sm:inline" /><span className="text-white/60">rendez-vous réalisé</span></>
            ) : (
              <>From first query to <br className="hidden sm:inline" /><span className="text-white/60">completed examination</span></>
            )}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            {fr ? (
              'Concept de parcours illustré avec des données fictives. Les messages WhatsApp sont simulés, sans envoi réel.'
            ) : (
              'A proposed workflow illustrated with fictional data. WhatsApp messages are simulated and are not sent.'
            )}
          </p>
        </div>

        {/* Apple Style Segmented Tab Controller */}
        <div className="mb-12 flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-2xl">
            {steps.map((step, idx) => {
              const isSelected = currentStep === idx;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={`relative flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#01bc7c] ${
                    isSelected 
                      ? 'bg-white text-black shadow-lg shadow-white/10' 
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-black text-white' : 'bg-white/10 text-white/70'
                  }`}>
                    {step.number}
                  </span>
                  <span>{step.tabLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Interactive Stage Terminal */}
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.015] p-6 shadow-2xl backdrop-blur-2xl sm:p-10 lg:p-12">
          
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            
            {/* Left Narrative Column (Span 5) */}
            <div className="space-y-6 lg:col-span-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStepData.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-5"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-[#01bc7c]">
                    <activeStepData.icon size={16} />
                    <span>{activeStepData.badge}</span>
                  </div>

                  <h3 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
                    {activeStepData.heading}
                  </h3>

                  <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                    {activeStepData.description}
                  </p>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs">
                    <span className="text-white/50">{fr ? 'Impact clinique mesuré :' : 'Measured clinical outcome:'}</span>
                    <p className="mt-1 text-base font-bold text-[#01bc7c]">
                      {activeStepData.metric}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next Navigation Controls */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft size={16} />
                  <span>{fr ? 'Étape précédente' : 'Previous'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                  disabled={currentStep === steps.length - 1}
                  className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/90 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span>{fr ? 'Étape suivante' : 'Next'}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Interactive Visual Simulation (Span 7) */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                
                {/* Visual Step 01: Local Search */}
                {currentStep === 0 && (
                  <motion.div
                    key="step-vis-0"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden rounded-2xl border border-white/15 bg-black/60 p-6 shadow-xl"
                  >
                    <div className="flex items-center gap-2 border-b border-white/10 pb-4 text-xs text-white/60">
                      <Search size={14} className="text-[#01bc7c]" />
                      <span className="font-mono text-white/90">
                        {fr ? 'google.com/search?q=centre+radiologie+irm+proximite' : 'google.com/search?q=mri+radiology+center+near+me'}
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[11px] font-medium text-emerald-400">
                              {fr ? 'Aperçu fictif Google Maps' : 'Fictional Google Maps preview'}
                            </span>
                            <h4 className="mt-1 text-base font-semibold text-white">
                              {fr ? 'Centre de Radiologie & Imagerie Moderne' : 'Modern Diagnostic Radiology Center'}
                            </h4>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-300">
                              <span>★ 4.9 (520 avis)</span>
                              <span className="text-white/40">·</span>
                              <span className="text-white/70">{fr ? 'IRM 3T · Scanner TDM · Écho 4D' : 'MRI 3T · CT · 4D Ultrasound'}</span>
                            </div>
                          </div>
                          <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                            {fr ? 'Ouvert 24/7' : '24/7 Booking'}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button type="button" className="rounded-lg bg-[#01bc7c] px-3 py-1.5 text-xs font-semibold text-white">
                            {fr ? 'Demander un RDV en ligne' : 'Request Appointment'}
                          </button>
                          <button type="button" className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white">
                            {fr ? 'Itinéraire Maps' : 'Directions'}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-white/40 opacity-50">
                        <p className="font-semibold">{fr ? '2. Autre Cabinet Médical' : '2. Other Clinic'}</p>
                        <p className="text-[11px]">{fr ? 'Aucun système de réservation en ligne disponible' : 'No online booking available'}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Visual Step 02: 60s Triage & Prescription Drop */}
                {currentStep === 1 && (
                  <motion.div
                    key="step-vis-1"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden rounded-2xl border border-white/15 bg-black/60 p-6 shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs">
                      <span className="font-semibold text-white">{fr ? 'Formulaire de Triage Patient' : 'Patient Triage Terminal'}</span>
                      <span className="text-[#01bc7c]">{fr ? 'Sécurisé TLS 1.3' : 'Secure TLS 1.3'}</span>
                    </div>

                    <div className="mt-5 space-y-4">
                      {/* Interactive Prescription Drop Simulator */}
                      <div 
                        onClick={() => setPrescriptionUploaded(!prescriptionUploaded)}
                        className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition ${
                          prescriptionUploaded 
                            ? 'border-emerald-500 bg-emerald-950/30' 
                            : 'border-white/20 bg-white/5 hover:border-white/40'
                        }`}
                      >
                        {prescriptionUploaded ? (
                          <div className="flex items-center justify-center gap-2 text-xs text-emerald-300">
                            <CheckCircle2 size={18} className="text-[#01bc7c]" />
                            <span className="font-semibold">
                              {fr ? 'Ordonnance_IRM_rachis.jpg importée avec succès !' : 'Prescription_MRI_lumbar.jpg uploaded!'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 text-xs text-white/70">
                            <Upload size={20} className="text-[#01bc7c]" />
                            <span className="font-semibold text-white">
                              {fr ? 'Cliquez pour simuler le dépôt d’ordonnance' : 'Click to simulate prescription upload'}
                            </span>
                            <span className="text-[11px] text-white/40">
                              {fr ? 'Prise de photo direct sur smartphone ou fichier' : 'Direct photo capture or document'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <span className="text-white/50">{fr ? 'Examen choisi :' : 'Scan:'}</span>
                          <p className="mt-0.5 font-semibold text-white">IRM Rachis Lombaire</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <span className="text-white/50">{fr ? 'Créneau souhaité :' : 'Desired slot:'}</span>
                          <p className="mt-0.5 font-semibold text-[#01bc7c]">Mardi à 10h30</p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                        <span className="text-white/50">{fr ? 'Téléphone WhatsApp du patient :' : 'Patient WhatsApp:'}</span>
                        <p className="mt-0.5 font-mono font-semibold text-white">+212 6 61 23 45 67</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Visual Step 03: WhatsApp Card Sent */}
                {currentStep === 2 && (
                  <motion.div
                    key="step-vis-2"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden rounded-2xl border border-white/15 bg-black/60 p-6 shadow-xl"
                  >
                    <div className="flex items-center gap-2 border-b border-white/10 pb-4 text-xs">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-black font-bold text-[10px]">
                        WA
                      </div>
                      <span className="font-semibold text-white">
                        {fr ? 'Exemple fictif de message WhatsApp' : 'Fictional WhatsApp message example'}
                      </span>
                      <span className="ml-auto text-[11px] text-white/40">10:32</span>
                    </div>

                    <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-[#0d2218] p-4 text-xs text-white">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                        <Sparkles size={14} />
                        <span>{fr ? 'Confirmation de Votre Rendez-Vous' : 'Appointment Confirmation'}</span>
                      </div>

                      <p className="mt-2 text-white/90 leading-relaxed">
                        {fr 
                          ? 'Bonjour Mme Kabbaj, votre rendez-vous pour une IRM Lombaire au Centre de Radiologie est confirmé pour le Mardi 14 Octobre à 10h30.'
                          : 'Hello Mrs. Kabbaj, your MRI lumbar spine scan is confirmed for Tuesday, Oct 14 at 10:30 AM.'}
                      </p>

                      <div className="mt-3 space-y-1.5 rounded-xl bg-black/40 p-3 text-[11px] text-white/75">
                        <p>📍 <strong>{fr ? 'Adresse : ' : 'Address: '}</strong> 14 Ave Mohammed V, Guéliz</p>
                        <p>⚠️ <strong>{fr ? 'Consigne : ' : 'Preparation: '}</strong> {fr ? 'Suivez uniquement les consignes validées par votre centre.' : 'Follow only the instructions approved by your center.'}</p>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[10px] text-emerald-400/80">
                        <span>{fr ? 'État simulé : non envoyé' : 'Simulated status: not sent'}</span>
                        <span>✓✓ {fr ? 'Lu' : 'Read'}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Visual Step 04: Zero No-Show */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-vis-3"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden rounded-2xl border border-white/15 bg-black/60 p-6 shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs">
                      <div className="flex items-center gap-2">
                        <Bell size={14} className="text-[#01bc7c]" />
                        <span className="font-semibold text-white">{fr ? 'Rappel Automatique 24h Avant' : 'Automated 24h Reminder Loop'}</span>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                        {fr ? 'Exemple fictif de suivi' : 'Fictional follow-up example'}
                      </span>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-xs">
                        <p className="text-white/80">
                          {fr 
                            ? 'Rappel WhatsApp : "Confirmez-vous votre présence pour votre examen d’IRM demain à 10h30 ?"'
                            : 'WhatsApp ping: "Please confirm your presence for tomorrow\'s MRI scan at 10:30 AM."'}
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setReminderConfirmed(!reminderConfirmed)}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                              reminderConfirmed 
                                ? 'bg-[#01bc7c] text-white shadow-md' 
                                : 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            <Check size={14} />
                            <span>{reminderConfirmed ? (fr ? 'Présence Confirmée ✓' : 'Confirmed ✓') : (fr ? 'Confirmer ma venue' : 'Confirm Presence')}</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                          <span className="text-emerald-400 font-medium">{fr ? 'Taux de No-Show' : 'No-Show Rate'}</span>
                          <p className="mt-1 text-2xl font-bold text-white">&lt; 3.6%</p>
                          <span className="text-[10px] text-white/50">{fr ? 'Valeur fictive, aucun résultat client' : 'Fictional value, no customer result'}</span>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <span className="text-white/60 font-medium">{fr ? 'Heures Récupérées' : 'Hours Saved'}</span>
                          <p className="mt-1 text-2xl font-bold text-white">18h / sem.</p>
                          <span className="text-[10px] text-white/50">{fr ? 'Moins d’appels manuels' : 'Less manual phone calls'}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
