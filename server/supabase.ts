import { Conflict, type LeadRecord, type LeadStore, type SyncStatus } from './leads.js';
interface LeadRow {
 external_id: string; company_name: string; email: string; city: string; form_type: LeadRecord['payload']['formType'];
 contact_name: string | null; phone: string | null; message: string | null; landing_page: string;
 utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; submitted_at: string;
 role: string; priority: string; submission_fingerprint: string; daily_command_status: SyncStatus;
 daily_command_attempts: number; daily_command_last_error: string | null; daily_command_synced_at: string | null;
}
function record(row: LeadRow): LeadRecord {
 return { payload: { externalId: row.external_id, companyName: row.company_name, email: row.email, city: row.city,
 formType: row.form_type, landingPage: row.landing_page, submittedAt: new Date(row.submitted_at).toISOString(),
 contactName: row.contact_name ?? undefined, phone: row.phone ?? undefined, message: row.message ?? undefined,
 utmSource: row.utm_source ?? undefined, utmMedium: row.utm_medium ?? undefined, utmCampaign: row.utm_campaign ?? undefined },
 role: row.role, priority: row.priority, fingerprint: row.submission_fingerprint, status: row.daily_command_status,
 attempts: row.daily_command_attempts, lastError: row.daily_command_last_error ?? undefined, syncedAt: row.daily_command_synced_at ?? undefined };
}
export class SupabaseLeadStore implements LeadStore {
 private base: string;
 constructor(url: string, private key: string, private fetcher: typeof fetch = fetch) {
  const parsed = new URL(url);
  if (!key || parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') throw new Error('lead_storage_not_configured');
  this.base = parsed.origin;
 }
 private async request<T>(path: string, body?: object): Promise<T> {
  // Modern sb_secret keys authenticate through apikey; legacy service-role JWTs also use Bearer.
  const headers: Record<string,string> = { apikey: this.key, 'Content-Type': 'application/json' };
  if (!this.key.startsWith('sb_secret_')) headers.Authorization = `Bearer ${this.key}`;
  const response = await this.fetcher(`${this.base}/rest/v1/${path}`, { method: body ? 'POST' : 'GET', headers,
   body: body ? JSON.stringify(body) : undefined, redirect: 'error', signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error('lead_storage_unavailable');
  return await response.json() as T;
 }
 async capture(r: LeadRecord): Promise<LeadRecord> {
  const p = r.payload;
  const saved = record(await this.request<LeadRow>('rpc/clinahir_capture_lead', { p_record: {
   external_id:p.externalId, company_name:p.companyName, contact_name:p.contactName, email:p.email, phone:p.phone,
   city:p.city, message:p.message, role:r.role, priority:r.priority, form_type:p.formType, landing_page:p.landingPage,
   utm_source:p.utmSource, utm_medium:p.utmMedium, utm_campaign:p.utmCampaign, submitted_at:p.submittedAt, submission_fingerprint:r.fingerprint
  } }));
  if (saved.fingerprint !== r.fingerprint) throw new Conflict('submission_reused');
  return saved;
 }
 async claim(id: string, token: string, now: number): Promise<LeadRecord | null> {
  const row = await this.request<LeadRow | null>('rpc/clinahir_claim_lead', {p_id:id,p_token:token,p_now:new Date(now).toISOString()});
  return row ? record(row) : null;
 }
 async finish(id: string, token: string, r: LeadRecord, next: number | null): Promise<void> {
  await this.request<boolean>('rpc/clinahir_finish_lead', {p_id:id,p_token:token,p_status:r.status,p_error:r.lastError ?? null,p_synced_at:r.syncedAt ?? null,p_next:next === null ? null : new Date(next).toISOString()});
 }
 async due(now: number, limit: number): Promise<string[]> {
  const query = new URLSearchParams({select:'external_id',daily_command_status:'eq.pending',daily_command_next_attempt_at:`lte.${new Date(now).toISOString()}`,order:'daily_command_next_attempt_at.asc',limit:String(Math.max(1,Math.min(10,limit)))});
  return (await this.request<{external_id:string}[]>(`clinahir_leads?${query}`)).map(row=>row.external_id);
 }
 async replay(id: string, now: number): Promise<boolean> { return this.request('rpc/clinahir_replay_lead',{p_id:id,p_now:new Date(now).toISOString()}); }
 async allow(identifier: string): Promise<boolean> { return this.request('rpc/clinahir_allow_lead',{p_identifier:identifier}); }
}
