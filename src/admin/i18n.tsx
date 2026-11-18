import { Languages } from 'lucide-react';
import { AdminSelect } from './components/AdminSelect';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { translateAdmin, translateAdminError, type AdminLocale } from './translation';
const Context = createContext<{ locale: AdminLocale; setLocale: (locale: AdminLocale) => void } | null>(null);
export function AdminLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>('en');
  const languageChosen=useRef(false);
  const setLocale=useCallback((next:AdminLocale)=>{languageChosen.current=true;setLocaleState(next);},[]);
  useEffect(() => { try { const intent=window.__clinahirLocaleIntent?.admin;if(!languageChosen.current){if(intent==='fr'||intent==='en')setLocaleState(intent);else if(localStorage.getItem('clinahir:admin-language')==='fr')setLocaleState('fr');} } catch {} }, []);
  useEffect(() => { document.documentElement.lang = locale; try { localStorage.setItem('clinahir:admin-language', locale); } catch {} }, [locale]);
  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAdminLocale() {
  const context = useContext(Context);
  if (!context) throw new Error('AdminLocaleProvider required');
  const t = useCallback((key: string, values?: Record<string, string | number>) => translateAdmin(context.locale, key, values), [context.locale]);
  const errorText = useCallback((key: string) => translateAdminError(context.locale, key), [context.locale]);
  return { ...context, t, errorText, intlLocale: context.locale === 'fr' ? 'fr-MA' : 'en-GB' };
}
export function AdminLanguageSwitch() {
  const { locale, setLocale } = useAdminLocale();
  return (
    <AdminSelect label="Admin language / Langue" icon={<Languages size={15} aria-hidden="true" />}
      value={locale} onChange={value => setLocale(value as AdminLocale)}
      choices={[{ value: 'en', label: 'English' }, { value: 'fr', label: 'Français' }]}
    />
  );
}
