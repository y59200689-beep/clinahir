export function observeResponse(area: 'admin' | 'leads' | 'analytics' | 'content', response: Response): Response {
  if (response.status >= 400) {
    // Deliberately exclude request URLs, bodies, cookies, account identities and exception messages.
    console.warn('clinahir_api_failure', { area, status: response.status, category: response.status >= 500 ? 'service_failure' : response.status === 429 ? 'rate_limited' : response.status === 401 || response.status === 403 ? 'access_denied' : 'invalid_request' });
  }
  return response;
}
