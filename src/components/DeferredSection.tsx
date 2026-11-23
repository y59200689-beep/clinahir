import {useEffect, useRef, useState, type ReactNode} from 'react';
// Mount once near the viewport or when a navigation link targets this content.
// Once mounted it never unmounts: demo edits and form drafts survive navigation.
export function DeferredSection({children,className,language,hashTargets=[]}: {children:ReactNode;className?:string;language:'en'|'fr';hashTargets?:string[]}) {
  const ref=useRef<HTMLDivElement>(null);
  const targets=hashTargets.join('|');
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const targetIds=targets.split('|');
    const revealForHash=()=>{if(targetIds.includes(location.hash.slice(1)))setVisible(true);};
    const revealForClick=(event:MouseEvent)=>{const link=(event.target as Element)?.closest?.('a[href^="#"]');if(link&&targetIds.includes(link.getAttribute('href')!.slice(1)))setVisible(true);};
    revealForHash();window.addEventListener('hashchange',revealForHash);document.addEventListener('click',revealForClick);
    if(!('IntersectionObserver' in window)){setVisible(true);return()=>{window.removeEventListener('hashchange',revealForHash);document.removeEventListener('click',revealForClick);};}
    const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setVisible(true);observer.disconnect();}},{rootMargin:'120px'});
    if(ref.current)observer.observe(ref.current);
    return()=>{observer.disconnect();window.removeEventListener('hashchange',revealForHash);document.removeEventListener('click',revealForClick);};
  },[targets]);
  useEffect(() => {
    const container = ref.current;
    if (!visible || !container) return;
    const targetIds = targets.split('|');

    const scrollToTarget = () => {
      const id = location.hash.slice(1);
      if (!targetIds.includes(id)) return true;
      const target = document.getElementById(id);
      if (!target) return false;
      target.scrollIntoView({ behavior: 'instant' });
      return true;
    };

    const observer = new MutationObserver(() => {
      if (scrollToTarget()) observer.disconnect();
    });
    const followHash = () => {
      observer.disconnect();
      if (!scrollToTarget()) observer.observe(container, { childList: true, subtree: true });
    };
    followHash();
    window.addEventListener('hashchange', followHash);
    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', followHash);
    };
  }, [visible, targets]);
  return <div ref={ref} className={className}>{visible?children:<p data-i18n-managed="true" className="sr-only">{language==='fr'?'Le contenu interactif se charge à l’approche de cette section.':'Interactive content loads when this section approaches the viewport.'}</p>}</div>;
}
