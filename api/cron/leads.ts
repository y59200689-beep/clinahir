import { serverConfig } from '../../server/config.js';
import { retryRequest } from '../../server/http.js';
import { SupabaseLeadStore } from '../../server/supabase.js';
import { processWhatsApp } from '../../server/whatsapp.js';
async function handle(request:Request):Promise<Response>{
 try {
  const store=new SupabaseLeadStore(process.env.SUPABASE_URL ?? '',process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
  const response=await retryRequest(request,store,serverConfig(process.env));
  if(!response.ok)return response;
  let whatsapp=0;let whatsappError=false;
  try {whatsapp=await processWhatsApp(store,process.env);}catch {whatsappError=true;console.error('clinahir_whatsapp',{reason:'processing_failed'});}
  const health=await store.health();
  await store.cronHeartbeat(whatsappError);
  console.info('clinahir_cron_complete',{whatsapp,whatsappError,health});
  return Response.json({...await response.json(),whatsapp,whatsappError,health},{status:whatsappError?503:200,headers:{'Cache-Control':'no-store'}});
 }catch {console.error('clinahir_cron_failed');return Response.json({error:'Outbox unavailable'},{status:503});}
}
export const GET=handle;export const POST=handle;
