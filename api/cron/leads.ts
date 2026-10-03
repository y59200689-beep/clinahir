import { serverConfig } from '../../server/config.js';
import { retryRequest } from '../../server/http.js';
import { RedisLeadStore } from '../../server/redis.js';
async function handle(request: Request): Promise<Response> {
  try { return await retryRequest(request, new RedisLeadStore(process.env.UPSTASH_REDIS_REST_URL ?? '', process.env.UPSTASH_REDIS_REST_TOKEN ?? ''), serverConfig(process.env)); }
  catch { return Response.json({ error: 'Outbox unavailable' }, { status: 503 }); }
}
export const GET = handle;
export const POST = handle;
