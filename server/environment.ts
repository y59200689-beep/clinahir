type Env = Record<string, string | undefined>;
const projectRef = /^[a-z]{20}$/;
export function httpsOrigin(value: string | undefined): string | undefined {
  try {
    const url = new URL(value ?? '');
    if (url.protocol === 'https:' && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash) return url.origin;
  } catch { /* Configuration errors must never include supplied values. */ }
}

// Staging is opt-in and fail-closed. This validates configuration, not hosting protection or account ownership.
export function stagingIssues(env: Env): string[] {
  const issues: string[] = [];
  if (env.VERCEL_ENV === 'preview' && env.CLINAHIR_ENV !== 'staging') issues.push('preview_requires_staging_identity');
  if (env.CLINAHIR_ENV !== 'staging') return issues;
  if (env.VERCEL_ENV === 'production') issues.push('staging_cannot_target_production');
  const expected = env.CLINAHIR_STAGING_SUPABASE_REF ?? '', production = env.CLINAHIR_PRODUCTION_SUPABASE_REF ?? '';
  if (!projectRef.test(expected) || !projectRef.test(production) || expected === production) issues.push('distinct_project_references_required');
  if (httpsOrigin(env.SUPABASE_URL) !== `https://${expected}.supabase.co`) issues.push('staging_database_identity_mismatch');
  if (!env.SUPABASE_SERVICE_ROLE_KEY || !env.CLINAHIR_ADMIN_EMAIL || !env.CLINAHIR_ADMIN_USER_ID || !env.CRON_SECRET) issues.push('staging_server_credentials_required');
  if (env.WHATSAPP_ENABLED !== 'false') issues.push('staging_whatsapp_must_be_disabled');
  const receiver = httpsOrigin(env.CLINAHIR_STAGING_CRM_ORIGIN);
  if (!receiver || receiver !== httpsOrigin(env.DAILY_COMMAND_URL) || !env.CLINAHIR_INTEGRATION_SECRET) issues.push('controlled_crm_receiver_required');
  const productionCrm = httpsOrigin(env.CLINAHIR_PRODUCTION_CRM_ORIGIN);
  const noProductionCrm = env.CLINAHIR_PRODUCTION_CRM_CONFIGURED === 'false' && !env.CLINAHIR_PRODUCTION_CRM_ORIGIN;
  if ((!productionCrm && !noProductionCrm) || (productionCrm && receiver === productionCrm)) issues.push('distinct_crm_origins_required');
  if (env.CLINAHIR_PRODUCTION_CRM_CONFIGURED === 'false' && env.CLINAHIR_PRODUCTION_CRM_ORIGIN) issues.push('contradictory_production_crm_configuration');
  if (!httpsOrigin(env.CLINAHIR_STAGING_ORIGIN)) issues.push('staging_site_origin_required');
  return issues;
}

export function environmentFailure(env: Env, request?: Request): Response | undefined {
  const issues = [...stagingIssues(env), ...productionIssues(env)];
  if (env.CLINAHIR_ENV === 'staging' && request && new URL(request.url).origin !== httpsOrigin(env.CLINAHIR_STAGING_ORIGIN)) issues.push('staging_request_origin_mismatch');
  if (issues.length) return Response.json({ error: 'Environment configuration requires review.' }, { status: 503, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

// Production identities are explicit; a Preview must never borrow production settings.
export function productionIssues(env: Env): string[] {
  const issues: string[] = [];
  if (env.VERCEL_ENV === 'production' && env.CLINAHIR_ENV !== 'production') issues.push('production_identity_required');
  if (env.CLINAHIR_ENV !== 'production') return issues;
  if (env.VERCEL_ENV && env.VERCEL_ENV !== 'production') issues.push('production_cannot_target_preview');
  const expected = env.CLINAHIR_PRODUCTION_SUPABASE_REF ?? '';
  if (!projectRef.test(expected) || httpsOrigin(env.SUPABASE_URL) !== `https://${expected}.supabase.co`) issues.push('production_database_identity_mismatch');
  if (expected === env.CLINAHIR_STAGING_SUPABASE_REF) issues.push('production_database_must_be_separate');
  if (!['true', 'false'].includes(env.CLINAHIR_ADMIN_MFA_REQUIRED ?? '')) issues.push('explicit_production_mfa_choice_required');
  if (env.WHATSAPP_ENABLED !== 'false') issues.push('production_whatsapp_activation_not_approved');
  if (!env.SUPABASE_SERVICE_ROLE_KEY || !env.CLINAHIR_ADMIN_EMAIL || !env.CLINAHIR_ADMIN_USER_ID || !env.CRON_SECRET || !env.CLINAHIR_INTEGRATION_SECRET) issues.push('production_server_credentials_required');
  const receiver = httpsOrigin(env.CLINAHIR_PRODUCTION_CRM_ORIGIN);
  if (!receiver || receiver !== httpsOrigin(env.DAILY_COMMAND_URL) || receiver === httpsOrigin(env.CLINAHIR_STAGING_CRM_ORIGIN)) issues.push('production_crm_identity_mismatch');
  if (!httpsOrigin(env.CLINAHIR_PRODUCTION_ORIGIN)) issues.push('production_site_origin_required');
  if (env.STAGING_PROTECTION_BYPASS || env.STAGING_CRM_PROTECTION_BYPASS || env.CLINAHIR_STAGING_RECEIVER_ENABLED === 'true') issues.push('staging_credentials_forbidden_in_production');
  return issues;
}
