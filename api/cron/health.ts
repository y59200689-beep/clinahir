import { environmentFailure } from '../../server/environment.js';
import { cronAuthorized } from '../../server/http.js';
import { SupabaseLeadStore } from '../../server/supabase.js';
export async function GET(request:Request):Promise<Response> {
 const failure = environmentFailure(process.env, request); if (failure) return failure;
 if(!cronAuthorized(request,process.env.CRON_SECRET))return Response.json({error:'Unauthorized'},{status:401});
 try {
  const store=new SupabaseLeadStore(process.env.SUPABASE_URL ?? '',process.env.SUPABASE_SERVICE_ROLE_KEY ?? '');
  const [health,heartbeat]=await Promise.all([store.health(),store.heartbeat()]);
  return Response.json({health,heartbeat,whatsappEnabled:process.env.WHATSAPP_ENABLED==='true'},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Health unavailable'},{status:503});}
}
