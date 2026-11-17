import {randomUUID} from 'node:crypto';
import {httpsOrigin} from '../../.integration-build/server/environment.js';
import {accessPrerequisites,hostingProtected} from './access-checks.mjs';
export async function verifyStagingWorkflow(env,fetcher=fetch){
 const issues=accessPrerequisites({...env,STAGING_VERIFICATION_APPROVED:'synthetic-staging-auth-only'});
 if(env.STAGING_WORKFLOW_APPROVED!=='synthetic-staging-business-writes')issues.push('separate_business_write_authorization_required');
 const receiver=httpsOrigin(env.CLINAHIR_STAGING_CRM_ORIGIN);
 const productionReceiver=httpsOrigin(env.CLINAHIR_PRODUCTION_CRM_ORIGIN),noProductionReceiver=env.CLINAHIR_PRODUCTION_CRM_CONFIGURED==='false'&&!env.CLINAHIR_PRODUCTION_CRM_ORIGIN;
 if(!receiver||receiver!==httpsOrigin(env.DAILY_COMMAND_URL)||!env.CLINAHIR_INTEGRATION_SECRET||(!productionReceiver&&!noProductionReceiver)||(productionReceiver&&receiver===productionReceiver)||(env.CLINAHIR_PRODUCTION_CRM_CONFIGURED==='false'&&env.CLINAHIR_PRODUCTION_CRM_ORIGIN))issues.push('controlled_receiver_identity_required');
 const report={executedAt:new Date().toISOString(),scope:'Synthetic staging lead capture and owner edits; no CMS publish, queue-wide cron or WhatsApp sends',status:'blocked',prerequisites:issues,checks:[]};if(issues.length)return report;
 const origin=httpsOrigin(env.CLINAHIR_STAGING_ORIGIN),headers=env.STAGING_PROTECTION_BYPASS?{'x-vercel-protection-bypass':env.STAGING_PROTECTION_BYPASS}:{};let cookie;
 const call=(path,init={})=>fetcher(origin+path,{...init,headers:{...headers,...init.headers},signal:AbortSignal.timeout(15000),redirect:'manual'});
 const post=(path,body)=>call(path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});
 const check=(name,passed)=>{report.checks.push({name,passed});if(!passed)throw Error('verification_failed');};
 try{
  let r=await fetcher(origin+'/',{redirect:'manual',signal:AbortSignal.timeout(15000)});check('hosting is protected',hostingProtected(r));await r.body?.cancel();
  r=await call('/api/environment');check('server identifies staging',r.ok&&(await r.json()).environment==='staging');
  r=await post('/api/admin?action=login',{email:env.STAGING_OWNER_EMAIL,password:env.STAGING_OWNER_PASSWORD});check('owner signs in',r.status===200);cookie=r.headers.get('set-cookie')?.split(';')[0];await r.body?.cancel();check('private owner cookie returned',Boolean(cookie));
  const submissionId=randomUUID();const body={submissionId,companyName:'Synthetic Phase3 '+submissionId,city:'Synthetic test city',contactName:'Synthetic decision maker',phone:'+12025550123',role:'Owner / director',priority:'More appointment requests',formType:'demo',landingPage:'/'};
  r=await post('/api/leads',{...body,phone:''});check('invalid lead rejected',r.status===400);await r.body?.cancel();
  const responses=await Promise.all([post('/api/leads',body),post('/api/leads',body)]);check('concurrent valid requests accepted',responses.every(r=>r.status===201));const results=await Promise.all(responses.map(r=>r.json()));const externalId='cli_'+submissionId;check('duplicate identity preserved',results.every(r=>r.externalId===externalId));
  r=await post('/api/leads',{...body,city:'Changed city'});check('changed duplicate rejected',r.status===409);await r.body?.cancel();
  const snapshot=async()=>{const response=await call('/api/admin?action=snapshot&search='+encodeURIComponent(submissionId),{headers:{Cookie:cookie}});check('owner snapshot readable',response.status===200);return response.json();};
  let data=await snapshot();check('one durable business lead visible through fresh API read',data.leads?.length===1&&data.leads[0].external_id===externalId);report.syntheticExternalId=externalId;
  r=await post('/api/admin?action=lead',{id:externalId,stage:'qualified',notes:'Synthetic Phase 3 verification only'});check('stage and notes saved',r.status===200);await r.body?.cancel();data=await snapshot();check('stage and notes survive fresh read',data.leads[0].admin_stage==='qualified'&&data.leads[0].admin_notes==='Synthetic Phase 3 verification only');
  check('lead change audited',data.audit?.some(a=>a.action==='lead.updated'&&a.target===externalId));
  const lead=data.leads[0];check('backend records CRM acknowledgement',lead.daily_command_status==='synced');
  // This endpoint is a required contract of the owner-controlled receiver, not a live sales API.
  r=await fetcher(receiver+'/__verification/receipts/'+encodeURIComponent(externalId),{headers:{...(receiver===origin?headers:{}),Authorization:'Bearer '+env.CLINAHIR_INTEGRATION_SECRET},signal:AbortSignal.timeout(10000),redirect:'manual'});check('controlled receiver receipt endpoint accessible',r.status===200);const receipt=await r.json();check('receiver independently confirms one receipt',receipt.externalId===externalId&&receipt.receiptCount===1);
  report.status='passed';
 }catch{report.status='failed';report.failure='Stopped at failed check or network error. Retain synthetic record for review; do not delete or replay automatically.';}
 finally{if(cookie)try{const r=await post('/api/admin?action=logout',{});if(!r.ok)report.cleanup='owner logout requires review';await r.body?.cancel();}catch{report.cleanup='owner logout requires review';}}
 return report;
}
