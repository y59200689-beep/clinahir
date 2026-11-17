import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync} from 'node:fs';
import {adminRequest} from '../.integration-build/server/admin.js';import {createAdminFixture,fixtureEnv} from './fixtures/admin-fetch.mjs';
test('every private business API rejects anonymous and non-owner access before data transport',async()=>{
 const cases=[['snapshot'],['content'],['prospects'],['lead',{id:'cli_11111111-1111-4111-8111-111111111111',stage:'qualified',notes:'test'}],['content',{content:{},version:0,publish:false}],['replay',{id:'cli_11111111-1111-4111-8111-111111111111',channel:'daily_command'}],['prospect',{}],['prospects-import',{}]];
 for(const[action,body]of cases){const req=token=>new Request(`https://fixture.invalid/api/admin?action=${action}`,{method:body?'POST':'GET',headers:{origin:'https://fixture.invalid','content-type':'application/json',...(token?{cookie:`clinahir_admin_session=${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});let dataCalls=0;const denied=async()=>{dataCalls++;throw Error('Unexpected data request');};assert.equal((await adminRequest(req(''),fixtureEnv,denied)).status,401,action);assert.equal(dataCalls,0,action);const nonOwner=async(url)=>{assert(String(url).endsWith('/auth/v1/user'));return Response.json({id:'other-user',email:'other@example.test'});};assert.equal((await adminRequest(req('other'),fixtureEnv,nonOwner)).status,403,action);}
});
test('private table/view migration contracts revoke anon/authenticated grants and enable RLS',()=>{
 const sql=readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).map(f=>readFileSync(`supabase/migrations/${f}`,'utf8')).join('\n').toLowerCase();
 const tables=[...sql.matchAll(/create table public\.(clinahir_\w+)/g)].map(match=>match[1]);assert(tables.length>=7);
 const revocations=[...sql.matchAll(/revoke all on (?!function)([^;]+?) from public,\s*anon,\s*authenticated/g)].map(match=>match[1]);
 for(const table of tables){assert(sql.includes(`alter table public.${table} enable row level security`),table);assert(revocations.some(statement=>statement.includes(`public.${table}`)),table);}
 for(const view of ['clinahir_delivery_health','clinahir_conversion_daily'])assert(revocations.some(statement=>statement.includes(`public.${view}`)),view);
 assert(!/grant\s+(select|all|insert|update|delete)[^;]+on\s+public\.clinahir_[^;]+to\s+(anon|authenticated)/.test(sql));
 // Source-contract checks only. Actual RLS execution requires a separately verified staging database.
});
test('isolated admin fixture never falls through to a production integration transport',()=>{const source=readFileSync('scripts/verify-admin.mjs','utf8');assert(source.includes("url.pathname.startsWith('/api/')"));assert(source.includes('External integrations disabled in isolated QA'));assert(source.includes('fixtureEnv'));});
