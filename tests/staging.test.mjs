import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {stagingIssues,environmentFailure} from '../.integration-build/server/environment.js';
import {adminRequest} from '../.integration-build/server/admin.js';
import {redactedClientEvent} from '../.integration-build/src/monitoring.js';
import {accessPrerequisites,verifyStagingAccess,hostingProtected} from '../scripts/staging/access-checks.mjs';
test('hosting checks accept only explicit Vercel SSO redirects and rejection statuses',()=>{
 assert(hostingProtected(new Response(null,{status:302,headers:{location:'https://vercel.com/sso-api?url=synthetic'}})));
 for(const location of ['https://attacker.example/sso-api','http://vercel.com/sso-api','https://vercel.com/other'])assert(!hostingProtected(new Response(null,{status:302,headers:{location}})));
 assert(!hostingProtected(Response.json({})));
});
const env={CLINAHIR_ENV:'staging',VERCEL_ENV:'preview',CLINAHIR_STAGING_SUPABASE_REF:'abcdefghijklmnopqrst',CLINAHIR_PRODUCTION_SUPABASE_REF:'zzzzzzzzzzzzzzzzzzzz',SUPABASE_URL:'https://abcdefghijklmnopqrst.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'synthetic-secret',CLINAHIR_ADMIN_EMAIL:'owner@example.test',CLINAHIR_ADMIN_USER_ID:'11111111-1111-4111-8111-111111111111',CRON_SECRET:'synthetic-cron',WHATSAPP_ENABLED:'false',DAILY_COMMAND_URL:'https://crm-staging.example.test',CLINAHIR_STAGING_CRM_ORIGIN:'https://crm-staging.example.test',CLINAHIR_PRODUCTION_CRM_ORIGIN:'https://crm-production.example.test',CLINAHIR_INTEGRATION_SECRET:'synthetic-crm',CLINAHIR_STAGING_ORIGIN:'https://staging.example.test'};
test('explicit staging configuration accepts distinct project and controlled receiver identities',()=>assert.deepEqual(stagingIssues(env),[]));
test('owner-declared absent production CRM still requires the exact controlled receiver',()=>{
 const absent={...env,CLINAHIR_PRODUCTION_CRM_CONFIGURED:'false',CLINAHIR_PRODUCTION_CRM_ORIGIN:undefined};
 assert.deepEqual(stagingIssues(absent),[]);
 for(const patch of [{CLINAHIR_PRODUCTION_CRM_CONFIGURED:undefined},{DAILY_COMMAND_URL:'https://elsewhere.example.test'},{CLINAHIR_STAGING_CRM_ORIGIN:undefined},{CLINAHIR_PRODUCTION_CRM_ORIGIN:env.CLINAHIR_PRODUCTION_CRM_ORIGIN}])assert(stagingIssues({...absent,...patch}).length);
});
test('preview APIs fail closed without explicit staging identity while existing local behavior remains',()=>{assert(stagingIssues({VERCEL_ENV:'preview'}).length);assert.deepEqual(stagingIssues({}),[]);});
test('staging rejects reused database identities, mismatched endpoint and production deployment target',()=>{
 for(const patch of [{CLINAHIR_PRODUCTION_SUPABASE_REF:env.CLINAHIR_STAGING_SUPABASE_REF},{SUPABASE_URL:'https://other.example.test'},{VERCEL_ENV:'production'}])assert(stagingIssues({...env,...patch}).length);
});
test('staging rejects live WhatsApp, absent credentials and production or arbitrary CRM origins',()=>{
 for(const patch of [{WHATSAPP_ENABLED:'true'},{WHATSAPP_ENABLED:undefined},{CLINAHIR_INTEGRATION_SECRET:''},{DAILY_COMMAND_URL:env.CLINAHIR_PRODUCTION_CRM_ORIGIN},{DAILY_COMMAND_URL:'https://elsewhere.example.test'},{SUPABASE_SERVICE_ROLE_KEY:''}])assert(stagingIssues({...env,...patch}).length);
});
test('staging origin checks cannot be satisfied by credentials, paths, queries or plain HTTP',()=>{
 for(const value of ['http://staging.example.test','https://x:y@staging.example.test','https://staging.example.test/path','https://staging.example.test/?secret=x'])assert(stagingIssues({...env,CLINAHIR_STAGING_ORIGIN:value}).length);
 assert.equal(environmentFailure(env,new Request('https://production.example.test/api/admin')).status,503);
});
test('misconfigured staging blocks admin before any private network transport and conceals config values',async()=>{
 let calls=0;const r=await adminRequest(new Request('https://staging.example.test/api/admin'),{...env,WHATSAPP_ENABLED:'true'},async()=>{calls++;throw Error();});assert.equal(r.status,503);assert.equal(calls,0);assert(!JSON.stringify(await r.json()).includes(env.SUPABASE_SERVICE_ROLE_KEY));
});
test('client telemetry discards PII, cookies, messages, URLs, stack content and arbitrary tags',()=>{
 const event=redactedClientEvent({event_id:'a'.repeat(32),timestamp:123,message:'person@example.test',request:{headers:{Cookie:'private'}},user:{email:'person@example.test'},exception:{values:[{value:'patient secret'}]},breadcrumbs:[{message:'phone secret'}],tags:{url:'https://x/?token=secret'}});assert.deepEqual(Object.keys(event).sort(),['environment','type','event_id','timestamp','platform','level','message','fingerprint'].sort());assert(!JSON.stringify(event).includes('secret'));assert(!JSON.stringify(event).includes('example.test'));
});
test('staging access verifier makes zero requests without explicit owner authorization',async()=>{
 let calls=0;const result=await verifyStagingAccess(env,async()=>{calls++;throw Error();});assert.equal(result.status,'blocked');assert.equal(calls,0);assert(result.prerequisites.includes('owner_authorization_required'));
});
test('restricted-role verification requires independent public key and distinct accounts',()=>{
 const e={...env,STAGING_VERIFICATION_APPROVED:'synthetic-staging-auth-only',SUPABASE_ANON_KEY:'sb_publishable_synthetic_only',STAGING_OWNER_EMAIL:'owner@example.test',STAGING_OWNER_PASSWORD:'local-only',STAGING_OWNER_ID:'owner',STAGING_NONOWNER_EMAIL:'nonowner@example.test',STAGING_NONOWNER_PASSWORD:'local-only',STAGING_NONOWNER_ID:'nonowner'};assert.deepEqual(accessPrerequisites(e),[]);assert(accessPrerequisites({...e,STAGING_NONOWNER_ID:'owner'}).length);assert(accessPrerequisites({...e,SUPABASE_ANON_KEY:''}).length);assert(accessPrerequisites({...e,SUPABASE_ANON_KEY:'sb_secret_must_never_be_used'}).length);
});
test('stage verifier refuses unprotected hosting before sending authentication credentials',async()=>{
 const e={...env,STAGING_VERIFICATION_APPROVED:'synthetic-staging-auth-only',SUPABASE_ANON_KEY:'sb_publishable_synthetic_only',STAGING_OWNER_EMAIL:'owner@example.test',STAGING_OWNER_PASSWORD:'local-only',STAGING_OWNER_ID:'owner',STAGING_NONOWNER_EMAIL:'nonowner@example.test',STAGING_NONOWNER_PASSWORD:'local-only',STAGING_NONOWNER_ID:'nonowner'};let calls=0;const result=await verifyStagingAccess(e,async()=>{calls++;return Response.json({});});assert.equal(result.status,'failed');assert.equal(calls,1);
});
test('staging hosting template has no production cron and marks all paths noindex',()=>{
 const config=JSON.parse(readFileSync('vercel.staging.json','utf8'));assert(!config.crons);assert(config.headers.some(rule=>rule.source==='/(.*)'&&rule.headers.some(h=>h.key==='X-Robots-Tag'&&h.value.includes('noindex'))));assert.equal(config.buildCommand,'npm run build:staging');
});
test('staging scripts never silently load the development environment or embed service role in access transport',()=>{
 for(const name of ['scripts/staging-preflight.mjs','scripts/staging/verify-access.mjs','scripts/staging/access-checks.mjs']){const source=readFileSync(name,'utf8');assert(!source.includes('loadEnv('));assert(!source.includes("from 'dotenv'"));}assert(!readFileSync('scripts/staging/access-checks.mjs','utf8').includes('SUPABASE_SERVICE_ROLE_KEY'));
});

 test('business workflow requires separate approval and makes no network requests by default',async()=>{const {verifyStagingWorkflow}=await import('../scripts/staging/workflow-checks.mjs');let calls=0;const result=await verifyStagingWorkflow(env,async()=>{calls++;throw Error();});assert.equal(result.status,'blocked');assert.equal(calls,0);assert(result.prerequisites.includes('separate_business_write_authorization_required'));});

test('API failure observations contain only bounded area, status and category',async()=>{const {observeResponse}=await import('../.integration-build/server/observability.js');const previous=console.warn,seen=[];console.warn=(...args)=>seen.push(args);try{const response=Response.json({error:'person@example.test secret'},{status:503});assert.equal(observeResponse('admin',response),response);observeResponse('admin',Response.json({ok:true}));assert.deepEqual(seen,[['clinahir_api_failure',{area:'admin',status:503,category:'service_failure'}]]);}finally{console.warn=previous;}});

test('admin rejects JSON lookalike media types before authentication transport',async()=>{const {fixtureEnv,createAdminFixture}=await import('./fixtures/admin-fetch.mjs');const request=new Request('https://admin.example.test/api/admin?action=login',{method:'POST',headers:{Origin:'https://admin.example.test','Content-Type':'application/jsonp'},body:JSON.stringify({email:fixtureEnv.CLINAHIR_ADMIN_EMAIL,password:'local-admin-fixture-only'})});let calls=0;const response=await adminRequest(request,fixtureEnv,async(...args)=>{calls++;return createAdminFixture()(...args);});assert.equal(response.status,400);assert.equal(calls,0);});
