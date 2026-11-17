import {readFile,writeFile,chmod} from 'node:fs/promises';import {randomBytes} from 'node:crypto';
import {sourceRef,query} from './remote-platform.mjs';
const report={executedAt:new Date().toISOString(),projectRef:sourceRef,scope:'Real staging Supabase Auth and PostgREST; synthetic accounts only; no application deployment claim',checks:[]};
const check=(name,passed,status)=>{report.checks.push({name,passed,...(status?{httpStatus:status}:{})});if(!passed)throw Error('verification_failed');console.log('PASS',name);};
const keys=JSON.parse(await readFile('output/staging/target-cli-keys.json','utf8')).keys;
const service=keys.find(k=>k.name==='service_role')?.api_key,anon=keys.find(k=>k.name==='anon')?.api_key;
if(!service||!anon)throw Error('private_keys_required');
const base=`https://${sourceRef}.supabase.co`;let token;
async function request(path,key,method='GET',body,accessToken=key){return fetch(base+path,{method,headers:{apikey:key,Authorization:'Bearer '+accessToken,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),redirect:'error',signal:AbortSignal.timeout(15000)});}
try{
 let accounts;try{accounts=JSON.parse(await readFile('output/staging/test-accounts.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;accounts={projectRef:sourceRef};}
 if(accounts.projectRef!==sourceRef)throw Error('account_target_mismatch');
 for(const role of ['owner','nonowner']){
  if(accounts[role])continue;
  const email=`clinahir-stage-${role}-${randomBytes(5).toString('hex')}@example.com`,password=randomBytes(30).toString('base64url');
  const r=await request('/auth/v1/admin/users',service,'POST',{email,password,email_confirm:true,user_metadata:{synthetic_staging_only:true}});
  check(role+' synthetic account created without invitation email',r.status===200||r.status===201,r.status);const user=await r.json();if(!user.id)throw Error('missing_account_id');
  accounts[role]={email,password,id:user.id};await writeFile('output/staging/test-accounts.json',JSON.stringify(accounts),{mode:0o600});await chmod('output/staging/test-accounts.json',0o600);
 }
 let r=await request('/auth/v1/settings',anon);check('actual independent anon key accepted by Auth',r.status===200,r.status);await r.body?.cancel();
 r=await request('/auth/v1/token?grant_type=password',anon,'POST',{email:accounts.nonowner.email,password:accounts.nonowner.password});check('synthetic non-owner authenticates',r.status===200,r.status);const session=await r.json();token=session.access_token;check('non-owner identity matches',session.user?.id===accounts.nonowner.id&&!!token);
 const tables=await query(sourceRef,"select tablename,rowsecurity from pg_tables where schemaname='public' order by tablename");check('all eight application tables have RLS',tables.length===8&&tables.every(t=>t.rowsecurity));
 for(const [role,bearer]of [['anon',anon],['authenticated',token]]){
  for(const {tablename} of tables){r=await request(`/rest/v1/${tablename}?select=*&limit=1`,anon,'GET',undefined,bearer);const status=r.status;await r.body?.cancel();check(role+' private table read denied: '+tablename,[401,403].includes(status),status);}
  r=await request('/rest/v1/rpc/clinahir_admin_snapshot',anon,'POST',{},bearer);const status=r.status;await r.body?.cancel();check(role+' private snapshot execution denied',[401,403].includes(status),status);
 }
 r=await request('/rest/v1/clinahir_leads?select=external_id&limit=1',service);check('server service role can read staging lead table',r.status===200,r.status);await r.body?.cancel();report.status='passed';
}catch(e){report.status='failed';report.failure=e.message==='verification_failed'?'See failed check; sensitive response content omitted.':'Network or prerequisite failure; sensitive response content omitted.';process.exitCode=1;}
finally{if(token){try{const r=await request('/auth/v1/logout',anon,'POST',undefined,token);report.sessionCleanup=r.ok?'logged_out':'review_required';await r.body?.cancel();}catch{report.sessionCleanup='review_required';}}}
await writeFile('docs/clinahir-upgrade/staging-execution/hosted-database-access.json',JSON.stringify(report,null,2)+'\n');
