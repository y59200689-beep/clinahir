import { SupabaseLeadStore } from '../server/supabase.js';
export async function GET(): Promise<Response> {
    try {
        const rows = await new SupabaseLeadStore(process.env.SUPABASE_URL ?? '', process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').publishedContent();
        return Response.json({ content: rows[0]?.published ?? null }, { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30' } });
    }
    catch {
        return Response.json({ content: null }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
}
