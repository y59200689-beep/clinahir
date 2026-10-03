export function serverConfig(env: Record<string, string | undefined>) {
  return { DAILY_COMMAND_URL: env.DAILY_COMMAND_URL, CLINAHIR_INTEGRATION_SECRET: env.CLINAHIR_INTEGRATION_SECRET, CRON_SECRET: env.CRON_SECRET };
}
