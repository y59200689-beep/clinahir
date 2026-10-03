import { Conflict } from '../../.integration-build/server/leads.js';
export class MemoryStore {
 records = new Map(); queue = new Map(); locks = new Map();
 async capture(record) { const id = record.payload.externalId; const old = this.records.get(id); if (old && old.fingerprint !== record.fingerprint) throw new Conflict(); if (!old) { this.records.set(id, structuredClone(record)); this.queue.set(id, 0); } return structuredClone(old || record); }
 async claim(id, token, now) { const r = this.records.get(id); if (!r || r.status !== 'pending' || (this.queue.get(id) ?? Infinity) > now || this.locks.has(id)) return null; this.locks.set(id, token); r.attempts++; this.queue.set(id, now + 60000); return structuredClone(r); }
 async finish(id, token, r, next) { if (this.locks.get(id) !== token) return; this.records.set(id, structuredClone(r)); this.locks.delete(id); if (next === null) this.queue.delete(id); else this.queue.set(id,next); }
 async due(now, limit) { return [...this.queue].filter(([,due])=>due <= now).slice(0,limit).map(([id])=>id); }
 async replay(id, now) { const r=this.records.get(id); if (!r || !['blocked','exhausted'].includes(r.status)) return false; r.status='pending'; r.attempts=0; this.queue.set(id,now); return true; }
 async allow() { return true; }
}
