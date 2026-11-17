import { createHmac, timingSafeEqual } from 'node:crypto';
const name = 'clinahir_owner_setup';
export function setupCookie(request: Request, token: string, key: string, clear = false) {
  const expires = clear ? 0 : Math.floor(Date.now() / 1000) + 600;
  const signature = createHmac('sha256', key).update(`${expires}:${token}`).digest('hex');
  return `${name}=${clear ? '' : `${expires}.${signature}`}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${clear ? 0 : 600}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
}
export function validSetup(request: Request, token: string, key: string) {
  const raw = request.headers.get('cookie')?.split(';').map(c => c.trim()).find(c => c.startsWith(name + '='))?.slice(name.length + 1) ?? '';
  const [expires, signature] = raw.split('.');
  if (!/^\d{10}$/.test(expires ?? '') || !/^[a-f0-9]{64}$/.test(signature ?? '') || Number(expires) < Date.now() / 1000 || Number(expires) > Date.now() / 1000 + 660) return false;
  const expected = createHmac('sha256', key).update(`${expires}:${token}`).digest('hex');
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
// Provider identity must be verified before using these claims.
export function freshEmailSession(token: string) {
  try { const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()); return typeof claims.iat === 'number' && claims.iat >= Date.now() / 1000 - 600 && claims.iat <= Date.now() / 1000 + 60 && Array.isArray(claims.amr) && claims.amr.some((a: { method?: string }) => a.method === 'otp'); } catch { return false; }
}
