import { serverConfig } from '../server/config.js';
import { leadRequest } from '../server/http.js';
import { SupabaseLeadStore } from '../server/supabase.js';
export async function POST(request: Request): Promise<Response> {
  try {
    return await leadRequest(request, new SupabaseLeadStore(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''), serverConfig(process.env));
  } catch { console.error('clinahir_lead_capture', { reason: 'storage_not_configured' }); return Response.json({ error: 'Your request could not be saved. Please try again.' }, { status: 503 }); }
}
