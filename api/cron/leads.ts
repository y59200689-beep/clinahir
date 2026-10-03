import { serverConfig } from '../../server/config.js';
import { retryRequest } from '../../server/http.js';
import { SupabaseLeadStore } from '../../server/supabase.js';
async function handle(request: Request): Promise<Response> {
  try { return await retryRequest(request, new SupabaseLeadStore(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''), serverConfig(process.env)); }
  catch { return Response.json({ error: 'Outbox unavailable' }, { status: 503 }); }
}
export const GET = handle;
export const POST = handle;
