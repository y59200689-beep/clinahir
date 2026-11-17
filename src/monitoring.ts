// Strict allowlist: never forward URLs, user content, stack variables, breadcrumbs or request data.
export function redactedClientEvent(event: { event_id?: string; timestamp?: number; level?: string }, environment: 'staging' | 'production' = 'production') {
  return {
    ...(event.event_id && /^[a-f0-9]{32}$/i.test(event.event_id) ? { event_id: event.event_id } : {}),
    ...(typeof event.timestamp === 'number' && Number.isFinite(event.timestamp) ? { timestamp: event.timestamp } : {}),
    environment, type: undefined, platform: 'javascript', level: 'error' as const,
    message: 'Unhandled Clinahir application error',
    fingerprint: ['clinahir-unhandled-client-error'],
  };
}

export async function startMonitoring() {
  // No provider connection unless the owner explicitly configures the public DSN and opt-in switch.
  if (import.meta.env.VITE_SENTRY_ENABLED !== 'true' || !import.meta.env.VITE_SENTRY_DSN) return;
  const sentry = await import('@sentry/react');
  sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_APP_ENV === 'staging' ? 'staging' : 'production',
    defaultIntegrations: false,
    integrations: [sentry.globalHandlersIntegration(), sentry.browserApiErrorsIntegration()],
    dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false, databaseQueryData: false },
    sendClientReports: false,
    beforeSend: event => redactedClientEvent(event, import.meta.env.VITE_APP_ENV === 'staging' ? 'staging' : 'production'),
  });
}

export async function reportRenderFailure() {
  if (import.meta.env.VITE_SENTRY_ENABLED !== 'true' || !import.meta.env.VITE_SENTRY_DSN) return;
  const sentry = await import('@sentry/react');
  sentry.captureException(new Error('Clinahir render failure'));
}
