import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {createCrmReceiver} from '../scripts/staging/crm-receiver.mjs';
import {MemoryStore} from './fixtures/memory-store.mjs';
import {leadRequest} from '../.integration-build/server/http.js';
import {deliver} from '../.integration-build/server/leads.js';
const secret='synthetic-test-secret-only';const config={DAILY_COMMAND_URL:'https://controlled-receiver.invalid',CLINAHIR_INTEGRATION_SECRET:secret};
const input=()=>({submissionId:randomUUID(),companyName:'Synthetic phase3 center',city:'Test city',contactName:'Synthetic decision maker',phone:'+12025550123',role:'Owner / director',priority:'More appointment requests',formType:'demo',landingPage:'/'});
const request=body=>new Request('https://staging.example.test/api/leads',{method:'POST',headers:{Origin:'https://staging.example.test','Content-Type':'application/json'},body:JSON.stringify(body)});
async function fixture(fn){const receiver=await createCrmReceiver(secret);try{const fetcher=(_url,init)=>fetch(receiver.origin+'/api/integrations/clinahir/leads',init);await fn(receiver,fetcher);}finally{await receiver.close();}}

test('real loopback HTTP receiver authenticates and rejects non-synthetic payloads',()=>fixture(async(receiver)=>{
 assert.equal((await fetch(receiver.origin+'/api/integrations/clinahir/leads',{method:'POST',body:'{}'})).status,401);
 assert.equal((await fetch(receiver.origin+'/api/integrations/clinahir/leads',{method:'POST',headers:{Authorization:`Bearer ${secret}`},body:JSON.stringify({externalId:'cli_'+randomUUID(),companyName:'Real company'})})).status,400);
 assert.equal(receiver.observations().uniqueReceipts,0);
}));
test('CRM outage preserves accepted lead and recovery reuses durable identity over HTTP (memory DB)',()=>fixture(async(receiver,fetcher)=>{
 receiver.setMode('outage');const store=new MemoryStore();const response=await leadRequest(request(input()),store,config,fetcher);assert.equal(response.status,201);const {externalId}=await response.json();assert.equal(store.records.get(externalId).status,'pending');const original=structuredClone(store.records.get(externalId).payload);
 receiver.setMode('healthy');await deliver(store,externalId,config,fetcher,store.queue.get(externalId));assert.equal(store.records.get(externalId).status,'synced');assert.deepEqual(store.records.get(externalId).payload,original);assert.equal(receiver.observations().uniqueReceipts,1);
}));
test('concurrent duplicate website requests produce one loopback CRM receipt (memory DB)',()=>fixture(async(receiver,fetcher)=>{
 const store=new MemoryStore(),body=input();const responses=await Promise.all(Array.from({length:5},()=>leadRequest(request(body),store,config,fetcher)));assert(responses.every(r=>r.status===201));assert.equal(store.records.size,1);assert.deepEqual(receiver.observations(),{attempts:1,uniqueReceipts:1});
}));
test('ambiguous CRM acknowledgement deduplicates retry at controlled receiver',()=>fixture(async(receiver,fetcher)=>{
 receiver.setMode('accepted-but-unacknowledged');const store=new MemoryStore();const response=await leadRequest(request(input()),store,config,fetcher);const {externalId}=await response.json();assert.equal(receiver.observations().uniqueReceipts,1);receiver.setMode('healthy');await deliver(store,externalId,config,fetcher,store.queue.get(externalId));assert.equal(store.records.get(externalId).status,'synced');assert.deepEqual(receiver.observations(),{attempts:2,uniqueReceipts:1});
}));
test('real CRM timeout remains retryable and persistent outage exhausts safely (memory DB)',()=>fixture(async(receiver,fetcher)=>{
 receiver.setMode('timeout');const store=new MemoryStore();const response=await leadRequest(request(input()),store,config,fetcher);assert.equal(response.status,201);const {externalId}=await response.json();assert.equal(store.records.get(externalId).lastError,'network_or_timeout');receiver.setMode('outage');for(let i=1;i<8;i++)await deliver(store,externalId,config,fetcher,store.queue.get(externalId));assert.equal(store.records.get(externalId).status,'exhausted');assert.equal(store.records.size,1);assert.equal(store.queue.size,0);
}));
