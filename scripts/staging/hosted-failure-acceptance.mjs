import {readFile,writeFile} from 'node:fs/promises';import {randomUUID} from 'node:crypto';
import {siteDefaults} from '../../.integration-build/src/content/schema.js';import {sourceRef,query} from './remote-platform.mjs';
const env=JSON.parse(await readFile('output/staging/hosting-env.json','utf8')),accounts=JSON.parse(await readFile('output/staging/test-accounts.json','utf8')),origin=env.CLINAHIR_STAGING_ORIGIN;
const report={executedAt:new Date().toISOString(),scope:'Real protected staging API and durable controlled CRM only; no live CRM, WhatsApp or clinical data',checks:[],syntheticExternalIds:[]};
const check=(name,passed)=>{report.checks.push({name,passed});if(!passed)throw Error('verification_failed');console.log('PASS',name);};let cookie;
const call=(path,options={})=>fetch(origin+path,{...options,headers:{'x-vercel-protection-bypass':env.STAGING_PROTECTION_BYPASS,...options.headers},redirect:'manual',signal:AbortSignal.timeout(25000)});
const post=(path,body,headers={})=>call(path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...headers},body:JSON.stringify(body)});
async function mode(value){const r=await post('/__verification/mode',{mode:value},{Authorization:'Bearer '+env.CLINAHIR_INTEGRATION_SECRET});check('controlled receiver mode '+value,r.status===200);await r.body?.cancel();}
try{
 const stage=await call('/api/environment');check('server identity remains staging',stage.ok&&(await stage.json()).environment==='staging');
 const existing=await query(sourceRef,"select count(*)::int as unexpected from public.clinahir_leads where company_name not like 'Synthetic %'");check('queue contains only synthetic acceptance leads',existing[0].unexpected===0);
 let r=await post('/api/admin?action=login',accounts.owner);check('owner signs in for failure and CMS acceptance',r.status===200);cookie=r.headers.get('set-cookie')?.split(';')[0];await r.body?.cancel();
 for(const [i,value]of ['outage','accepted-but-unacknowledged','timeout'].entries()){
  await mode(value);const submissionId=randomUUID(),id='cli_'+submissionId;
  r=await post('/api/leads',{submissionId,companyName:'Synthetic '+value+' '+submissionId,city:'Synthetic city',contactName:'Synthetic operator',phone:'+120255501'+String(30+i),role:'Owner / director',priority:'More appointment requests',formType:'demo',landingPage:'/'});
  check(value+' still acknowledges durable website capture',r.status===201);await r.body?.cancel();report.syntheticExternalIds.push(id);
  const rows=await query(sourceRef,`select daily_command_status,daily_command_attempts,daily_command_last_error from public.clinahir_leads where external_id='${id}'`);
  check(value+' leaves saved lead pending with bounded error',rows.length===1&&rows[0].daily_command_status==='pending'&&rows[0].daily_command_attempts===1&&['http_503','network_or_timeout'].includes(rows[0].daily_command_last_error));
 }
 await mode('healthy');
 r=await call('/api/admin?action=content',{headers:{Cookie:cookie}});check('owner reads staged CMS',r.status===200);const original=(await r.json()).content;const content=structuredClone(original.draft??siteDefaults);content.hero.en.headline='Synthetic staging CMS verification';content.hero.fr.headline='Vérification CMS de préproduction synthétique';
 r=await post('/api/admin?action=content',{content,version:original.version,publish:false});check('bilingual draft saves',r.status===200);const draft=(await r.json()).content;
 r=await post('/api/admin?action=content',{content,version:original.version,publish:false});check('stale CMS version rejected',r.status===409);await r.body?.cancel();
 r=await post('/api/admin?action=content',{content,version:draft.version,publish:true});check('synthetic bilingual content publishes only to staging',r.status===200);await r.body?.cancel();
 r=await call('/api/content');check('fresh public content API exposes published staging document',r.status===200);const published=(await r.json()).content;check('both published locale headlines persist',published.hero.en.headline===content.hero.en.headline&&published.hero.fr.headline===content.hero.fr.headline);
 // Respect the real retry delay rather than falsifying timestamps or forcing database status.
 console.log('WAIT respecting the actual one-minute CRM retry schedule');
 const dueAt=await query(sourceRef,"select max(daily_command_next_attempt_at) as due from public.clinahir_leads where daily_command_status='pending'");const wait=Math.max(0,Date.parse(dueAt[0].due)-Date.now()+1500);if(wait>75000)throw Error('unexpected_retry_delay');await new Promise(resolve=>setTimeout(resolve,wait));
 const processQueue=()=>call('/api/cron/leads',{headers:{Authorization:'Bearer '+env.CRON_SECRET}});
 const concurrent=await Promise.all([processQueue(),processQueue()]);check('concurrent authenticated staging retry processors complete',concurrent.every(r=>r.status===200));for(const response of concurrent)await response.body?.cancel();
 for(const id of report.syntheticExternalIds){const rows=await query(sourceRef,`select daily_command_status,daily_command_attempts from public.clinahir_leads where external_id='${id}'`);check('retry synchronizes '+id,rows[0]?.daily_command_status==='synced'&&rows[0].daily_command_attempts===2);r=await call('/__verification/receipts/'+id,{headers:{Authorization:'Bearer '+env.CLINAHIR_INTEGRATION_SECRET}});check('independent durable receiver reports one receipt '+id,r.status===200&&(await r.json()).receiptCount===1);}
 report.status='passed';
}catch(e){report.status='failed';report.failure=e.message==='verification_failed'?'See failed check; private responses omitted.':'Transport or prerequisite failure; private responses omitted.';process.exitCode=1;}
finally{try{await mode('healthy');}catch{report.receiverCleanup='review_required';}if(cookie)try{const r=await post('/api/admin?action=logout',{});report.sessionCleanup=r.ok?'logged_out':'review_required';await r.body?.cancel();}catch{report.sessionCleanup='review_required';}}
await writeFile('docs/clinahir-upgrade/staging-execution/hosted-failure-acceptance.json',JSON.stringify(report,null,2)+'\n');console.log(report.status);
