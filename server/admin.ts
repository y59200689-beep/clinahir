import { createHash } from 'node:crypto';
import { SupabaseLeadStore } from './supabase.js';
import { validateSiteDocument } from '../src/content/schema.js';
import { parseProspectCsv } from './prospects.js';
export interface AdminEnv extends Record<string, string | undefined> {
    SUPABASE_URL?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    CLINAHIR_ADMIN_USER_ID?: string;
    CLINAHIR_ADMIN_EMAIL?: string;
}
class AdminInputError extends Error {
}
const cookieName = 'clinahir_admin_session';
const reply = (data: object, status = 200, headers: Record<string, string> = {}) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
function cookie(request: Request, token = '', seconds = 0) { return `${cookieName}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${seconds}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`; }
function tokenFrom(request: Request) { return request.headers.get('cookie')?.split(';').map(p => p.trim()).find(p => p.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1); }
async function readBody(request: Request): Promise<Record<string, unknown>> {
    if (!request.headers.get('content-type')?.startsWith('application/json'))
        throw new AdminInputError('Invalid request');
    const reader = request.body?.getReader();
    if (!reader)
        throw new AdminInputError('Invalid request');
    let size = 0;
    const parts: Uint8Array[] = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        size += value.length;
        if (size > 200000) {
            await reader.cancel();
            throw new AdminInputError('Request too large');
        }
        parts.push(value);
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(Buffer.concat(parts).toString('utf8'));
    }
    catch {
        throw new AdminInputError('Invalid JSON');
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
        throw new AdminInputError('Invalid request');
    return parsed as Record<string, unknown>;
}
async function authCall(env: AdminEnv, path: string, fetcher: typeof fetch, body?: object, token?: string) {
    const url = new URL(env.SUPABASE_URL!);
    if (url.protocol !== 'https:' || url.pathname !== '/' || url.username || url.password)
        throw new Error('Invalid configuration');
    return fetcher(`${url.origin}/auth/v1/${path}`, { method: body ? 'POST' : 'GET', headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY!, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(7000), redirect: 'error' });
}
export async function adminRequest(request: Request, env: AdminEnv, fetcher: typeof fetch = fetch): Promise<Response> {
    const url = new URL(request.url), action = url.searchParams.get('action') ?? 'session';
    if (!['GET', 'POST'].includes(request.method))
        return reply({ error: 'Method not allowed' }, 405);
    if (request.method === 'POST' && request.headers.get('origin') !== url.origin)
        return reply({ error: 'Request not allowed' }, 403);
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.CLINAHIR_ADMIN_USER_ID || !env.CLINAHIR_ADMIN_EMAIL)
        return reply({ error: 'Admin sign-in is not configured for this environment. Check the server-side Supabase and owner settings.' }, 503);
    try {
        const store = new SupabaseLeadStore(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, fetcher);
        if (action === 'login' && request.method === 'POST') {
            const d = await readBody(request), email = typeof d.email === 'string' ? d.email.trim().toLowerCase() : '', password = typeof d.password === 'string' ? d.password : '';
            if (!email || email.length > 254 || !password || password.length > 200)
                return reply({ error: 'Enter your email and password.' }, 400);
            const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim();
            for (const identity of [`admin-email:${email}`, ...(ip ? [`admin-ip:${ip}`] : [])])
                if (!await store.allow(createHash('sha256').update(identity).digest('hex')))
                    return reply({ error: 'Too many attempts. Please try again later.' }, 429);
            if (email !== env.CLINAHIR_ADMIN_EMAIL.toLowerCase())
                return reply({ error: 'Email or password is incorrect.' }, 401);
            const response = await authCall(env, 'token?grant_type=password', fetcher, { email, password });
            if(response.status===429)return reply({error:'Too many sign-in attempts. Please try again later.'},429);
            if(response.status>=500)return reply({error:'Sign-in is temporarily unavailable. Please try again shortly.'},503);
            if (!response.ok)
                return reply({ error: 'Email or password is incorrect.' }, 401);
            const session = await response.json() as {
                access_token?: string;
                expires_in?: number;
                user?: {
                    id: string;
                    email: string;
                };
            };
            if (!session.access_token || session.user?.id !== env.CLINAHIR_ADMIN_USER_ID)
                return reply({ error: 'This account does not have admin access.' }, 403);
            return reply({ user: { email: session.user.email } }, 200, { 'Set-Cookie': cookie(request, session.access_token, Math.min(session.expires_in ?? 3600, 3600)) });
        }
        let token: string | undefined;
        try {
            const value = tokenFrom(request);
            token = value ? decodeURIComponent(value) : undefined;
        }
        catch {
            return reply({ error: 'Please sign in.' }, 401);
        }
        if (!token || token.length > 16000)
            return reply({ error: 'Please sign in.' }, 401);
        const check = await authCall(env, 'user', fetcher, undefined, token);
        if(check.status===401||check.status===403)return reply({error:'Your session expired. Please sign in again.'},401,{'Set-Cookie':cookie(request)});
        if(!check.ok)return reply({error:'Authentication is temporarily unavailable. Please try again shortly.'},503);
        const user = await check.json() as {
            id: string;
            email?: string;
        };
        if (user.id !== env.CLINAHIR_ADMIN_USER_ID || user.email?.toLowerCase() !== env.CLINAHIR_ADMIN_EMAIL.toLowerCase())
            return reply({ error: 'Access denied.' }, 403);
        if (action === 'session' && request.method === 'GET')
            return reply({ user: { email: user.email } });
        if (action === 'logout' && request.method === 'POST') {
            await authCall(env, 'logout', fetcher, {}, token).catch(() => { });
            return reply({ ok: true }, 200, { 'Set-Cookie': cookie(request) });
        }
        if (action === 'snapshot' && request.method === 'GET') {
            const search = (url.searchParams.get('search') ?? '').slice(0, 120), stage = url.searchParams.get('stage') ?? '', page = Number(url.searchParams.get('page') ?? 0);
            if (!['', 'new', 'contacted', 'qualified', 'won', 'lost'].includes(stage) || !Number.isInteger(page) || page < 0 || page > 10000)
                return reply({ error: 'Invalid filters' }, 400);
            const data = await store.adminRpc<Record<string, unknown>>('clinahir_admin_snapshot', { p_search: search, p_stage: stage, p_page: page });
            return reply({ ...data, integrations: { dailyCommand: Boolean(env.DAILY_COMMAND_URL && env.CLINAHIR_INTEGRATION_SECRET), whatsappEnabled: env.WHATSAPP_ENABLED === 'true', whatsappConfigured: Boolean(env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID && env.WHATSAPP_TEMPLATE_NAME && env.WHATSAPP_TEMPLATE_LANGUAGE && env.WHATSAPP_API_VERSION && env.WHATSAPP_DEMO_URL), cron: Boolean(env.CRON_SECRET) } });
        }
        if (action === 'content' && request.method === 'GET') {
            const rows = await store.content();
            return reply({ content: rows[0] ?? { draft: null, published: null, version: 0, published_at: null } });
        }
        if (action === 'prospects' && request.method === 'GET') {
            const search = (url.searchParams.get('search') ?? '').slice(0, 120), stage = url.searchParams.get('stage') ?? '',
                city = (url.searchParams.get('city') ?? '').slice(0, 120), website = url.searchParams.get('website') ?? '', page = Number(url.searchParams.get('page') ?? 0);
            if (!['','review','qualified','not_a_fit','do_not_contact'].includes(stage) || !['','with','without'].includes(website) || !Number.isInteger(page) || page < 0 || page > 10000)
                return reply({ error: 'Invalid filters' }, 400);
            return reply(await store.adminRpc('clinahir_admin_prospects', { p_search: search, p_stage: stage, p_page: page, p_city: city, p_website: website }));
        }
        if (request.method === 'POST') {
            const d = await readBody(request);
            if (action === 'prospects-import') {
                if (typeof d.csv !== 'string' || d.csv.length > 180000 || d.sourceUseConfirmed !== true)
                    return reply({ error: 'Confirm the data source and choose a valid CSV under 180 KB.' }, 400);
                let rows;
                try { rows = parseProspectCsv(d.csv, d.sourceUseConfirmed); }
                catch (error) { return reply({ error: (error as Error).message }, 400); }
                return reply(await store.adminRpc('clinahir_admin_import_prospects', { p_actor: user.id, p_rows: rows }));
            }
            if (action === 'prospect') {
                const optInEvidence = typeof d.optInEvidence === 'string' ? d.optInEvidence.trim() : '';
                if (typeof d.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(d.id)
                    || !['review','qualified','not_a_fit','do_not_contact'].includes(String(d.stage))
                    || typeof d.notes !== 'string' || d.notes.length > 3000
                    || typeof d.whatsappOptIn !== 'boolean'
                    || (d.whatsappOptIn && (optInEvidence.length < 5 || optInEvidence.length > 500)))
                    return reply({ error: 'Review fields are invalid. WhatsApp opt-in needs a short evidence note.' }, 400);
                await store.adminRpc('clinahir_admin_update_prospect', { p_actor: user.id, p_id: d.id, p_stage: d.stage, p_notes: d.notes, p_whatsapp_opt_in: d.whatsappOptIn, p_opt_in_evidence: d.whatsappOptIn ? optInEvidence : null });
                return reply({ ok: true });
            }
            if (action === 'lead') {
                if (typeof d.id !== 'string' || !/^cli_[0-9a-f-]{36}$/i.test(d.id) || !['new', 'contacted', 'qualified', 'won', 'lost'].includes(String(d.stage)) || typeof d.notes !== 'string' || d.notes.length > 5000)
                    return reply({ error: 'Invalid lead update' }, 400);
                await store.adminRpc('clinahir_admin_edit_lead', { p_actor: user.id, p_id: d.id, p_stage: d.stage, p_notes: d.notes });
                return reply({ ok: true });
            }
            if (action === 'content') {
                if (!Number.isInteger(d.version) || Number(d.version) < 0 || typeof d.publish !== 'boolean')
                    return reply({ error: 'Invalid content version' }, 400);
                let content;
                try {
                    content = validateSiteDocument(d.content);
                }
                catch {
                    return reply({ error: 'Check the content fields and HTTPS links.' }, 400);
                }
                const result = await store.adminRpc<{
                    conflict?: boolean;
                }>('clinahir_admin_content', { p_actor: user.id, p_content: content, p_version: d.version, p_publish: d.publish });
                return result.conflict ? reply({ error: 'Someone saved a newer version. Reload before saving.' }, 409) : reply({ content: result });
            }
            if (action === 'replay') {
                if (typeof d.id !== 'string' || !/^cli_[0-9a-f-]{36}$/i.test(d.id) || !['daily_command', 'whatsapp'].includes(String(d.channel)))
                    return reply({ error: 'Invalid delivery' }, 400);
                const result = await store.adminRpc<{
                    conflict?: boolean;
                }>('clinahir_admin_replay', { p_actor: user.id, p_id: d.id, p_channel: d.channel });
                return result.conflict ? reply({ error: 'This delivery cannot be requeued. Review its current status.' }, 409) : reply({ ok: true });
            }
        }
        return reply({ error: 'Not found' }, 404);
    }
    catch (error) {
        if (error instanceof AdminInputError)
            return reply({ error: error.message }, 400);
        // Storage and auth providers can be temporarily unreachable (for example,
        // when local DNS or network access is unavailable). Keep credentials and
        // provider internals out of the response while giving the admin a useful
        // next step.
        if (error instanceof TypeError && /fetch failed/i.test(error.message))
            return reply({ error: 'The admin service cannot reach Supabase right now. Check your internet connection and try again.' }, 503, { 'Retry-After': '10' });
        console.error('clinahir_admin', { action, reason: 'request_failed' });
        return reply({ error: 'The admin service is temporarily unavailable. Please try again shortly.' }, 503, { 'Retry-After': '10' });
    }
}
