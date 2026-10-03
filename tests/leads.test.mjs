import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { captureLead, deliver, makeRecord, validateLead, Conflict } from '../.integration-build/server/leads.js';
import { leadRequest, retryRequest } from '../.integration-build/server/http.js';
import { RedisLeadStore } from '../.integration-build/server/redis.js';
import { captureAttribution, submitLead } from '../.integration-build/src/leads/client.js';
import { MemoryStore } from './fixtures/memory-store.mjs';

const input = { submissionId:'12345678-1234-4234-8234-123456789abc', companyName:' Centre Atlas ', city:' Casablanca ', email:' CONTACT@EXAMPLE.COM ', phone:' 0612345678 ', role:'Owner / director', priority:'More appointment requests', formType:'demo', landingPage:'/', utmSource:'google', utmMedium:'cpc', utmCampaign:'radiology' };
const config = { DAILY_COMMAND_URL:'https://command.example.com', CLINAHIR_INTEGRATION_SECRET:'test-private-secret', CRON_SECRET:'cron-test-secret' };
const req = (body = input) => new Request('https://clinahir.example.com/api/leads', { method:'POST', headers:{ 'Content-Type':'application/json', Origin:'https://clinahir.example.com' }, body:JSON.stringify(body) });
test('normalizes real form fields and forwards payload and server authorization', async()=> {
 const store=new MemoryStore(); let sent;
 const result=await leadRequest(req(),store,config,async(url,init)=> { sent={url:String(url),init}; return new Response('{}',{status:201}); });
 assert.equal(result.status,201); const {externalId}=await result.json(); const payload=JSON.parse(sent.init.body);
 assert.equal(sent.url,'https://command.example.com/api/integrations/clinahir/leads'); assert.equal(sent.init.headers.Authorization,'Bearer test-private-secret');
 assert.equal(payload.externalId,externalId); assert.equal(payload.companyName,'Centre Atlas'); assert.equal(payload.email,'contact@example.com'); assert.equal(payload.phone,'0612345678'); assert.equal(payload.formType,'demo'); assert.equal(payload.utmCampaign,'radiology'); assert.equal(payload.landingPage,'/'); assert.equal(payload.message,'Role: Owner / director\nPriority: More appointment requests'); assert(!('contactName' in payload)); assert(!('role' in payload)); assert(!('submissionId' in payload)); assert(!Number.isNaN(Date.parse(payload.submittedAt)));
 assert.equal(store.records.get(externalId).status,'synced'); assert.equal(store.records.get(externalId).attempts,1); assert.equal(store.queue.size,0);
});
test('temporary failure retains accepted lead and retry reuses ID and original timestamp',async()=> {
 const store=new MemoryStore(); const seen=[];
 const response=await leadRequest(req(),store,config,async(_,init)=> {seen.push(JSON.parse(init.body));return new Response('',{status:503});});
 assert.equal(response.status,201); const {externalId}=await response.json(); assert.equal(store.records.get(externalId).status,'pending'); assert(store.queue.has(externalId));
 await deliver(store,externalId,config,async(_,init)=> {seen.push(JSON.parse(init.body));return new Response('{}');},store.queue.get(externalId));
 assert.deepEqual(seen[0],seen[1]); assert.equal(store.records.get(externalId).status,'synced'); assert.equal(store.records.get(externalId).attempts,2);
});
test('network failure and timeouts remain eligible without browser retry loop',async()=> {
 const store=new MemoryStore();const response=await leadRequest(req(),store,config,async()=>{throw new Error('timeout');});assert.equal(response.status,201); assert.equal([...store.records.values()][0].lastError,'network_or_timeout');
});
test('401 and 400 block retries; authenticated manual replay keeps same ID',async()=> {
 for(const status of [400,401]) { const store=new MemoryStore();const response=await leadRequest(req(),store,config,async()=>new Response('',{status}));const {externalId}=await response.json(); assert.equal(store.records.get(externalId).status,'blocked');assert.equal(store.queue.size,0);
 const denied=await retryRequest(new Request('https://clinahir.example.com/api/cron/leads'),store,config);assert.equal(denied.status,401);
 const replay=await retryRequest(new Request(`https://clinahir.example.com/api/cron/leads?externalId=${externalId}`,{method:'POST',headers:{Authorization:'Bearer cron-test-secret'}}),store,config,async()=>new Response('{}')); assert.equal(replay.status,200);assert.equal(store.records.get(externalId).status,'synced'); }
});
test('duplicate submits are idempotent and changed data cannot replace captured lead',async()=> {
 const store=new MemoryStore();let calls=0;const fetcher=async()=>{calls++;return new Response('{}');}; const a=await captureLead(input,store,config,fetcher);const b=await captureLead(input,store,config,fetcher);assert.equal(a,b);assert.equal(calls,1);assert.equal(store.records.size,1);
 const conflict=await leadRequest(req({...input,companyName:'Other center'}),store,config,fetcher);assert.equal(conflict.status,409);
});
test('invalid form, cross-origin, oversized and invalid content type rejected',async()=> {
 const store=new MemoryStore();for(const patch of [{email:'bad'},{role:'fake'},{companyName:''},{submissionId:'bad'},{formType:'newsletter'},{landingPage:'https://bad.example'}]) assert.equal((await leadRequest(req({...input,...patch}),store,config)).status,400);
 assert.equal(store.records.size,0);
 assert.equal((await leadRequest(new Request('https://clinahir.example.com/api/leads',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:JSON.stringify(input)}),store,config)).status,403);
 assert.equal((await leadRequest(new Request('https://clinahir.example.com/api/leads',{method:'POST',body:'x'}),store,config)).status,415);
 assert.equal((await leadRequest(req({...input,message:'x'.repeat(17000)}),store,config)).status,413);
});
test('storage capture failure returns normal error; post-capture status failure stays success',async()=> {
 const store=new MemoryStore();store.capture=async()=>{throw new Error('offline');};assert.equal((await leadRequest(req(),store,config)).status,503);
 const captured=new MemoryStore();captured.finish=async()=>{throw new Error('offline');};assert.equal((await leadRequest(req(),captured,config,async()=>new Response('{}'))).status,201);assert.equal(captured.records.size,1);assert.equal(captured.queue.size,1);
});
test('eight temporary attempts exhaust automatic retries and retain lead',async()=> {
 const store=new MemoryStore();const record=makeRecord(validateLead(input));await store.capture(record);
 for(let n=0;n<8;n++) await deliver(store,record.payload.externalId,config,async()=>new Response('',{status:500}),store.queue.get(record.payload.externalId));
 assert.equal(store.records.get(record.payload.externalId).status,'exhausted');assert.equal(store.queue.size,0);assert.equal(store.records.size,1);
});
test('storage uses atomic EVAL capture, lease claim and token-checked completion',async()=> {
 const commands=[]; const record=makeRecord(validateLead(input));
 const store=new RedisLeadStore('https://redis.example.com','storage-secret',async(_,init)=>{const args=JSON.parse(init.body);commands.push(args);return Response.json({result: commands.length===1?JSON.stringify(record):null});});
 await store.capture(record); await store.claim(record.payload.externalId,'token',0);await store.finish(record.payload.externalId,'token',record,null);
 assert.equal(commands[0][0],'EVAL');assert(commands[0][1].includes("redis.call('ZADD'"));assert(commands[1][1].includes("'NX', 'PX', 60000"));assert(commands[2][1].includes("~= ARGV[2]"));
});
test('browser client uses same-origin API, preserves attribution and ID on error, clears form ID only on success',async()=> {
 const data=new Map();globalThis.sessionStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};globalThis.window={location:{pathname:'/',search:'?utm_source=google&utm_medium=cpc&utm_campaign=radiology'}};
 assert.equal(captureAttribution().utmSource,'google');window.location={pathname:'/about',search:''};assert.equal(captureAttribution().landingPage,'/');
 const form=new FormData();for(const [k,v] of Object.entries({center_name:'Atlas',city:'Casablanca',email:'contact@example.com',role:input.role,priority:input.priority}))form.set(k,v);
 let first;await assert.rejects(()=>submitLead(form,async(url,init)=>{assert.equal(url,'/api/leads');first=JSON.parse(init.body);assert(!JSON.stringify(init).includes(config.CLINAHIR_INTEGRATION_SECRET));return Response.json({error:'offline'},{status:503});}));
 const id=await submitLead(form,async(url,init)=>{const body=JSON.parse(init.body);assert.equal(body.submissionId,first.submissionId);assert.equal(body.utmCampaign,'radiology');return Response.json({ok:true,externalId:`cli_${body.submissionId}`},{status:201});});assert.equal(data.get('clinahir:last-lead-id'),id);assert(!data.has('clinahir:lead-submission:v1'));
});
test('existing form delegates submission and preserves success/error states',()=> {const source=readFileSync('src/LandingSections.tsx','utf8');assert(source.includes('await submitLead(body)'));assert(source.includes("setStatus('success')"));assert(source.includes("catch { setStatus('error'); }"));assert(source.includes("disabled={status === 'sending'}"));assert(!source.includes('VITE_DEMO_FORM_ENDPOINT'));});
test('private integration secret absent from client source and built assets',()=> {
 const source=readFileSync('src/leads/client.ts','utf8');assert(!source.includes('CLINAHIR_INTEGRATION_SECRET'));
 for(const f of readdirSync('dist/client/assets')) if(f.endsWith('.js')) {const bundle=readFileSync(`dist/client/assets/${f}`,'utf8');assert(!bundle.includes('CLINAHIR_INTEGRATION_SECRET'));assert(!bundle.includes('integration-build-secret-canary'));assert(!bundle.includes('UPSTASH_REDIS_REST_TOKEN'));}
});
