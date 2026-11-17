#!/usr/bin/env node
/**
 * Programmatic Local SEO Generator for Clinahir
 * Business-only location pages. No clinical advice, invented partners or booking claims.
 * Kept noindex until editorial review establishes their unique search value.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

export const CITIES = [
  {
    id: "casablanca",
    name: "Casablanca",
    nameAr: "الدار البيضاء",
    region: "Casablanca-Settat",
    districts: ["Maârif", "Gauthier", "Bourgogne", "Ain Sebaâ", "Anfa", "Sidi Maârouf"],
    geo: { lat: 33.5731, lng: -7.5898 },
  },
  {
    id: "rabat",
    name: "Rabat",
    nameAr: "الرباط",
    region: "Rabat-Salé-Kénitra",
    districts: ["Agdal", "Hassan", "Hay Riad", "Souissi", "Océan"],
    geo: { lat: 34.0209, lng: -6.8416 },
  },
  {
    id: "marrakech",
    name: "Marrakech",
    nameAr: "مراكش",
    region: "Marrakech-Safi",
    districts: ["Guéliz", "Hivernage", "Targa", "Mhamid", "Sidi Youssef Ben Ali"],
    geo: { lat: 31.6295, lng: -7.9811 },
  },
  {
    id: "tanger",
    name: "Tanger",
    nameAr: "طنجة",
    region: "Tanger-Tétouan-Al Hoceïma",
    districts: ["Centre-Ville", "Malabata", "Iberia", "Val Fleuri"],
    geo: { lat: 35.7595, lng: -5.8340 },
  },
  {
    id: "agadir",
    name: "Agadir",
    nameAr: "أكادير",
    region: "Souss-Massa",
    districts: ["Centre", "Founty", "Dakhla", "Hassan II"],
    geo: { lat: 30.4278, lng: -9.5981 },
  },
  {
    id: "fes",
    name: "Fès",
    nameAr: "فاس",
    region: "Fès-Meknès",
    districts: ["Ville Nouvelle", "Champs de Course", "Route d'Imouzzer", "Narjiss"],
    geo: { lat: 34.0181, lng: -5.0078 },
  },
];

export const MODALITIES = [
  {
    id: "irm",
    name: "IRM (Imagerie par Résonance Magnétique)",
    nameShort: "IRM",
    nameAr: "الفحص بالرنين المغناطيسي",
    heroHeading: "Rendez-vous IRM",
    description: "Examen d'imagerie par résonance magnétique (1.5T ou 3T) haute résolution sans rayons X.",
    indications: [
      "Pathologies neurologiques et cérébrales (céphalées chroniques, AVC, SEP)",
      "Bilan ostéo-articulaire et sportif (ligaments du genou, ménisques, épaule)",
      "Exploration rachidienne (hernie discale, lombalgie, sciatique)",
      "Imagerie pelvienne, prostatique et gynécologique approfondie"
    ],
    preparation: [
      "Ordonnance médicale obligatoire d'un médecin traitant ou spécialiste.",
      "Vérification rigoureuse des contre-indications formelles (stimulateur cardiaque / pacemaker, clips vasculaires ferromagnétiques, éclats métalliques intraoculaires).",
      "Si une injection de produit de contraste (Gadolinium) est prescrite : bilan de créatinine sanguine récent demandé pour évaluer la fonction rénale.",
      "Le port de tout bijou, montre ou objet métallique est strictement proscrit dans la salle d'examen."
    ],
    procedureDuration: "20 à 35 minutes",
  },
  {
    id: "scanner",
    name: "Scanner / TDM (Tomodensitométrie)",
    nameShort: "Scanner",
    nameAr: "الفحص بالأشعة المقطعية (السكانير)",
    heroHeading: "Rendez-vous Scanner TDM",
    description: "Examen tomodensitométrique multibarette permettant une reconstruction tridimensionnelle des organes.",
    indications: [
      "Exploration thoracique (bilan pulmonaire, nodules, embolie pulmonaire)",
      "Imagerie abdomino-pelvienne (douleurs aiguës, foie, reins, pancréas, appendicite)",
      "Angioscanner et coroscanner des vaisseaux coronaires et périphériques",
      "Traumatologie osseuse et rachidienne complexe"
    ],
    preparation: [
      "Ordonnance médicale obligatoire précisant l'indication clinique exacte.",
      "En cas d'injection de produit de contraste iodé : jeûne de 4 heures préalable et bilan de fonction rénale (créatininémie récent).",
      "Signaler systématiquement tout antécédent allergique ou traitement pour le diabète (Metformine).",
      "Examen contre-indiqué en cas de grossesse, sauf urgence vitale dûment validée."
    ],
    procedureDuration: "10 à 15 minutes",
  },
  {
    id: "echographie",
    name: "Échographie & Écho-Doppler",
    nameShort: "Échographie",
    nameAr: "الفحص بالصدى والدوبلر",
    heroHeading: "Rendez-vous Échographie et Doppler",
    description: "Exploration dynamique non invasive par ultrasons des tissus mous, des vaisseaux sanguins et du fœtus.",
    indications: [
      "Échographie abdominale et hépato-bilio-pancréatique",
      "Échographie pelvienne et obstétricale de suivi de grossesse (3D/4D)",
      "Échographie de la thyroïde et des aires ganglionnaires",
      "Écho-Doppler artériel et veineux des membres inférieurs et des troncs supra-aortiques"
    ],
    preparation: [
      "Échographie abdominale : être strictement à jeun depuis 4 à 6 heures (ne pas boire, fumer ou manger).",
      "Échographie pelvienne ou rénale : vessie pleine (boire 3 à 4 verres d'eau 1 heure avant l'examen sans uriner).",
      "Examen totalement indolore et sans aucune irradiation."
    ],
    procedureDuration: "15 à 20 minutes",
  },
  {
    id: "mammographie",
    name: "Mammographie Numérique & Sénologie",
    nameShort: "Mammographie",
    nameAr: "فحص الثدي بالأشعة الرقمية (الماموغرافي)",
    heroHeading: "Rendez-vous Mammographie & Dépistage",
    description: "Examen radiologique de référence du tissu mammaire à faible dose, couplé à la tomosynthèse 3D et l'échographie.",
    indications: [
      "Dépistage systématique du cancer du sein (recommandé tous les 2 ans dès 45-50 ans)",
      "Bilan diagnostique devant une anomalie palpable, écoulement ou douleur",
      "Surveillance de lésions bénignes ou antécédents familiaux de cancer du sein"
    ],
    preparation: [
      "Idéalement réalisée dans la première partie du cycle menstruel (entre le 5ème et le 12ème jour après le début des règles) pour un confort optimal.",
      "Ne pas appliquer de talc, déodorant, parfum ou crème sur les aisselles et la poitrine le jour de l'examen.",
      "Apporter impérativement les anciens clichés et comptes-rendus pour comparaison comparative essentielle."
    ],
    procedureDuration: "15 à 20 minutes",
  },
  {
    id: "radiographie",
    name: "Radiographie Numérique Standard",
    nameShort: "Radiographie",
    nameAr: "الأشعة السينية الرقمية",
    heroHeading: "Rendez-vous Radiographie Numérique",
    description: "Radiologie générale numérique à capteur plan offrant une qualité d'image haute définition à dose d'irradiation réduite.",
    indications: [
      "Radiographie pulmonaire et thoracique de contrôle ou préopératoire",
      "Radiologie ostéo-articulaire (traumatisme, suspicion de fracture, arthrose)",
      "Bilan du rachis en charge et télémétrie des membres",
      "Panoramique dentaire et bilan orthodontique (Cône Beam / CBCT)"
    ],
    preparation: [
      "Ordonnance médicale obligatoire.",
      "Aucune préparation alimentaire particulière (pas de jeûne nécessaire).",
      "Retirer tout vêtement ou accessoire comportant des parties métalliques au niveau de la zone radiographiée.",
      "Informer le personnel médical de toute possibilité de grossesse en cours."
    ],
    procedureDuration: "5 à 10 minutes",
  },
];

function generatePageHtml(modality, city) {
  const title = `Organisation des rendez-vous ${modality.nameShort} à ${city.name} | Clinahir`;
  const description = `Présentation de Clinahir pour les responsables de centres de radiologie à ${city.name}. Visibilité digitale, demandes de rendez-vous et coordination des équipes.`;
  const canonical = `https://clinahir.tech/examens/${modality.id}/${city.id}/`;
  const schema = { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonical, inLanguage: 'fr', publisher: { '@type': 'Organization', name: 'Clinahir', url: 'https://clinahir.tech/' } };
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><meta name="description" content="${description}"><meta name="robots" content="noindex, follow"><link rel="canonical" href="${canonical}"><script type="application/ld+json">${JSON.stringify(schema)}</script><style>body{margin:0;background:#f5f4f6;color:#202b27;font:17px/1.7 system-ui,sans-serif}main,header,footer{max-width:760px;margin:auto;padding:32px 24px}h1{font-size:clamp(32px,5vw,48px);line-height:1.15;letter-spacing:-.03em}h2{font-size:24px;margin-top:40px}a{color:#09694e}header{border-bottom:1px solid #dbe2de}.cta{display:inline-block;background:#09694e;color:white;padding:12px 20px;border-radius:10px;text-decoration:none}:focus-visible{outline:3px solid #079b77;outline-offset:4px}.notice{border-left:3px solid #09694e;padding:12px 20px;background:white}</style></head><body><header><a href="/">Clinahir</a></header><main><h1>Un parcours de rendez-vous plus clair pour votre centre à ${city.name}.</h1><p>${description}</p><p class="notice">Cette page s’adresse aux responsables de centres. Clinahir n’est pas un centre de soins. Aucune réservation d’examen ni transmission d’ordonnance n’est proposée ici.</p><h2>De la recherche à la demande de rendez-vous</h2><p>Pour votre activité ${modality.nameShort}, nous pouvons étudier la présentation des examens sur votre site, la réception des demandes et la coordination entre les membres de votre équipe.</p><h2>Explorer avant de définir le périmètre</h2><p>Le site Clinahir présente un tableau de bord interactif avec des données fictives : rendez-vous, calendrier et activité. Il s’agit d’une démonstration, pas d’un système clinique connecté.</p><h2>Une mise en place adaptée à votre centre</h2><ol><li>Décrire votre organisation actuelle et vos besoins.</li><li>Définir ensemble un périmètre et une proposition.</li><li>Préparer la configuration, la formation et les conditions d’exploitation avant toute utilisation réelle.</li></ol><p>La gestion de données de santé, les accès et les responsabilités doivent faire l’objet d’une revue distincte avant un déploiement clinique.</p><a class="cta" href="/#book-demo">Demander une démonstration</a></main><footer>Clinahir · Technologie et accompagnement pour centres d’imagerie au Maroc.</footer></body></html>`;
}

// Generate all pages
console.log("Generating Programmatic SEO pages for Clinahir...");
let pageCount = 0;
const generatedUrls = [];

for (const modality of MODALITIES) {
  for (const city of CITIES) {
    const dir = path.join(publicDir, "examens", modality.id, city.id);
    mkdirSync(dir, { recursive: true });
    const html = generatePageHtml(modality, city);
    writeFileSync(path.join(dir, "index.html"), html, "utf-8");
    generatedUrls.push(`https://clinahir.tech/examens/${modality.id}/${city.id}/`);
    pageCount++;
  }
}

console.log(`Generated ${pageCount} programmatic pages successfully!`);

// Export generated URLs for sitemap generation
writeFileSync(
  path.join(__dirname, "../public/programmatic-urls.json"),
  JSON.stringify(generatedUrls, null, 2),
  "utf-8"
);

