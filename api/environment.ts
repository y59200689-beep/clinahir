import { environmentFailure } from '../server/environment.js';
export function GET(request: Request): Response {
  return environmentFailure(process.env, request) ?? Response.json({ environment: process.env.CLINAHIR_ENV === 'staging' ? 'staging' : process.env.VERCEL_ENV === 'production' ? 'production' : 'development', clinicDemo: 'in-memory' }, { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
