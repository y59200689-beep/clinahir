import { Conflict, type LeadRecord, type LeadStore } from './leads.js';
const queue = 'clinahir:leads:due';
const key = (id: string) => `clinahir:lead:${id}`;
export class RedisLeadStore implements LeadStore {
  constructor(private url: string, private token: string, private fetcher: typeof fetch = fetch) {
    if (!url || !token || new URL(url).protocol !== 'https:') throw new Error('lead_storage_not_configured');
  }
  private async command<T>(args: (string | number)[]): Promise<T> {
    const response = await this.fetcher(this.url, { method: 'POST', headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args), signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('lead_storage_unavailable');
    const body = await response.json() as { result: T; error?: string };
    if (body.error) throw new Error('lead_storage_command_failed');
    return body.result;
  }
  async capture(record: LeadRecord): Promise<LeadRecord> {
    const result = await this.command<string>(['EVAL', `local old = redis.call('GET', KEYS[1])
if old then return old end
redis.call('SET', KEYS[1], ARGV[1])
redis.call('ZADD', KEYS[2], ARGV[2], ARGV[3])
return ARGV[1]`, 2, key(record.payload.externalId), queue, JSON.stringify(record), Date.now(), record.payload.externalId]);
    const saved = JSON.parse(result) as LeadRecord;
    if (saved.fingerprint !== record.fingerprint) throw new Conflict('submission_reused');
    return saved;
  }
  async claim(id: string, token: string, now: number): Promise<LeadRecord | null> {
    const raw = await this.command<string | null>(['EVAL', `local raw = redis.call('GET', KEYS[1])
if not raw then return nil end
local r = cjson.decode(raw)
if r.status ~= 'pending' then return nil end
if r.attempts >= 8 then
  r.status = 'exhausted'; r.lastError = 'attempt_limit_reached'
  redis.call('SET', KEYS[1], cjson.encode(r)); redis.call('ZREM', KEYS[2], ARGV[1]); return nil
end
local due = redis.call('ZSCORE', KEYS[2], ARGV[1])
if not due or tonumber(due) > tonumber(ARGV[3]) then return nil end
if not redis.call('SET', KEYS[3], ARGV[2], 'NX', 'PX', 60000) then return nil end
r.attempts = r.attempts + 1
local encoded = cjson.encode(r)
redis.call('SET', KEYS[1], encoded)
redis.call('ZADD', KEYS[2], tonumber(ARGV[3]) + 60000, ARGV[1])
return encoded`, 3, key(id), queue, `${key(id)}:lock`, id, token, now]);
    return raw ? JSON.parse(raw) as LeadRecord : null;
  }
  async finish(id: string, token: string, record: LeadRecord, next: number | null): Promise<void> {
    await this.command(['EVAL', `if redis.call('GET', KEYS[3]) ~= ARGV[2] then return 0 end
redis.call('SET', KEYS[1], ARGV[3])
if ARGV[4] == '' then redis.call('ZREM', KEYS[2], ARGV[1]) else redis.call('ZADD', KEYS[2], ARGV[4], ARGV[1]) end
redis.call('DEL', KEYS[3])
return 1`, 3, key(id), queue, `${key(id)}:lock`, id, token, JSON.stringify(record), next ?? '']);
  }
  async due(now: number, limit: number): Promise<string[]> { return this.command(['ZRANGEBYSCORE', queue, '-inf', now, 'LIMIT', 0, limit]); }
  async replay(id: string, now: number): Promise<boolean> {
    const result = await this.command<number>(['EVAL', `local raw = redis.call('GET', KEYS[1])
if not raw or redis.call('EXISTS', KEYS[3]) == 1 then return 0 end
local r = cjson.decode(raw)
if r.status ~= 'blocked' and r.status ~= 'exhausted' then return 0 end
r.status = 'pending'; r.attempts = 0; r.lastError = nil
redis.call('SET', KEYS[1], cjson.encode(r)); redis.call('ZADD', KEYS[2], ARGV[2], ARGV[1]); return 1`, 3, key(id), queue, `${key(id)}:lock`, id, now]);
    return result === 1;
  }
  async allow(identifier: string): Promise<boolean> {
    const n = await this.command<number>(['EVAL', `local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], 600) end; return n`, 1, `clinahir:limit:${identifier}`]);
    return n <= 10;
  }
}
