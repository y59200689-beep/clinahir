import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, 
  Check, 
  CheckCircle2, 
  Clock3, 
  MapPin, 
  Search, 
  ArrowUpRight, 
  BarChart3, 
  Users, 
  Stethoscope, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  Activity, 
  ArrowRight,
  TrendingUp,
  Sliders,
  Send,
  Zap,
  Lock
} from 'lucide-react';

interface FeaturesProps {
  language?: 'en' | 'fr';
  className?: string;
}

const EXAM_PREVIEWS = {
  en: [
    {
      id: 'mri',
      label: 'MRI 1.5T / 3T',
      fullName: 'Magnetic Resonance Imaging',
      prep: 'No metal objects · 4h fasting if contrast needed',
      duration: '25 min',
      slots: ['09:15', '11:00', '14:30', '16:15'],
      icon: Activity,
      badge: 'High Precision'
    },
    {
      id: 'ct',
      label: 'CT Scan TDM',
      fullName: 'Multi-slice Computed Tomography',
      prep: 'Creatinine lab work required for injection',
      duration: '15 min',
      slots: ['08:45', '10:30', '13:45', '15:30'],
      icon: Zap,
      badge: 'Ultra Fast'
    },
    {
      id: 'ultrasound',
      label: 'Ultrasound 4D',
      fullName: 'Doppler & High-Resolution Ultrasound',
      prep: 'Full bladder for pelvic / Fasting for abdominal',
      duration: '20 min',
      slots: ['09:30', '11:15', '14:00', '16:45'],
      icon: Stethoscope,
      badge: 'Immediate Report'
    },
    {
      id: 'mammo',
      label: '3D Mammography',
      fullName: 'Digital Breast Tomosynthesis',
      prep: 'Schedule day 7-12 of cycle · No deodorant/talc',
      duration: '20 min',
      slots: ['10:00', '11:45', '15:00', '17:15'],
      icon: Sparkles,
      badge: 'Women Health'
    }
  ],
  fr: [
    {
      id: 'mri',
      label: 'IRM 1.5T / 3T',
      fullName: 'Imagerie par Résonance Magnétique',
      prep: 'Aucun objet métallique · Jeûne 4h si injection de produit de contraste',
      duration: '25 min',
      slots: ['09:15', '11:00', '14:30', '16:15'],
      icon: Activity,
      badge: 'Haute Résolution'
    },
    {
      id: 'ct',
      label: 'Scanner TDM',
      fullName: 'Tomodensitométrie Multi-coupes',
      prep: 'Dosage de créatinine récent requis en cas d’injection',
      duration: '15 min',
      slots: ['08:45', '10:30', '13:45', '15:30'],
      icon: Zap,
      badge: 'Acquisition Rapide'
    },
    {
      id: 'ultrasound',
      label: 'Échographie 4D',
      fullName: 'Échographie Générale & Écho-Doppler Couleur',
      prep: 'Vessie pleine pour pelvien · À jeun 6h pour abdominal',
      duration: '20 min',
      slots: ['09:30', '11:15', '14:00', '16:45'],
      icon: Stethoscope,
      badge: 'Compte Rendu Immédiat'
    },
    {
      id: 'mammo',
      label: 'Mammographie 3D',
      fullName: 'Tomosynthèse Mammaire & Sénologie',
      prep: 'Jours 7 à 12 du cycle conseillés · Pas de talc ni déodorant',
      duration: '20 min',
      slots: ['10:00', '11:45', '15:00', '17:15'],
      icon: Sparkles,
      badge: 'Pôle Sénologique'
    }
  ]
};

const CITIES = {
  en: [
    { name: 'Casablanca (Maârif / Racine)', queries: '4,280 searches/mo', rank: '#1 on Google Maps', conversion: '+380%' },
    { name: 'Marrakech (Guéliz / Hivernage)', queries: '3,150 searches/mo', rank: '#1 on Google Maps', conversion: '+340%' },
    { name: 'Rabat (Agdal / Souissi)', queries: '2,890 searches/mo', rank: '#1 on Google Maps', conversion: '+310%' },
    { name: 'Tanger (Malabata / Centre)', queries: '2,420 searches/mo', rank: '#1 on Google Maps', conversion: '+295%' }
  ],
  fr: [
    { name: 'Casablanca (Maârif / Racine)', queries: '4 280 recherches/mois', rank: '#1 sur Google Maps', conversion: '+380%' },
    { name: 'Marrakech (Guéliz / Hivernage)', queries: '3 150 recherches/mois', rank: '#1 sur Google Maps', conversion: '+340%' },
    { name: 'Rabat (Agdal / Souissi)', queries: '2 890 recherches/mois', rank: '#1 sur Google Maps', conversion: '+310%' },
    { name: 'Tanger (Malabata / Centre)', queries: '2 420 recherches/mois', rank: '#1 sur Google Maps', conversion: '+295%' }
  ]
};

export default function Features({ language = 'en', className = '' }: FeaturesProps) {
  const fr = language === 'fr';
  const exams = EXAM_PREVIEWS[fr ? 'fr' : 'en'];
  const cities = CITIES[fr ? 'fr' : 'en'];

  // Interactive states
  const [activeExamId, setActiveExamId] = useState(exams[0].id);
  const [selectedSlot, setSelectedSlot] = useState(exams[0].slots[0]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [activeCityIdx, setActiveCityIdx] = useState(0);
  const [seoCompareMode, setSeoCompareMode] = useState<'optimized' | 'baseline'>('optimized');
  
  // Interactive receptionist queue demo
  const [queueItems, setQueueItems] = useState([
    { id: 1, patient: 'Mme Kabbaj F.', exam: 'IRM Rachis Lombaire', time: '14:30', status: 'pending', phone: '+212 661...89' },
    { id: 2, patient: 'M. Benjelloun O.', exam: 'Scanner Thoracique TDM', time: '15:15', status: 'confirmed', phone: '+212 662...34' },
    { id: 3, patient: 'Mme Tazi S.', exam: 'Écho Doppler Carotides', time: '16:00', status: 'pending', phone: '+212 663...12' }
  ]);

  const activeExam = exams.find(e => e.id === activeExamId) || exams[0];

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setBookingConfirmed(true);
    setTimeout(() => {
      setBookingConfirmed(false);
    }, 4500);
  };

  const handleConfirmItem = (id: number) => {
    setQueueItems(prev => prev.map(item => item.id === id ? { ...item, status: 'confirmed' } : item));
  };

  return (
    <section 
      id="solutions" 
      aria-labelledby="solutions-title"
      className={`relative bg-[#090d0b] py-24 px-6 text-white md:px-12 ${className}`}
    >
      <div className="mx-auto max-w-7xl">
        <p className="mb-5 text-center text-sm text-white/80">{fr ? "Aperçus de prototypes avec données fictives. Les intégrations et engagements réels doivent être validés avant activation." : "Prototype previews with fictional data. Actual integrations and service commitments require verification before activation."}</p>
        {/* Section Header */}
        <div className="mb-16 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-emerald-400"
          >
            <Sparkles size={13} className="text-emerald-400" />
            <span>{fr ? 'Architecture médicale' : 'Clinical platform architecture'}</span>
          </motion.div>

          <motion.h2 
            id="solutions-title"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' as const }}
            className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl"
          >
            {fr ? (
              <>Un écosystème unifié pour <br className="hidden sm:inline" /><span className="text-white/60">l'excellence en radiologie</span></>
            ) : (
              <>Engineered for radiology, <br className="hidden sm:inline" /><span className="text-white/60">calibrated for care</span></>
            )}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' as const }}
            className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg"
          >
            {fr ? (
              'De la recherche Google jusqu’au compte rendu médical : offrez aux patients un parcours fluide 24h/24 et dotez votre secrétariat d’un copilote intelligent pour éliminer les retards et les rendez-vous manqués.'
            ) : (
              'From first Google query to confirmed examination: deliver a frictionless 24/7 patient booking journey while empowering your reception desk with automated triage and zero no-shows.'
            )}
          </motion.p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-12">
          
          {/* Card 1: Interactive Live Patient Booking & Modality Matrix (Span 7) */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.045] lg:col-span-7 lg:p-9"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#01bc7c]/30 bg-[#01bc7c]/10 text-[#01bc7c]">
                    <CalendarDays size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-white">
                      {fr ? 'Réservation Instantanée & Triage' : 'Instant Triage & 24/7 Booking'}
                    </h3>
                    <p className="text-xs text-white/50">
                      {fr ? 'Module interactif intégré au site du centre' : 'Interactive patient booking experience'}
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-[#01bc7c]/30 bg-[#01bc7c]/10 px-3 py-1 text-xs font-medium text-[#01bc7c]">
                  {activeExam.badge}
                </span>
              </div>

              {/* Modality Selector Pills */}
              <div className="mt-8">
                <p className="text-xs font-medium text-white/50">
                  {fr ? '1. Choisissez un examen d\'imagerie' : '1. Select examination modality'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {exams.map(exam => {
                    const isSelected = exam.id === activeExamId;
                    return (
                      <button
                        key={exam.id}
                        type="button"
                        onClick={() => {
                          setActiveExamId(exam.id);
                          setSelectedSlot(exam.slots[0]);
                        }}
                        className={`group/btn relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#01bc7c] ${
                          isSelected 
                            ? 'bg-white text-black shadow-lg shadow-white/10' 
                            : 'border border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <exam.icon size={14} className={isSelected ? 'text-[#01bc7c]' : 'text-white/50'} />
                        <span>{exam.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Exam Details Glass Panel */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <span className="text-[11px] font-medium text-[#01bc7c]">
                      {activeExam.fullName}
                    </span>
                    <p className="mt-1 text-xs leading-relaxed text-white/70">
                      <strong className="text-white/90">{fr ? 'Consignes : ' : 'Preparation: '}</strong>
                      {activeExam.prep}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">
                    <Clock3 size={14} className="text-[#01bc7c]" />
                    <span>{fr ? `Durée : ${activeExam.duration}` : `Est. ${activeExam.duration}`}</span>
                  </div>
                </div>

                {/* Slot Selector */}
                <div className="mt-5 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>{fr ? 'Créneaux disponibles aujourd’hui' : 'Available slots today'}</span>
                    <span className="text-emerald-400">{fr ? 'Temps réel' : 'Live availability'}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {activeExam.slots.map(slot => {
                      const isChosen = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleSlotSelect(slot)}
                          className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#01bc7c] ${
                            isChosen
                              ? 'border-[#01bc7c] bg-[#01bc7c] text-white shadow-[0_0_20px_rgba(1,188,124,0.35)]'
                              : 'border-white/10 bg-white/5 text-white/85 hover:border-white/30 hover:bg-white/10'
                          }`}
                        >
                          <Clock3 size={12} className={isChosen ? 'text-white' : 'text-white/40'} />
                          <span>{slot}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Instant Feedback Toast */}
                <AnimatePresence>
                  {bookingConfirmed && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.95 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3.5 text-xs text-emerald-200 backdrop-blur-md"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-[#01bc7c]" />
                        <span>
                          {fr 
                            ? `Créneau de ${selectedSlot} présélectionné pour ${activeExam.label}. Triage WhatsApp actif.`
                            : `${selectedSlot} slot simulated for ${activeExam.label}. WhatsApp triage confirmed.`}
                        </span>
                      </div>
                      <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        {fr ? 'Simulateur' : 'Interactive'}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50 border-t border-white/10 pt-4">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-[#01bc7c]" />
                {fr ? 'Dépôt ordonnance sécurisé' : 'Secure prescription upload'}
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-[#01bc7c]" />
                {fr ? 'Rappels WhatsApp automatiques' : 'Automated WhatsApp reminders'}
              </span>
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-[#01bc7c]" />
                {fr ? 'Zéro double réservation' : 'Zero double-booking'}
              </span>
            </div>
          </motion.div>

          {/* Card 2: Local Google Maps Dominance Simulator (Span 5) */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.045] lg:col-span-5 lg:p-9"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
                    <Search size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-white">
                      {fr ? 'Domination Google Maps' : 'Google Local Pack #1'}
                    </h3>
                    <p className="text-xs text-white/50">
                      {fr ? 'Référencement local ultra-ciblé' : 'High-intent patient acquisition'}
                    </p>
                  </div>
                </div>
              </div>

              {/* City Selector */}
              <div className="mt-6 flex flex-wrap gap-1.5">
                {cities.map((city, idx) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => setActiveCityIdx(idx)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                      activeCityIdx === idx 
                        ? 'bg-white/20 text-white font-semibold' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {city.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Simulated Google Search Box */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/50 p-4">
                <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                  <Search size={14} className="text-[#01bc7c]" />
                  <span className="font-mono text-white/90">
                    {fr ? `centre de radiologie irm ${cities[activeCityIdx].name.split(' ')[0].toLowerCase()}` : `radiology center mri ${cities[activeCityIdx].name.split(' ')[0].toLowerCase()}`}
                  </span>
                </div>

                {/* Mode Toggle */}
                <div className="mt-3 flex items-center justify-between rounded-xl bg-white/5 p-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSeoCompareMode('optimized')}
                    className={`flex-1 rounded-lg py-1 font-medium transition ${
                      seoCompareMode === 'optimized' ? 'bg-[#01bc7c] text-white shadow-sm' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {fr ? 'Avec Clinahir (#1)' : 'With Clinahir (#1)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeoCompareMode('baseline')}
                    className={`flex-1 rounded-lg py-1 font-medium transition ${
                      seoCompareMode === 'baseline' ? 'bg-red-500/30 text-red-200' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {fr ? 'Sans Référencement' : 'Without SEO'}
                  </button>
                </div>

                {/* Simulated Google Listing Card */}
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                  {seoCompareMode === 'optimized' ? (
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="text-[11px] font-semibold text-emerald-400">
                              {fr ? 'Position #1 sur Google Maps' : 'Rank #1 on Google Maps'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-white">
                            {fr ? 'Centre d\'Imagerie Médicale Clinahir' : 'Clinahir Medical Imaging Center'}
                          </p>
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-300">
                            <span>★ 4.9</span>
                            <span className="text-white/40">·</span>
                            <span className="text-white/60">{fr ? '(avis fictifs pour illustration)' : '(fictional illustrative reviews)'}</span>
                          </div>
                        </div>
                        <span className="rounded-lg bg-[#01bc7c]/20 px-2.5 py-1 text-[11px] font-semibold text-[#01bc7c]">
                          {cities[activeCityIdx].conversion}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] text-white/60 flex items-center gap-1">
                        <MapPin size={12} className="text-[#01bc7c]" />
                        {cities[activeCityIdx].name} · {fr ? 'Ouvert 24/7 pour réservations' : '24/7 online booking'}
                      </p>
                    </div>
                  ) : (
                    <div className="py-2 text-center">
                      <p className="text-xs font-medium text-white/50">
                        {fr ? 'Non classé dans le top 10 local' : 'Unranked in local top 10'}
                      </p>
                      <p className="mt-1 text-[11px] text-white/40">
                        {fr ? 'Les patients appellent les cliniques concurrentes visibles.' : 'Patients book with visible competitor centers.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/60">
              <span>{fr ? 'Volume de recherche capté :' : 'Monthly local demand:'}</span>
              <span className="font-semibold text-white">{cities[activeCityIdx].queries}</span>
            </div>
          </motion.div>

          {/* Card 3: Receptionist & WhatsApp Dispatch Co-Pilot (Span 6) */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.045] lg:col-span-6 lg:p-9"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-400">
                  <MessageSquare size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-white">
                    {fr ? 'File de Réception Intelligente' : 'Smart Reception Dispatch'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {fr ? 'Traitement en 1 clic sans double saisie' : 'Instant 1-click confirmation workflow'}
                  </p>
                </div>
              </div>

              {/* Interactive Queue Table */}
              <div className="mt-6 space-y-2.5">
                <p className="text-xs font-medium text-white/40">
                  {fr ? 'Demandes en attente de validation' : 'Incoming patient queue'}
                </p>
                {queueItems.map(item => (
                  <div 
                    key={item.id}
                    className="flex flex-col justify-between gap-2 rounded-2xl border border-white/10 bg-black/40 p-3.5 transition sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{item.patient}</span>
                        <span className="text-[11px] text-white/40">{item.phone}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-white/70">
                        {item.exam} · <strong className="text-white/90">{item.time}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === 'confirmed' ? (
                        <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                          <Check size={14} />
                          {fr ? 'Confirmé sur WhatsApp' : 'WhatsApp Sent'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleConfirmItem(item.id)}
                          className="flex items-center gap-1.5 rounded-xl bg-[#01bc7c] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#01a76f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#01bc7c]"
                        >
                          <Send size={12} />
                          <span>{fr ? 'Valider' : 'Confirm'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/60">
              <span>{fr ? 'Temps moyen de réponse secrétaire :' : 'Average staff response time:'}</span>
              <strong className="text-[#01bc7c]">{fr ? '< 2 minutes' : '< 2 minutes'}</strong>
            </div>
          </motion.div>

          {/* Card 4: Clinical Security, CNDP Compliance & Data Vault (Span 6) */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.045] lg:col-span-6 lg:p-9"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-white">
                    {fr ? 'Sécurité et confidentialité : périmètre à valider' : 'Security and privacy: scope to verify'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {fr ? 'Revue juridique et organisationnelle requise avant toute donnée clinique' : 'Legal and operational review required before clinical data use'}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex items-center gap-2 text-[#01bc7c]">
                    <Lock size={16} />
                    <span className="text-xs font-semibold">{fr ? 'Données de démonstration isolées' : 'Isolated demonstration data'}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-white/60">
                    {fr ? 'Cette démonstration ne reçoit aucune ordonnance ni image médicale réelle.' : 'This demonstration receives no real prescriptions or medical images.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex items-center gap-2 text-[#01bc7c]">
                    <FileText size={16} />
                    <span className="text-xs font-semibold">{fr ? 'Cadre de protection des données à examiner' : 'Data protection framework to review'}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-white/60">
                    {fr ? 'Les obligations applicables, dont la loi 09-08, nécessitent une vérification formelle.' : 'Applicable obligations, including Law 09-08, require formal verification.'}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs text-white/70">
                <span className="font-semibold text-white">
                  {fr ? 'Périmètre actuel :' : 'Current scope:'}
                </span>{' '}
                {fr ? 'Données fictives dans la démonstration ; aucune utilisation clinique ni certification revendiquée.' : 'Fictional data in the demonstration; no clinical operation or certification is claimed.'}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/60">
              <span>{fr ? 'Engagements de service :' : 'Service commitments:'}</span>
              <strong className="text-emerald-400">{fr ? 'À convenir par contrat' : 'To be agreed by contract'}</strong>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
