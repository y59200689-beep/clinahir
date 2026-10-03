import { serverConfig } from '../server/config.js';
import { leadRequest } from '../server/http.js';
import { RedisLeadStore } from '../server/redis.js';
export async function POST(request: Request): Promise<Response> {
  try {
    return await leadRequest(request, new RedisLeadStore(process.env.UPSTASH_REDIS_REST_URL ?? '', process.env.UPSTASH_REDIS_REST_TOKEN ?? ''), serverConfig(process.env));
  } catch { console.error('clinahir_lead_capture', { reason: 'storage_not_configured' }); return Response.json({ error: 'Your request could not be saved. Please try again.' }, { status: 503 }); }
}
