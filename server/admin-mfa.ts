export interface MfaFactor { id: string; factor_type: string; status: string }
export interface MfaUser { id: string; email?: string; factors?: MfaFactor[] }
export function verifiedTotp(user: MfaUser) { return user.factors?.find(f => f.factor_type === 'totp' && f.status === 'verified'); }
// Read only AFTER the provider has authenticated this exact bearer through /user.
export function assuranceLevel(token: string): string | undefined {
  try { return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).aal; } catch { return undefined; }
}
export function mfaStatus(user: MfaUser, token: string, enforced: boolean) {
  const factor = verifiedTotp(user);
  return { required: (enforced || Boolean(factor)) && (!factor || assuranceLevel(token) !== 'aal2'), enrolled: Boolean(factor), ...(factor ? { factorId: factor.id } : {}) };
}
