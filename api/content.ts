import { environmentFailure } from '../server/environment.js';
import { SupabaseLeadStore } from '../server/supabase.js';
export async function GET(request?: Request): Promise<Response> {
    const failure = environmentFailure(process.env, request); if (failure) return failure;
    try {
        const rows = await new SupabaseLeadStore(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').publishedContent();
        return Response.json({ content: rows[0]?.published ?? null }, { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30' } });
    }
    catch {
        return Response.json({ content: null }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
}
