export function startAnalytics(): () => void {
 // Respect browser privacy preferences. Never send form fields or raw URLs.
 if(navigator.doNotTrack==='1' || (navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl)return ()=>{};
 const send=(eventType:'page_view'|'demo_cta_click',placement:string)=>{
  void fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:crypto.randomUUID(),eventType,placement,language:document.querySelector<HTMLSelectElement>('select[aria-label="Language / Langue"]')?.value==='fr'?'fr':'en'}),keepalive:true}).catch(()=>{});
 };
 send('page_view','page');
 const clicked=(event:MouseEvent)=>{
  const anchor=(event.target as Element)?.closest<HTMLAnchorElement>('a[href="#book-demo"]');if(!anchor)return;
  const owner=anchor.closest('header,footer,section,[id="solutions"]');
  let placement=owner?.tagName==='FOOTER'?'footer':owner?.id || (owner?.closest('#solutions')?'solutions':'hero');
  if(!['hero','solutions','how-it-works','process','about','book-demo','footer'].includes(placement))placement='other';
  send('demo_cta_click',placement);
 };
 document.addEventListener('click',clicked);return ()=>document.removeEventListener('click',clicked);
}
