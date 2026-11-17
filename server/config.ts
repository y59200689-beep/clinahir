import { stagingIssues, productionIssues } from './environment.js';
export function serverConfig(env: Record<string, string | undefined>) {
  if (stagingIssues(env).length || productionIssues(env).length) throw new Error('environment_configuration_invalid');
  const stagingProtectionBypass = env.CLINAHIR_ENV === 'staging'
    ? env.CLINAHIR_STAGING_RECEIVER_ENABLED === 'true' ? env.STAGING_PROTECTION_BYPASS : env.STAGING_CRM_PROTECTION_BYPASS
    : undefined;
  return { DAILY_COMMAND_URL: env.DAILY_COMMAND_URL, CLINAHIR_INTEGRATION_SECRET: env.CLINAHIR_INTEGRATION_SECRET, CRON_SECRET: env.CRON_SECRET, ...(stagingProtectionBypass?{stagingProtectionBypass}:{}) };
}
