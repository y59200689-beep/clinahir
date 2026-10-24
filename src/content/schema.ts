import { landingDefaults } from './landing.js';
import { clientDefaults } from './client.js';
import { bilingualFaq } from './faq.js';
import features from './features.json' with { type: 'json' };
import outcomes from './outcomes.json' with { type: 'json' };
export type Locale = 'en' | 'fr';
export interface SiteDocument {
    outcomes: Record<Locale, {
        heading: string;
        description: string;
        badge: string;
        tabLabel: string;
        image: string;
    }[]>;
    hero: Record<Locale, {
        headline: string;
        description: string;
        cta: string;
        note: string;
    }>;
    landing: Record<Locale, Record<string, unknown>>;
    client: Record<Locale, Record<string, unknown>>;
    features: Record<string, Record<Locale, string>>;
    faq: Record<Locale, {
        question: string;
        answer: string;
    }[]>;
    settings: {
        businessName: string;
        businessEmail: string;
        businessPhone: string;
        facebook: string;
        instagram: string;
        tiktok: string;
        clientWebsite: string;
        clientInstagram: string;
        clientImage: string;
        footerTitle: Record<Locale, string>;
        footerCta: Record<Locale, string>;
        privacyDetails: Record<Locale, string>;
        footerDescription: Record<Locale, string>;
        sections: {
            solutions: boolean;
            client: boolean;
            outcomes: boolean;
            faq: boolean;
        };
    };
}
export const siteDefaults: SiteDocument = {
    outcomes,
    hero: { en: { headline: 'Turn More Searches Into Booked Appointments', description: 'Websites, online booking, digital visibility and growth systems built for radiology and medical centers.', cta: 'Book a Free Demo', note: 'Built to improve the patient journey from Google search to confirmed appointment.' }, fr: { headline: 'Transformez les recherches en rendez-vous confirmés', description: 'Sites web, prise de rendez-vous en ligne, visibilité digitale et solutions de croissance conçus pour les centres de radiologie et les établissements médicaux.', cta: 'Réserver une démo gratuite', note: 'Un parcours patient optimisé, de la recherche Google au rendez-vous confirmé.' } },
    landing: JSON.parse(JSON.stringify(landingDefaults)) as SiteDocument['landing'], client: clientDefaults, features, faq: bilingualFaq,
    settings: { businessName: 'Clinahir', businessEmail: '', businessPhone: '', facebook: '', instagram: '', tiktok: '', clientWebsite: 'https://www.radiologie-babdoukkala.com/', clientInstagram: 'https://www.instagram.com/radiologie_bab_doukkala/', clientImage: '', footerTitle: { en: 'Let’s see what Clinahir could do for your center.', fr: 'Voyons ce que Clinahir pourrait apporter à votre centre.' }, footerCta: { en: 'Request a demo', fr: 'Demander une démo' }, privacyDetails: { en: '', fr: '' }, footerDescription: { en: 'Digital technology and growth support for medical centers in Morocco.', fr: 'Technologie numérique et accompagnement à la croissance pour les centres médicaux au Maroc.' }, sections: { solutions: true, client: true, outcomes: true, faq: true } }
};
// Content-only schema: no HTML, scripts, credentials, arbitrary keys, or form contract changes.
const locked = ['eyebrow','journey','journeyBody','stages','cta','roles', 'challenges', 'fields', 'rolePlaceholder', 'challengePlaceholder', 'privacy', 'pending', 'sending', 'success', 'error'];
export function validateSiteDocument(value: unknown): SiteDocument {
    const visit = (data: unknown, base: unknown, path: string): void => {
        if (typeof base === 'string') {
            if (typeof data !== 'string' || data.length > 6000 || /[\u0000-\u0008]/.test(data))
                throw new Error('Invalid text');
            if ((/settings\.(facebook|instagram|tiktok|clientWebsite|clientInstagram|clientImage)$/.test(path) || path.endsWith('.image')) && data) {
                const url = new URL(data);
                if (url.protocol !== 'https:' || url.username || url.password)
                    throw new Error('Use a public HTTPS URL');
            }
            if (path === 'settings.businessEmail' && data && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data))
                throw new Error('Invalid business email');
            if (path.startsWith('landing.') && locked.includes(path.split('.')[2]) && data !== base)
                throw new Error('Protected form copy');
            return;
        }
        if (typeof base === 'boolean') {
            if (typeof data !== 'boolean')
                throw new Error('Invalid option');
            return;
        }
        if (Array.isArray(base)) {
            if (path.startsWith('faq.')) {
                if (!Array.isArray(data) || data.length < 1 || data.length > 30)
                    throw new Error('Use 1–30 questions');
                data.forEach((item, i) => visit(item, base[0], `${path}.${i}`));
                return;
            }
            if (!Array.isArray(data) || data.length !== base.length)
                throw new Error('Invalid items');
            base.forEach((item, i) => visit(data[i], item, `${path}.${i}`));
            return;
        }
        if (!data || typeof data !== 'object' || Array.isArray(data))
            throw new Error('Invalid content');
        const a = data as Record<string, unknown>, b = base as Record<string, unknown>;
        if (Object.keys(a).length !== Object.keys(b).length || Object.keys(a).some(k => !Object.hasOwn(b, k)))
            throw new Error('Unknown field');
        for (const k of Object.keys(b))
            visit(a[k], b[k], path ? `${path}.${k}` : k);
    };
    visit(value, siteDefaults, '');
    return value as SiteDocument;
}
export const protectedLandingFields = locked;
