import { createHash, randomUUID } from 'node:crypto';
import type { LeadInput, LeadPayload } from '../src/leads/types.js';
export type SyncStatus = 'pending' | 'synced' | 'blocked' | 'exhausted';
export interface LeadRecord { payload: LeadPayload; role: string; priority: string; fingerprint: string; status: SyncStatus; attempts: number; lastError?: string; syncedAt?: string }
export interface LeadStore {
  capture(record: LeadRecord): Promise<LeadRecord>;
  claim(id: string, token: string, now: number): Promise<LeadRecord | null>;
  finish(id: string, token: string, record: LeadRecord, next: number | null): Promise<void>;
  due(now: number, limit: number): Promise<string[]>;
  replay(id: string, now: number): Promise<boolean>;
  allow(key: string): Promise<boolean>;
}
export class InvalidLead extends Error {}
export class Conflict extends Error {}
const roles = ['Owner / director', 'Center manager', 'Operations / administration', 'Other decision maker', 'Propriétaire / direction', 'Responsable du centre', 'Opérations / administration', 'Autre décideur'];
const priorities = ['More appointment requests', 'Easier booking and follow-up', 'A stronger website and local visibility', 'A connected end-to-end workflow', 'Recevoir plus de demandes de RDV', 'Simplifier la prise de RDV et le suivi', 'Améliorer le site et la visibilité locale', 'Relier tout le parcours patient'];
function field(data: Record<string, unknown>, key: string, max: number, required = false): string | undefined {
  const value = data[key];
  if (value === undefined || value === null || value === '') { if (required) throw new InvalidLead(key); return undefined; }
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new InvalidLead(key);
  const clean = value.trim();
  if (!clean && required) throw new InvalidLead(key);
  return clean || undefined;
}
export function validateLead(body: unknown): LeadInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new InvalidLead('body');
  const d = body as Record<string, unknown>;
  const submissionId = field(d, 'submissionId', 36, true)!;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) throw new InvalidLead('submissionId');
  const email = field(d, 'email', 254, true)!.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new InvalidLead('email');
  const role = field(d, 'role', 100, true)!;
  const priority = field(d, 'priority', 200, true)!;
  if (!roles.includes(role) || !priorities.includes(priority)) throw new InvalidLead('selection');
  const formType = field(d, 'formType', 20, true);
  // The only current business form is the demo inquiry. Add other types with their real forms.
  if (formType !== 'demo') throw new InvalidLead('formType');
  const landingPage = field(d, 'landingPage', 500, true)!;
  if (!landingPage.startsWith('/') || landingPage.startsWith('//') || /[?#\r\n]/.test(landingPage)) throw new InvalidLead('landingPage');
  return { submissionId: submissionId.toLowerCase(), companyName: field(d, 'companyName', 200, true)!, city: field(d, 'city', 120, true)!, email, role, priority, formType, landingPage,
    phone: field(d, 'phone', 40, true)!, contactName: field(d, 'contactName', 200), message: field(d, 'message', 3000),
    utmSource: field(d, 'utmSource', 200), utmMedium: field(d, 'utmMedium', 200), utmCampaign: field(d, 'utmCampaign', 200) };
}
export function makeRecord(input: LeadInput, now = new Date()): LeadRecord {
  const { submissionId, role, priority, ...values } = input;
  return { payload: { ...values, message: values.message ?? `Role: ${role}\nPriority: ${priority}`, externalId: `cli_${submissionId}`, submittedAt: now.toISOString() }, role, priority,
    fingerprint: createHash('sha256').update(JSON.stringify(input)).digest('hex'), status: 'pending', attempts: 0 };
}
export interface IntegrationConfig { DAILY_COMMAND_URL?: string; CLINAHIR_INTEGRATION_SECRET?: string }
export async function deliver(store: LeadStore, id: string, config: IntegrationConfig, fetcher: typeof fetch = fetch, now = Date.now()): Promise<void> {
  const token = randomUUID();
  const record = await store.claim(id, token, now);
  if (!record) return;
  let error: string | undefined;
  let retryable = false;
  try {
    if (!config.DAILY_COMMAND_URL || !config.CLINAHIR_INTEGRATION_SECRET) throw new Error('configuration_missing');
    const url = new URL(config.DAILY_COMMAND_URL);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('configuration_invalid');
    url.pathname = '/api/integrations/clinahir/leads';
    const response = await fetcher(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.CLINAHIR_INTEGRATION_SECRET}` }, body: JSON.stringify(record.payload), redirect: 'error', signal: AbortSignal.timeout(5000) });
    if (response.ok) { record.status = 'synced'; record.syncedAt = new Date(now).toISOString(); delete record.lastError; }
    else { error = `http_${response.status}`; retryable = response.status >= 500 || response.status === 429 || response.status === 408; }
  } catch (e) {
    error = e instanceof Error && e.message.startsWith('configuration_') ? e.message : 'network_or_timeout';
    retryable = error === 'network_or_timeout';
  }
  let next: number | null = null;
  if (error) {
    record.lastError = error;
    record.status = retryable ? (record.attempts >= 8 ? 'exhausted' : 'pending') : 'blocked';
    if (record.status === 'pending') next = now + Math.min(60_000 * 5 ** (record.attempts - 1), 86_400_000);
    console.error('clinahir_lead_sync', { externalId: id, status: record.status, attempts: record.attempts, reason: error });
  }
  await store.finish(id, token, record, next);
}
export async function retryDue(store: LeadStore, config: IntegrationConfig, fetcher: typeof fetch = fetch): Promise<number> {
  const began = Date.now();
  const ids = await store.due(began, 10);
  let processed = 0;
  for (const id of ids) {
    // Leave enough time for one bounded claim/delivery/completion within the 60s function limit.
    if (Date.now() - began >= 30_000) break;
    await deliver(store, id, config, fetcher);
    processed++;
  }
  return processed;
}
export async function captureLead(body: unknown, store: LeadStore, config: IntegrationConfig, fetcher: typeof fetch = fetch): Promise<string> {
  const input = validateLead(body);
  const saved = await store.capture(makeRecord(input));
  // Never turn a downstream failure (including status-write failure) into visitor failure after capture.
  try { await deliver(store, saved.payload.externalId, config, fetcher); }
  catch { console.error('clinahir_lead_sync', { externalId: saved.payload.externalId, reason: 'outbox_processing_failed' }); }
  return saved.payload.externalId;
}
