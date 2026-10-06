import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { captureLead, deliver, makeRecord, validateLead, Conflict } from '../.integration-build/server/leads.js';
import { leadRequest, retryRequest } from '../.integration-build/server/http.js';
import { SupabaseLeadStore } from '../.integration-build/server/supabase.js';
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
 const store=new MemoryStore();for(const patch of [{phone:''},{phone:'   '},{phone:null},{phone:undefined},{email:'bad'},{role:'fake'},{companyName:''},{submissionId:'bad'},{formType:'newsletter'},{landingPage:'https://bad.example'}]) assert.equal((await leadRequest(req({...input,...patch}),store,config)).status,400);
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
test('Supabase maps real fields, uses server key, RPC leases and original duplicate ID',async()=> {
 const calls=[];const r=makeRecord(validateLead(input));
 const row={external_id:r.payload.externalId,company_name:r.payload.companyName,email:r.payload.email,city:r.payload.city,form_type:'demo',landing_page:'/',submitted_at:r.payload.submittedAt,role:r.role,priority:r.priority,submission_fingerprint:r.fingerprint,daily_command_status:'pending',daily_command_attempts:0};
 const store=new SupabaseLeadStore('https://project.supabase.co','sb_secret_test',async(url,init)=> {
  assert.equal(init.headers.apikey,'sb_secret_test');assert(!init.headers.Authorization);
  const body=init.body?JSON.parse(init.body):undefined;calls.push({url,body});
  if(url.includes('capture'))return Response.json(row);
  if(url.includes('claim'))return Response.json({...row,daily_command_attempts:1});
  if(url.includes('clinahir_leads?'))return Response.json([{external_id:row.external_id}]);
  return Response.json(true);
 });
 assert.equal((await store.capture(r)).payload.externalId,r.payload.externalId);
 assert.equal((await store.capture(r)).payload.submittedAt,r.payload.submittedAt);
 assert.equal(calls[0].body.p_record.utm_campaign,'radiology');
 assert.equal((await store.claim(row.external_id,'token',0)).attempts,1);
 await store.finish(row.external_id,'token',{...r,status:'synced'},null);
 assert.equal(calls[3].body.p_token,'token');assert.equal(calls[3].body.p_next,null);
 assert.deepEqual(await store.due(0,10),[row.external_id]);assert(await store.replay(row.external_id,0));assert(await store.allow('hash'));
 await assert.rejects(()=>store.capture({...r,fingerprint:'different'}),Conflict);
 const legacy=new SupabaseLeadStore('https://project.supabase.co','legacy-jwt',async(_,init)=>{assert.equal(init.headers.Authorization,'Bearer legacy-jwt');return Response.json(true);});assert(await legacy.allow('hash'));
 const failed=new SupabaseLeadStore('https://project.supabase.co','sb_secret_test',async()=>new Response('private detail',{status:503}));
 await assert.rejects(()=>failed.capture(r),/lead_storage_unavailable/);
});
test('Supabase SQL restricts RPCs and prevents lease races',()=> {
 const sql=readFileSync('supabase/migrations/20261003095303_clinahir_supabase_outbox.sql','utf8');
 assert(sql.includes('for update'));assert(sql.includes('daily_command_lock_token=p_token'));
 assert(sql.includes('on conflict (external_id) do nothing'));assert(sql.includes('from public,anon,authenticated'));
 assert(sql.includes('security invoker'));assert(sql.includes('enable row level security'));
});
test('browser client uses same-origin API, preserves attribution and ID on error, clears form ID only on success',async()=> {
 const data=new Map();globalThis.sessionStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};globalThis.window={location:{pathname:'/',search:'?utm_source=google&utm_medium=cpc&utm_campaign=radiology'}};
 assert.equal(captureAttribution().utmSource,'google');window.location={pathname:'/about',search:''};assert.equal(captureAttribution().landingPage,'/');
 const form=new FormData();for(const [k,v] of Object.entries({center_name:'Atlas',city:'Casablanca',email:'contact@example.com',phone:'0612345678',role:input.role,priority:input.priority}))form.set(k,v);
 let first;await assert.rejects(()=>submitLead(form,async(url,init)=>{assert.equal(url,'/api/leads');first=JSON.parse(init.body);assert(!JSON.stringify(init).includes(config.CLINAHIR_INTEGRATION_SECRET));return Response.json({error:'offline'},{status:503});}));
 const id=await submitLead(form,async(url,init)=>{const body=JSON.parse(init.body);assert.equal(body.submissionId,first.submissionId);assert.equal(body.utmCampaign,'radiology');return Response.json({ok:true,externalId:`cli_${body.submissionId}`},{status:201});});assert.equal(data.get('clinahir:last-lead-id'),id);assert(!data.has('clinahir:lead-submission:v1'));
});
test('existing form delegates submission and preserves success/error states',()=> {const source=readFileSync('src/LandingSections.tsx','utf8');assert(source.includes('await submitLead(body)'));assert(source.includes("setStatus('success')"));assert(source.includes("catch { setStatus('error'); }"));assert(source.includes("disabled={status === 'sending'}"));assert(!source.includes('VITE_DEMO_FORM_ENDPOINT'));});
test('private integration secret absent from client source and built assets',()=> {
 const source=readFileSync('src/leads/client.ts','utf8');assert(!source.includes('CLINAHIR_INTEGRATION_SECRET'));
 for(const f of readdirSync('dist/client/assets')) if(f.endsWith('.js')) {const bundle=readFileSync(`dist/client/assets/${f}`,'utf8');assert(!bundle.includes('CLINAHIR_INTEGRATION_SECRET'));assert(!bundle.includes('integration-build-secret-canary'));assert(!bundle.includes('SUPABASE_SERVICE_ROLE_KEY'));assert(!bundle.includes('sb_secret_test'));}
});
test('analytics accepts only bounded anonymous metadata and rejects cross-origin requests',async()=> {
 const {analyticsRequest}=await import('../.integration-build/server/analytics.js');
 const env={SUPABASE_URL:'https://project.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'sb_secret_test'};let stored;
 const request=(body,origin='https://clinahir.example.com')=>new Request('https://clinahir.example.com/api/analytics',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
 const event={id:'12345678-1234-4234-8234-123456789abc',eventType:'demo_cta_click',placement:'hero',language:'fr',email:'must-not-forward@example.com'};
 const result=await analyticsRequest(request(event),env,async(_,init)=>{stored=JSON.parse(init.body);return Response.json({});});assert.equal(result.status,204);assert.deepEqual(stored.p_event,{id:event.id,event_type:'demo_cta_click',placement:'hero',language:'fr'});
 assert.equal((await analyticsRequest(request(event,'https://evil.example'),env)).status,403);
 assert.equal((await analyticsRequest(request({...event,eventType:'arbitrary'}),env)).status,400);
 assert.equal((await analyticsRequest(request({...event,extra:'x'.repeat(2000)}),env)).status,413);
 assert.equal((await analyticsRequest(request(event),env,async()=>new Response('',{status:500}))).status,503);
});

test('optional contact name is normalized and delivered without changing lead identity', async()=>{
 const store=new MemoryStore();let sent;
 const response=await leadRequest(req({...input,contactName:' Dr. Example '}),store,config,async(_url,init)=>{sent=JSON.parse(init.body);return new Response('{}',{status:201});});
 assert.equal(response.status,201);assert.equal(sent.contactName,'Dr. Example');assert.equal(sent.externalId,'cli_'+input.submissionId);
});
