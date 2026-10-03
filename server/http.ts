import { createHash, timingSafeEqual } from 'node:crypto';
import { captureLead, Conflict, InvalidLead, retryDue, validateLead, type IntegrationConfig, type LeadStore } from './leads.js';
export interface ServerConfig extends IntegrationConfig { CRON_SECRET?: string }
const json = (body: object, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function leadRequest(request: Request, store: LeadStore, config: ServerConfig, fetcher: typeof fetch = fetch): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return json({ error: 'Request not allowed' }, 403);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return json({ error: 'JSON required' }, 415);
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new InvalidLead('body');
    let raw = ''; let size = 0; const decoder = new TextDecoder();
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > 16_384) { await reader.cancel(); return json({ error: 'Request too large' }, 413); } raw += decoder.decode(value, { stream: true }); }
    raw += decoder.decode();
    let body: unknown;
    try { body = JSON.parse(raw); } catch { throw new InvalidLead('body'); }
    const input = validateLead(body);
    const limitKey = createHash('sha256').update(input.email).digest('hex');
    if (!await store.allow(limitKey)) return json({ error: 'Please try again later' }, 429);
    const externalId = await captureLead(input, store, config, fetcher);
    return json({ ok: true, externalId }, 201);
  } catch (e) {
    if (e instanceof InvalidLead) return json({ error: 'Please check your form details' }, 400);
    if (e instanceof Conflict) return json({ error: 'Submission identifier already used' }, 409);
    console.error('clinahir_lead_capture', { reason: 'storage_unavailable' });
    return json({ error: 'Your request could not be saved. Please try again.' }, 503);
  }
}
export async function retryRequest(request: Request, store: LeadStore, config: ServerConfig, fetcher: typeof fetch = fetch): Promise<Response> {
  const expected = `Bearer ${config.CRON_SECRET ?? ''}`;
  const auth = request.headers.get('authorization') ?? '';
  if (!config.CRON_SECRET || Buffer.byteLength(auth) !== Buffer.byteLength(expected) || !timingSafeEqual(Buffer.from(auth), Buffer.from(expected))) return json({ error: 'Unauthorized' }, 401);
  if (!['GET', 'POST'].includes(request.method)) return json({ error: 'Method not allowed' }, 405);
  try {
    if (request.method === 'POST') {
      const id = new URL(request.url).searchParams.get('externalId');
      if (!id || !/^cli_[0-9a-f-]{36}$/.test(id)) return json({ error: 'Valid externalId required' }, 400);
      if (!await store.replay(id, Date.now())) return json({ error: 'Lead not eligible for replay' }, 409);
    }
    return json({ processed: await retryDue(store, config, fetcher) });
  } catch { console.error('clinahir_outbox', { reason: 'processing_failed' }); return json({ error: 'Outbox unavailable' }, 503); }
}
