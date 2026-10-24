import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { siteDefaults, validateSiteDocument, type SiteDocument, type Locale } from './schema';
const Context = createContext({ document: siteDefaults });
export function SiteContentProvider({ children }: {
    children: ReactNode;
}) {
    const [document, setDocument] = useState(siteDefaults);
    useEffect(() => { const abort = new AbortController(); void fetch('/api/content', { signal: abort.signal }).then(async (r) => { if (r.ok) {
        const d = await r.json();
        if (d.content)
            setDocument(validateSiteDocument(d.content));
    } }).catch(() => { }); return () => abort.abort(); }, []);
    return <Context.Provider value={{ document }}>{children}</Context.Provider>;
}
export function useSiteContent() { return useContext(Context); }
export function useManagedCopy<T>(key: 'landing' | 'client', fallback: T, language: Locale): T {
    const { document } = useSiteContent();
    return (document[key][language] ?? fallback) as T;
}
