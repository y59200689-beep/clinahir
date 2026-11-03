#!/usr/bin/env node
/**
 * Programmatic Local SEO Generator for Clinahir
 * Follows Moroccan Medical Law (Loi 131-13 & Code de Déontologie):
 * - NO commercial pricing or promotional exam fees
 * - Focuses strictly on clinical preparation, medical indications, AMO/CNSS coverage framework, and booking
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
  const pageTitle = `${modality.nameShort} à ${city.name} : Rendez-vous & Centres d'Imagerie | Clinahir`;
  const metaDesc = `Prenez rendez-vous pour votre ${modality.nameShort} à ${city.name}. Indications médicales, préparation requise, prise en charge AMO/CNSS et centres partenaires au Maroc.`;
  const canonicalUrl = `https://clinahir.tech/examens/${modality.id}/${city.id}/`;

  const schemaJson = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": `${canonicalUrl}#webpage`,
        "url": canonicalUrl,
        "name": pageTitle,
        "description": metaDesc,
        "inLanguage": "fr-MA",
        "about": {
          "@type": "MedicalProcedure",
          "name": modality.name,
          "procedureType": "Diagnostic"
        }
      },
      {
        "@type": "MedicalClinic",
        "@id": `${canonicalUrl}#clinic`,
        "name": `Centres Partenaires de ${modality.nameShort} Clinahir - ${city.name}`,
        "description": `Réseau de centres de radiologie et d'imagerie médicale partenaires équipés pour ${modality.name} à ${city.name}.`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": city.name,
          "addressRegion": city.region,
          "addressCountry": "MA"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": city.geo.lat,
          "longitude": city.geo.lng
        },
        "areaServed": {
          "@type": "AdministrativeArea",
          "name": `${city.name}, Maroc`
        },
        "availableService": {
          "@type": "MedicalTest",
          "name": modality.name
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday"
            ],
            "opens": "00:00",
            "closes": "23:59"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": `Une ordonnance médicale est-elle obligatoire pour une ${modality.nameShort} à ${city.name} ?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Oui, en conformité avec la législation médicale marocaine et les recommandations de protection radiologique, tout examen d'imagerie médicale (${modality.nameShort}) nécessite obligatoirement une ordonnance médicale délivrée par un médecin traitant ou spécialiste.`
            }
          },
          {
            "@type": "Question",
            "name": `Comment s'effectue la prise en charge et le remboursement AMO / CNSS pour une ${modality.nameShort} ?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Les examens de radiologie prescrits font l'objet d'un remboursement selon la Tarification Nationale de Référence (TNR) fixée par l'Agence Nationale de l'Assurance Maladie (ANAM). Selon le centre conventionné, vous pouvez bénéficier d'une prise en charge directe (Tiers payant AMO/Mutuelle) ou d'un dossier de remboursement avec feuille de soins dument complétée.`
            }
          },
          {
            "@type": "Question",
            "name": `Comment connaître le tarif de mon examen avant le rendez-vous ?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Conformément à la déontologie médicale au Maroc (loi 131-13), les honoraires médicaux ne font pas l'objet de publicité commerciale. Les patients peuvent demander un devis préalable chiffré directement auprès du secrétariat médical du centre lors de la confirmation de la demande de rendez-vous.`
            }
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://clinahir.tech/" },
          { "@type": "ListItem", "position": 2, "name": "Examens", "item": "https://clinahir.tech/examens/" },
          { "@type": "ListItem", "position": 3, "name": modality.nameShort, "item": `https://clinahir.tech/examens/${modality.id}/` },
          { "@type": "ListItem", "position": 4, "name": city.name, "item": canonicalUrl }
        ]
      }
    ]
  };

  return `<!doctype html>
<html lang="fr-MA">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageTitle}</title>
  <meta name="description" content="${metaDesc}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta name="robots" content="index, follow" />
  <meta name="geo.region" content="MA" />
  <meta name="geo.placename" content="${city.name}" />
  <meta name="geo.position" content="${city.geo.lat};${city.geo.lng}" />
  <meta name="ICBM" content="${city.geo.lat}, ${city.geo.lng}" />

  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${pageTitle}" />
  <meta property="og:description" content="${metaDesc}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:locale" content="fr_MA" />
  <meta property="og:site_name" content="Clinahir" />

  <link rel="icon" type="image/png" sizes="256x256" href="/favicon.png" />
  <link rel="stylesheet" href="/assets/index-BQQttrHU.css" />

  <!-- Structured Data JSON-LD -->
  <script type="application/ld+json">
  ${JSON.stringify(schemaJson, null, 2)}
  </script>

  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; background-color: #f8fafc; line-height: 1.6; margin: 0; padding: 0; }
    .container { max-width: 960px; margin: 0 auto; padding: 24px 20px; }
    header.hero { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 60px 20px; text-align: center; }
    header.hero h1 { font-size: 2.2rem; margin: 0 0 16px; font-weight: 700; }
    header.hero p.lead { font-size: 1.15rem; color: #94a3b8; max-width: 750px; margin: 0 auto 24px; }
    .badge { display: inline-block; background: #0284c7; color: white; padding: 6px 14px; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
    .card { background: white; border-radius: 12px; padding: 28px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.07); margin-bottom: 24px; border: 1px solid #e2e8f0; }
    h2 { font-size: 1.5rem; color: #0f172a; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 10px; }
    .cta-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
    .cta-button { display: inline-block; background: #0284c7; color: white; text-decoration: none; font-weight: 600; padding: 14px 28px; border-radius: 8px; font-size: 1.1rem; transition: background 0.2s; }
    .cta-button:hover { background: #0369a1; }
    .notice-legal { background: #f8fafc; border-left: 4px solid #64748b; padding: 14px 18px; font-size: 0.9rem; color: #475569; margin: 24px 0; }
    .faq-item { margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 14px; }
    .faq-question { font-weight: 600; color: #0f172a; font-size: 1.05rem; margin-bottom: 6px; }
    .district-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .district-tag { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 500; }
    footer { text-align: center; padding: 30px 20px; color: #64748b; font-size: 0.9rem; }
    .internal-links { background: #f1f5f9; border-radius: 12px; padding: 28px; margin: 24px 0; }
    .internal-links h2 { color: #0f172a; font-size: 1.3rem; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    .cities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; margin-top: 14px; }
    .city-link { display: block; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; text-decoration: none; color: #0284c7; font-weight: 500; font-size: 0.95rem; text-align: center; transition: all 0.15s; }
    .city-link:hover { background: #0284c7; color: white; border-color: #0284c7; }
    .city-link.active { background: #0f172a; color: white; border-color: #0f172a; cursor: default; }
    .modalities-nav { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .modality-link { background: #e0f2fe; color: #0369a1; padding: 6px 14px; border-radius: 6px; text-decoration: none; font-size: 0.9rem; font-weight: 500; }
    .modality-link:hover { background: #0369a1; color: white; }
    .guide-link { display: inline-block; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 0.95rem; margin-top: 12px; }
    .guide-link:hover { background: #166534; color: white; }
  </style>
</head>
<body>

  <header class="hero">
    <div class="container">
      <span class="badge">Imagerie Médicale · ${city.name}</span>
      <h1>${modality.nameShort} à ${city.name}</h1>
      <p class="lead">${modality.description} Découvrez les indications, les consignes médicales de préparation et planifiez votre demande de rendez-vous dans un centre partenaire à ${city.name}.</p>
      <a href="/?examen=${modality.id}&ville=${city.id}#rendez-vous" class="cta-button">Demander un rendez-vous à ${city.name}</a>
    </div>
  </header>

  <main class="container">

    <section class="card">
      <h2>Indications cliniques fréquentes pour cet examen</h2>
      <p>L'examen de <strong>${modality.name}</strong> à ${city.name} est prescrit par votre médecin dans le cadre des investigations suivantes :</p>
      <ul>
        ${modality.indications.map(ind => `<li>${ind}</li>`).join("\n        ")}
      </ul>
      <p><em>Durée moyenne de l'examen : environ ${modality.procedureDuration}.</em></p>
    </section>

    <section class="card">
      <h2>Protocole de préparation et sécurité médicale</h2>
      <p>Pour assurer la fiabilité des images radiologiques et la sécurité du patient, veillez à respecter scrupuleusement les consignes préalables :</p>
      <ul>
        ${modality.preparation.map(prep => `<li>${prep}</li>`).join("\n        ")}
      </ul>
    </section>

    <section class="card">
      <h2>Prise en charge AMO, Mutuelles & Cadre Déontologique</h2>
      <div class="notice-legal">
        <strong>Information déontologique (Loi 131-13 relative à l'exercice de la médecine au Maroc) :</strong><br />
        Conformément aux règles de déontologie médicale, les tarifs et honoraires des examens ne font l'objet d'aucune démarche publicitaire ou commerciale. Les centres partenaires appliquent les conventions en vigueur. Vous pouvez demander un devis préalable précis directement auprès du secrétariat médical lors de votre confirmation.
      </div>
      <h3>Modalités de remboursement :</h3>
      <ul>
        <li><strong>Assurance Maladie Obligatoire (AMO / CNSS / CNOPS) :</strong> Les examens d'imagerie conventionnés sont pris en charge selon la Tarification Nationale de Référence (TNR) fixée par l'ANAM.</li>
        <li><strong>Feuille de soins :</strong> Le secrétariat du centre vous remet une feuille de soins dûment visée et signée par le médecin radiologue, accompagnée de votre ordonnance et du compte-rendu médical.</li>
        <li><strong>Assurances privées & Mutuelles complémentaires :</strong> De nombreux centres acceptent les conventions de prise en charge directe (Tiers-payant) sur accord préalable de votre organisme d'assurance.</li>
      </ul>
    </section>

    <section class="card">
      <h2>Centres et quartiers desservis à ${city.name}</h2>
      <p>Les centres de radiologie partenaires couvrent les principaux secteurs et quartiers de ${city.name} :</p>
      <div class="district-tags">
        ${city.districts.map(d => `<span class="district-tag">${d}</span>`).join("\n        ")}
      </div>
    </section>

    <section class="cta-box">
      <h2>Besoin de planifier votre ${modality.nameShort} à ${city.name} ?</h2>
      <p>Envoyez votre demande de rendez-vous en ligne en transmettant votre ordonnance médicale pour une confirmation rapide par le centre partenaire.</p>
      <a href="/?examen=${modality.id}&ville=${city.id}#rendez-vous" class="cta-button">Prendre rendez-vous en ligne</a>
    </section>

    <section class="card">
      <h2>Foire aux questions (FAQ) - ${modality.nameShort} à ${city.name}</h2>
      <div class="faq-item">
        <div class="faq-question">Une ordonnance médicale est-elle obligatoire ?</div>
        <div>Oui, l'ordonnance médicale est formellement requise pour garantir que l'examen correspond à l'indication clinique recherchée et pour permettre le remboursement par votre caisse d'assurance.</div>
      </div>
      <div class="faq-item">
        <div class="faq-question">Quand les résultats sont-ils disponibles ?</div>
        <div>Dans la majorité des centres d'imagerie partenaires à ${city.name}, les clichés numériques sont accessibles rapidement et le compte-rendu rédigé par le médecin radiologue est remis sous 24 à 48 heures (ou le jour même en cas d'urgence).</div>
      </div>
      <div class="faq-item">
        <div class="faq-question">Comment demander un devis préalable ?</div>
        <div>Vous pouvez solliciter un devis préalable lors de la confirmation de votre demande, en précisant si l'examen comporte ou non une injection de produit de contraste.</div>
      </div>
    </section>

    <section class="internal-links">
      <h2>${modality.nameShort} dans d'autres villes du Maroc</h2>
      <p>Retrouvez notre service de prise de rendez-vous pour votre <strong>${modality.name}</strong> dans les principales villes :</p>
      <div class="cities-grid">
        ${CITIES.map(c => c.id === city.id 
          ? `<span class="city-link active">${c.name} ✓</span>` 
          : `<a href="/examens/${modality.id}/${c.id}/" class="city-link">${modality.nameShort} à ${c.name}</a>`
        ).join('\n    ')}
      </div>
      <h2 style="margin-top:24px;">Autres examens d'imagerie à ${city.name}</h2>
      <div class="modalities-nav">
        ${MODALITIES.map(m => m.id === modality.id 
          ? `<span style="background:#0f172a;color:white;padding:6px 14px;border-radius:6px;font-size:0.9rem;font-weight:500;">${m.nameShort} ✓</span>`
          : `<a href="/examens/${m.id}/${city.id}/" class="modality-link">${m.nameShort}</a>`
        ).join('\n    ')}
      </div>
      <div style="margin-top:16px;">
        <a href="/guide/imagerie-medicale-maroc/" class="guide-link">📖 Guide complet de l'imagerie médicale au Maroc →</a>
      </div>
    </section>

  </main>

  <footer>
    <div style="max-width:960px;margin:0 auto;padding:30px 20px;">
      <p style="margin-bottom:16px;">
        <a href="/">Accueil</a> · 
        <a href="/guide/imagerie-medicale-maroc/">Guide Imagerie Médicale</a> · 
        <a href="/guide/irm-maroc/">Guide IRM</a> · 
        <a href="/guide/scanner-maroc/">Guide Scanner</a> · 
        <a href="/guide/echographie-maroc/">Guide Échographie</a>
      </p>
      <p style="margin-bottom:12px;color:#475569;">
        Villes : 
        ${CITIES.map(c => `<a href="/examens/irm/${c.id}/">${c.name}</a>`).join(' · ')}
      </p>
      <p style="color:#94a3b8;font-size:0.85rem;">
        Clinahir — Plateforme de prise de rendez-vous en imagerie médicale et radiologie au Maroc.<br/>
        Les tarifs des examens ne sont pas communiqués conformément à la Loi 131-13 relative à l'exercice de la médecine. © 2026 Clinahir
      </p>
    </div>
  </footer>

</body>
</html>`;
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

