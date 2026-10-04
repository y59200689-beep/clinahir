import { createHash } from 'node:crypto';
import { SupabaseLeadStore } from './supabase.js';
export async function analyticsRequest(request: Request, env: Record<string,string | undefined>, fetcher: typeof fetch = fetch): Promise<Response> {
 const reply=(status:number)=>new Response(null,{status,headers:{'Cache-Control':'no-store'}});
 if(request.method!=='POST')return reply(405);
 if(request.headers.get('origin')!==new URL(request.url).origin)return reply(403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply(415);
 try {
  const reader=request.body?.getReader();if(!reader)return reply(400);
  let raw='';let size=0;const decoder=new TextDecoder();
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1024){await reader.cancel();return reply(413);}raw+=decoder.decode(value,{stream:true});}
  raw+=decoder.decode();let d: Record<string,unknown>;
  try { const parsed: unknown=JSON.parse(raw);if(!parsed || typeof parsed!=='object' || Array.isArray(parsed))return reply(400);d=parsed as Record<string,unknown>; } catch { return reply(400); }
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(d.id)) || !['page_view','demo_cta_click'].includes(String(d.eventType)) || !['page','hero','solutions','how-it-works','process','about','book-demo','footer','other'].includes(String(d.placement)) || !['en','fr'].includes(String(d.language)))return reply(400);
  const store=new SupabaseLeadStore(env.SUPABASE_URL ?? '',env.SUPABASE_SERVICE_ROLE_KEY ?? '',fetcher);
  const ip=request.headers.get('x-forwarded-for')?.split(',')[0].trim();
  if(ip && !await store.allow(createHash('sha256').update(`analytics:${ip}`).digest('hex')))return reply(429);
  await store.analyticsEvent({id:String(d.id),event_type:String(d.eventType),placement:String(d.placement),language:String(d.language)});
  return reply(204);
 } catch {console.error('clinahir_analytics',{reason:'event_not_saved'});return reply(503);}
}
