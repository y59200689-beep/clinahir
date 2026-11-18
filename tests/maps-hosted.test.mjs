import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { mapsWorkerRequest, mapsAdminRequest } from '../.integration-build/server/maps.js';
const actor='11111111-1111-4111-8111-111111111111',id='22222222-2222-4222-8222-222222222222',token='33333333-3333-4333-8333-333333333333';
const env={CRON_SECRET:'fixture-secret-never-production',SUPABASE_URL:'https://fixture.invalid',SUPABASE_SERVICE_ROLE_KEY:'sb_secret_fixture',CLINAHIR_ADMIN_USER_ID:actor};
const req=(action,body)=>new Request('https://clinahir.test/api/admin?action='+action,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Origin:'https://clinahir.test'},...(body?{body:JSON.stringify(body)}:{})});
const row={title:'Synthetic Imaging',city:'Rabat',category:'Imaging',rating:'4.5',reviews:'10',phone:'+212600000000',website:'https://example.test',address:'Synthetic address',listing:'https://maps.example.test'};
test('hosted owner start validates input, limits and active-job conflicts',async()=>{
 let calls=[];let result={id,keywords:'imaging',city:'Rabat',status:'queued',created_at:'2026-11-18',results:[]};const store={adminRpc:async(name,data)=>{calls.push({name,data});return result;}};
 assert.equal((await mapsAdminRequest(req('maps-start',{}),{},store,actor)).status,400);assert.equal(calls.length,0);
 const response=await mapsAdminRequest(req('maps-start',{}),{keywords:'imaging',city:'Rabat',proxy:'none'},store,actor);assert.equal(response.status,200);assert.equal((await response.json()).job.status,'queued');assert.equal(calls[0].data.p_actor,actor);
 result={conflict:true};assert.equal((await mapsAdminRequest(req('maps-start',{}),{keywords:'imaging',city:'Rabat',proxy:'none'},store,actor)).status,409);
 result={limited:true};assert.equal((await mapsAdminRequest(req('maps-start',{}),{keywords:'imaging',city:'Rabat',proxy:'none'},store,actor)).status,429);
});
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});const jwk={...publicKey.export({format:'jwk'}),kid:'fixture',alg:'RS256',use:'sig'};
const identity=(patch={})=>{const now=Math.floor(Date.now()/1000);const h=Buffer.from(JSON.stringify({alg:'RS256',kid:'fixture'})).toString('base64url');const p=Buffer.from(JSON.stringify({iss:'https://token.actions.githubusercontent.com',aud:'https://clinahir.tech/api/maps-worker',repository:'y59200689-beep/clinahir',repository_id:'1402964658',repository_owner_id:'297662398',ref:'refs/heads/main',sub:'repo:y59200689-beep/clinahir:ref:refs/heads/main',event_name:'schedule',workflow_ref:'y59200689-beep/clinahir/.github/workflows/maps-worker.yml@refs/heads/main',iat:now,exp:now+300,...patch})).toString('base64url');return h+'.'+p+'.'+sign('RSA-SHA256',Buffer.from(h+'.'+p),privateKey).toString('base64url');};
test('worker verifies signature, audience, immutable repository, default branch and exact workflow before storage',async()=>{
 let calls=0;const fetcher=async url=>{if(url==='https://token.actions.githubusercontent.com/.well-known/jwks')return Response.json({keys:[jwk]});calls++;return Response.json(null);};
 const worker=(body,credential=identity())=>new Request('https://clinahir.test/api/maps-worker',{method:'POST',headers:{Authorization:'Bearer '+credential},body:JSON.stringify(body)});
 for(const credential of ['', 'wrong',identity({aud:'other'}),identity({repository_id:'other'}),identity({ref:'refs/heads/other'}),identity({event_name:'pull_request'}),identity({exp:1}),identity().slice(0,-4)+'AAAA'])assert.equal((await mapsWorkerRequest(worker({},credential),env,fetcher)).status,401);
 assert.equal(calls,0);assert.equal((await mapsWorkerRequest(worker({op:'claim',claimToken:id}),env,fetcher)).status,200);assert.equal(calls,1);
 assert.equal((await mapsWorkerRequest(worker({op:'delete'}),env,fetcher)).status,400);
 assert.equal((await mapsWorkerRequest(worker({op:'finish',id,token,results:[{title:{unsafe:true}}],success:true}),env,fetcher)).status,400);assert.equal(calls,1);
 assert.equal((await mapsWorkerRequest(worker({op:'finish',id,token,results:[row],success:false,partial:'yes'}),env,fetcher)).status,400);assert.equal(calls,1);
 assert.equal((await mapsWorkerRequest(worker({op:'finish',id,token,results:[row],success:false,partial:true,error:'Partial results ready.'}),env,fetcher)).status,200);assert.equal(calls,2);
});
test('hosted result preview is bounded while CSV/import include every result and reuse duplicate-safe RPC',async()=>{
 const rows=Array.from({length:25},(_,i)=>({...row,title:i?'Synthetic '+i:'=FORMULA()'}));let imports=0;
 const store={adminRpc:async(name,data)=>{if(name==='clinahir_admin_import_prospects'){imports++;assert.equal(data.p_actor,actor);assert.equal(data.p_rows.length,25);assert.equal(data.p_rows[0].phone,'+212600000000');return {inserted:24,duplicates:1};}return {id,keywords:'imaging',city:'Rabat',status:'completed',created_at:'2026-11-18',results:rows};}};
 const preview=await (await mapsAdminRequest(req('maps-status'),undefined,store,actor)).json();assert.equal(preview.total,25);assert.equal(preview.rows.length,20);assert.equal(preview.job.lease_token,undefined);
 const csv=await (await mapsAdminRequest(req('maps-export'),undefined,store,actor)).text();assert.ok(csv.includes("'=FORMULA()"));assert.ok(csv.includes('Synthetic 24'));
 assert.equal((await mapsAdminRequest(req('maps-import',{}),{jobId:token,sourceUseConfirmed:true},store,actor)).status,409);assert.equal(imports,0);
 assert.deepEqual(await (await mapsAdminRequest(req('maps-import',{}),{jobId:id,sourceUseConfirmed:true},store,actor)).json(),{inserted:24,duplicates:1});
});
test('public admin Maps actions cannot bypass the existing owner session',async()=>{
 const {adminRequest}=await import('../.integration-build/server/admin.js');let calls=0;
 const fetcher=async()=>{calls++;return Response.json({id:'not-owner',email:'other@example.test'});};
 const configured={...env,CLINAHIR_ADMIN_EMAIL:'owner@example.test'};
 for(const action of ['maps-status','maps-export','maps-start','maps-stop','maps-import']){
  const request=req(action,action.includes('status')||action.includes('export')?undefined:{});
  assert.equal((await adminRequest(request,configured,fetcher)).status,401);
 }
 assert.equal(calls,0);const request=req('maps-start',{});request.headers.set('cookie','clinahir_admin_session=fixture');assert.equal((await adminRequest(request,configured,fetcher)).status,403);assert.equal(calls,1);
});
