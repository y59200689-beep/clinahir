import React, { useEffect, useState } from 'react';
import { useSiteContent } from '../../../src/content/SiteContent';
import { PrivacyLink } from '../../../src/PrivacyNotice';
import { ArrowRight, Globe, ShieldCheck, Activity, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  language?: 'en' | 'fr';
  onLanguageChange?: (language: 'en' | 'fr') => void;
}

export default function Footer({ language = 'en', onLanguageChange }: FooterProps) {
  const fr = language === 'fr';
  const { document: site } = useSiteContent();

  const [moroccoTime, setMoroccoTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('fr-FR', {
          timeZone: 'Africa/Casablanca',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).format(new Date());
        setMoroccoTime(timeStr);
      } catch {
        setMoroccoTime('Casablanca');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative bg-[#040605] text-white pt-24 pb-12 px-6 md:px-12 border-t border-white/10">
      <div className="relative mx-auto max-w-7xl">
        
        {/* Top Pre-Footer Call to Action Banner */}
        <div className="mb-20 overflow-hidden rounded-[32px] border border-white/15 bg-white/[0.02] p-8 sm:p-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                <Activity size={12} />
                {fr ? 'Standard d’excellence' : 'Clinical standard'}
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
                {site.settings.footerTitle[language]}
              </h2>
              <p className="mt-3 text-sm text-white/65 max-w-lg leading-relaxed">
                {site.settings.footerDescription[language]}
              </p>
            </div>

            <div className="shrink-0">
              <a
                href="#book-demo"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              >
                <span>{site.settings.footerCta[language]}</span>
                <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </div>

        {/* Multi-column Navigation Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 text-xs text-white/70 pb-16 border-b border-white/10">
          
          {/* Col 1: Brand & Status (Span 2) */}
          <div className="sm:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-white">Clinahir</span>
              <span className="rounded-md border border-[#01bc7c]/30 bg-[#01bc7c]/10 px-2 py-0.5 text-[10px] font-semibold text-[#01bc7c]">
                Médical
              </span>
            </div>
            
            <p className="max-w-xs text-xs leading-relaxed text-white/60">
              {fr ? (
                'La solution digitale de référence pour les centres de radiologie et d’imagerie médicale au Maroc. Optimisation du parcours patient de Google Maps à la confirmation de RDV.'
              ) : (
                'The benchmark digital patient experience platform for radiology and medical imaging centers across Morocco. From Google Maps discovery to confirmed scan.'
              )}
            </p>

            {/* Live System Operational Status */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>{fr ? 'Démonstration interactive · données fictives' : 'Interactive demonstration · fictional data'}</span>
              </div>
              
              {moroccoTime && (
                <div className="text-[11px] text-white/40 font-mono">
                  Casablanca, Maroc : {moroccoTime} (GMT+1)
                </div>
              )}
            </div>
          </div>

          {/* Col 2: Solutions */}
          <div className="space-y-3">
            <p className="font-medium text-white text-[12px]">
              {fr ? 'Examens médicaux' : 'Scan modalities'}
            </p>
            <ul className="space-y-2">
              <li><a href="#solutions" className="hover:text-white transition">IRM 1.5T & 3T</a></li>
              <li><a href="#solutions" className="hover:text-white transition">Scanner TDM Multi-coupes</a></li>
              <li><a href="#solutions" className="hover:text-white transition">Échographie & Doppler 4D</a></li>
              <li><a href="#solutions" className="hover:text-white transition">Mammographie 3D & Sénologie</a></li>
              <li><a href="#solutions" className="hover:text-white transition">Cône Beam & Radio Dentaire</a></li>
            </ul>
          </div>

          {/* Col 3: Plateforme */}
          <div className="space-y-3">
            <p className="font-medium text-white text-[12px]">
              {fr ? 'Plateforme' : 'Ecosystem'}
            </p>
            <ul className="space-y-2">
              <li><a href="#solutions" className="hover:text-white transition">{fr ? 'Réservation 24h/24' : '24/7 Web Booking'}</a></li>
              <li><a href="#solutions" className="hover:text-white transition">{fr ? 'WhatsApp (configuration requise)' : 'WhatsApp (configuration required)'}</a></li>
              <li><a href="#outcomes" className="hover:text-white transition">{fr ? 'Suivi des rendez-vous (concept)' : 'Appointment follow-up concept'}</a></li>
              <li><a href="#process" className="hover:text-white transition">{fr ? 'Préparation du lancement' : 'Launch preparation'}</a></li>
              {site.settings.sections.client && (
                <li><a href="#client-project" className="hover:text-white transition">{fr ? 'Projet Client Bab Doukkala' : 'Bab Doukkala Case Study'}</a></li>
              )}
            </ul>
          </div>

          {/* Col 4: Villes au Maroc */}
          <div className="space-y-3">
            <p className="font-medium text-white text-[12px]">
              {fr ? 'Villes desservies' : 'Morocco coverage'}
            </p>
            <ul className="space-y-2 text-white/50">
              <li>Casablanca (Maârif, Gauthier, Ain Diab)</li>
              <li>Rabat (Agdal, Souissi, Hay Riad)</li>
              <li>Marrakech (Guéliz, Hivernage)</li>
              <li>Tanger (Malabata, Centre)</li>
              <li>Fès, Agadir, Oujda, Meknès</li>
            </ul>
          </div>

        </div>

        {/* Contact Strip */}
        {(site.settings.businessEmail || site.settings.businessPhone) && (
          <div className="flex flex-wrap items-center gap-6 py-6 border-b border-white/10 text-xs text-white/70">
            {site.settings.businessEmail && (
              <a href={`mailto:${site.settings.businessEmail}`} className="flex items-center gap-2 hover:text-white transition">
                <Mail size={14} className="text-[#01bc7c]" />
                <span>{site.settings.businessEmail}</span>
              </a>
            )}
            {site.settings.businessPhone && (
              <a href={`tel:${site.settings.businessPhone.replace(/[^+0-9]/g,'')}`} className="flex items-center gap-2 hover:text-white transition">
                <Phone size={14} className="text-[#01bc7c]" />
                <span>{site.settings.businessPhone}</span>
              </a>
            )}
            <div className="flex items-center gap-2 text-white/50">
              <MapPin size={14} className="text-[#01bc7c]" />
              <span>Maroc (Casablanca · Marrakech · Rabat)</span>
            </div>
          </div>
        )}

        {/* Bottom Bar: Copyright & Language Selector */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-white/50">
          <div>
            © {new Date().getFullYear()} {site.settings.businessName || 'Clinahir'}. {fr ? 'Tous droits réservés.' : 'All rights reserved.'}
          </div>

          <div className="flex items-center gap-4">
            <PrivacyLink language={language} />

            {/* Language Switcher */}
            <div data-language-selector className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1">
              <Globe size={13} className="text-white/60" />
              <label htmlFor="footer-lang-select" className="sr-only">
                {fr ? 'Changer de langue' : 'Select language'}
              </label>
              <select
                id="footer-lang-select"
                aria-label="Language / Langue"
                value={language}
                onChange={event => onLanguageChange?.(event.target.value as 'en' | 'fr')}
                className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer"
              >
                <option value="en" className="bg-[#111] text-white">English</option>
                <option value="fr" className="bg-[#111] text-white">Français</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
