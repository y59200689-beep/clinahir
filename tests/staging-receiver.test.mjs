import test from 'node:test';import assert from 'node:assert/strict';
import {POST,GET} from '../.integration-build/api/staging-crm.js';
import {serverConfig} from '../.integration-build/server/config.js';
const env={CLINAHIR_ENV:'staging',VERCEL_ENV:'preview',CLINAHIR_STAGING_SUPABASE_REF:'abcdefghijklmnopqrst',CLINAHIR_PRODUCTION_SUPABASE_REF:'zzzzzzzzzzzzzzzzzzzz',SUPABASE_URL:'https://abcdefghijklmnopqrst.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'fixture-private',CLINAHIR_ADMIN_EMAIL:'owner@example.test',CLINAHIR_ADMIN_USER_ID:'fixture-owner',CRON_SECRET:'fixture-cron',WHATSAPP_ENABLED:'false',DAILY_COMMAND_URL:'https://staging.example.test',CLINAHIR_STAGING_CRM_ORIGIN:'https://staging.example.test',CLINAHIR_PRODUCTION_CRM_CONFIGURED:'false',CLINAHIR_INTEGRATION_SECRET:'fixture-receiver',CLINAHIR_STAGING_ORIGIN:'https://staging.example.test',CLINAHIR_STAGING_RECEIVER_ENABLED:'true',STAGING_PROTECTION_BYPASS:'fixture-bypass'};
test('hosted synthetic receiver is absent outside staging and rejects missing receiver authorization before transport',async()=>{
 const saved={...process.env},fetcher=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw Error();};
 try{
  Object.assign(process.env,env,{CLINAHIR_ENV:'production'});assert.equal((await POST(new Request(env.CLINAHIR_STAGING_ORIGIN+'/api/integrations/clinahir/leads',{method:'POST'}))).status,404);
  Object.assign(process.env,env);assert.equal((await GET(new Request(env.CLINAHIR_STAGING_ORIGIN+'/__verification/receipts/cli_11111111-1111-4111-8111-111111111111'))).status,401);
  assert.equal(calls,0);
 }finally{process.env=saved;globalThis.fetch=fetcher;}
});
test('receiver rejects non-synthetic bodies and persists only identity and fingerprint; lost acknowledgement remains failure',async()=>{
 const saved={...process.env},fetcher=globalThis.fetch;let calls=0;
 try{
  Object.assign(process.env,env);globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,env.SUPABASE_URL+'/rest/v1/rpc/clinahir_staging_receiver');const body=JSON.parse(options.body);assert.equal(body.p_action,'record');assert.match(body.p_fingerprint,/^[a-f0-9]{64}$/);assert(!options.body.includes('Synthetic Test'));return Response.json({mode:'accepted-but-unacknowledged',conflict:false});};
  const send=companyName=>POST(new Request(env.CLINAHIR_STAGING_ORIGIN+'/api/integrations/clinahir/leads',{method:'POST',headers:{Authorization:'Bearer '+env.CLINAHIR_INTEGRATION_SECRET},body:JSON.stringify({externalId:'cli_11111111-1111-4111-8111-111111111111',companyName})}));
  assert.equal((await send('Actual customer')).status,400);assert.equal(calls,0);assert.equal((await send('Synthetic Test')).status,503);assert.equal(calls,1);
 }finally{process.env=saved;globalThis.fetch=fetcher;}
});
test('hosting automation credential is forwarded only for the explicitly enabled staging receiver',()=>{
 assert.equal(serverConfig(env).stagingProtectionBypass,env.STAGING_PROTECTION_BYPASS);
 assert.equal(serverConfig({...env,CLINAHIR_STAGING_RECEIVER_ENABLED:'false'}).stagingProtectionBypass,undefined);
 assert.equal(serverConfig({STAGING_PROTECTION_BYPASS:'private'}).stagingProtectionBypass,undefined);
});
test('separate protected CRM requires its own automation credential and never receives the fixture fallback',()=>{
 const separate={...env,CLINAHIR_STAGING_RECEIVER_ENABLED:'false',STAGING_CRM_PROTECTION_BYPASS:'separate-crm-access'};
 assert.equal(serverConfig(separate).stagingProtectionBypass,'separate-crm-access');
 assert.equal(serverConfig({...separate,STAGING_CRM_PROTECTION_BYPASS:undefined}).stagingProtectionBypass,undefined);
 assert.equal(serverConfig({STAGING_CRM_PROTECTION_BYPASS:'separate-crm-access'}).stagingProtectionBypass,undefined);
});
