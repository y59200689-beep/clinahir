import { processWhatsApp } from '../server/whatsapp.js';
import { serverConfig } from '../server/config.js';
import { leadRequest } from '../server/http.js';
import { SupabaseLeadStore } from '../server/supabase.js';
export async function POST(request: Request): Promise<Response> {
  try {
    const store=new SupabaseLeadStore(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
    const response=await leadRequest(request,store,serverConfig(process.env));
    if(response.ok){const result=await response.clone().json() as {externalId:string};try{await processWhatsApp(store,process.env,fetch,result.externalId);}catch{console.error('clinahir_whatsapp',{reason:'processing_failed'});}}
    return response;
  } catch { console.error('clinahir_lead_capture', { reason: 'storage_not_configured' }); return Response.json({ error: 'Your request could not be saved. Please try again.' }, { status: 503 }); }
}
