import { createInstance } from 'i18next';
import en from './locales/en.json' with { type: 'json' };
import fr from './locales/fr.json' with { type: 'json' };
export type AdminLocale = 'en' | 'fr';
const engine = createInstance();
void engine.init({ resources: { en: { translation: en }, fr: { translation: fr } }, lng: 'en', fallbackLng: 'en', supportedLngs: ['en', 'fr'], keySeparator: false, nsSeparator: false, interpolation: { escapeValue: false }, initAsync: false });
const keyByLowerCase = new Map(Object.keys(en).map(key => [key.toLowerCase(), key]));
export function translateAdmin(locale: AdminLocale, key: string, values: Record<string, string | number> = {}): string {
  const known = Object.hasOwn(en, key) ? key : keyByLowerCase.get(key.toLowerCase());
  return known ? String(engine.getFixedT(locale)(known, values)) : key;
}

export function translateAdminError(locale: AdminLocale, message: string): string {
  const t = (key: string, values?: Record<string, string | number>) => translateAdmin(locale, key, values);
  if (Object.hasOwn(en, message)) return t(message);
  let match = /^Unsupported CSV column: (.+)$/.exec(message);
  if (match) return t('Unsupported CSV column: {{field}}', {field:match[1]});
  match = /^CSV needs a (.+) column\.$/.exec(message);
  if (match) return t('CSV needs a {{field}} column.', {field:match[1]});
  match = /^Row (\d+): (.+)$/.exec(message);
  if (match) return t('Row {{row}}: {{message}}', {row:match[1],message:translateAdminError(locale,match[2])});
  for (const suffix of [' is required', ' is too long', ' must be a public http or https URL', ' must be yes, no, or unknown']) {
    if (message.endsWith(suffix)) return t('{{field}}'+suffix, {field:t(message.slice(0,-suffix.length))});
  }
  return t('Operation failed. Please try again.');
}
