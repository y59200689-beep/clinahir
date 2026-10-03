import type { Attribution, LeadInput } from './types.js';
const attributionKey = 'clinahir:lead-attribution:v1';
const submissionKey = 'clinahir:lead-submission:v1';
let memoryAttribution: Attribution | undefined;
let memorySubmission: string | undefined;
export function captureAttribution(): Attribution {
  if (memoryAttribution) return memoryAttribution;
  let saved: Attribution | undefined;
  try { saved = JSON.parse(sessionStorage.getItem(attributionKey) || 'null') as Attribution | undefined; } catch { /* Storage may be disabled. */ }
  const params = new URLSearchParams(window.location.search);
  const campaign = ['utm_source', 'utm_medium', 'utm_campaign'].some(key => params.has(key));
  const current: Attribution = { landingPage: window.location.pathname,
    utmSource: params.get('utm_source')?.slice(0, 200) || undefined,
    utmMedium: params.get('utm_medium')?.slice(0, 200) || undefined,
    utmCampaign: params.get('utm_campaign')?.slice(0, 200) || undefined };
  memoryAttribution = campaign || !saved ? current : saved;
  try { sessionStorage.setItem(attributionKey, JSON.stringify(memoryAttribution)); } catch { /* In-memory fallback. */ }
  return memoryAttribution;
}
export function submissionId(): string {
  if (memorySubmission) return memorySubmission;
  try { memorySubmission = sessionStorage.getItem(submissionKey) || undefined; } catch { /* In-memory fallback. */ }
  if (!memorySubmission || !/^[0-9a-f-]{36}$/i.test(memorySubmission)) memorySubmission = crypto.randomUUID();
  try { sessionStorage.setItem(submissionKey, memorySubmission); } catch { /* In-memory fallback. */ }
  return memorySubmission;
}
export async function submitLead(form: FormData, fetcher: typeof fetch = fetch): Promise<string> {
  const value = (key: string) => String(form.get(key) ?? '').trim();
  const input: LeadInput = { ...captureAttribution(), submissionId: submissionId(), companyName: value('center_name'), city: value('city'), email: value('email'), phone: value('phone') || undefined, role: value('role'), priority: value('priority'), formType: 'demo' };
  const response = await fetcher('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(input), signal: AbortSignal.timeout(30_000) });
  const result = await response.json() as { ok?: boolean; externalId?: string };
  if (response.status === 409) {
    memorySubmission = undefined;
    try { sessionStorage.removeItem(submissionKey); } catch { /* A changed request can start a new submission on the next explicit attempt. */ }
  }
  if (!response.ok || result.ok !== true || !result.externalId) throw new Error('lead_submission_failed');
  // Keep the accepted identifier available for a future meeting association.
  try { sessionStorage.setItem('clinahir:last-lead-id', result.externalId); sessionStorage.removeItem(submissionKey); } catch { /* No personal data is stored. */ }
  memorySubmission = undefined;
  return result.externalId;
}
