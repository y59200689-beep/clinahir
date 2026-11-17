// Read-only validation of explicit private setup. Never loads .env.local or mutates accounts.
import {readFile,writeFile} from 'node:fs/promises';
const path='output/production/runtime-configuration.json',env=JSON.parse(await readFile(path,'utf8'));
if(env.projectRef!=='jsagrvxgydvhdoxibzny'||env.SUPABASE_URL!=='https://jsagrvxgydvhdoxibzny.supabase.co')throw Error('exact_production_setup_required');
const report={checkedAt:new Date().toISOString(),projectRef:env.projectRef,scope:'Explicit private configuration; read-only service access and chosen owner metadata only',checks:[],productionChanges:false};
const check=(name,ok)=>{report.checks.push({name,passed:ok});console.log((ok?'PASS ':'PENDING ')+name);};
try{
 const key=env.SUPABASE_SERVICE_ROLE_KEY;if(!key)throw Error('private_service_credential_required');
 const headers={apikey:key,Authorization:'Bearer '+key};
 const request=route=>fetch(env.SUPABASE_URL+route,{headers,redirect:'error',signal:AbortSignal.timeout(20000)});
 let response=await request('/rest/v1/clinahir_leads?select=external_id&limit=0');report.serviceHttpStatus=response.status;await response.body?.cancel();check('existing service credential can access exact production application API without selecting rows',response.status===200);
 if(response.status!==200)throw Error('production_service_credential_rejected');
 response=await request('/auth/v1/admin/users?page=1&per_page=50');report.authMetadataHttpStatus=response.status;if(response.status!==200){await response.body?.cancel();throw Error('owner_metadata_access_unavailable');}
 const body=await response.json();const users=body.users??[];const matches=users.filter(u=>u.email?.toLowerCase()===env.CLINAHIR_ADMIN_EMAIL?.toLowerCase());
 report.owner={matchingChosenEmail:matches.length,exists:matches.length===1,verifiedTotp:matches.length===1&&(matches[0].factors??[]).some(f=>f.factor_type==='totp'&&f.status==='verified')};
 if(matches.length===1){report.owner.id=matches[0].id;report.owner.emailConfirmed=!!matches[0].email_confirmed_at;if(env.CLINAHIR_ADMIN_USER_ID&&env.CLINAHIR_ADMIN_USER_ID!==matches[0].id)throw Error('chosen_owner_id_mismatch');}
 report.owner.mfaRequired=env.CLINAHIR_ADMIN_MFA_REQUIRED==='true';
 check('chosen production owner already exists',report.owner.exists);check('owner MFA matches explicit optional policy',!report.owner.mfaRequired||report.owner.verifiedTotp);
 report.missingInputs=['CRON_SECRET','CLINAHIR_INTEGRATION_SECRET','CLINAHIR_LEADS_USER_ID'].filter(k=>!env[k]);
 report.status=report.owner.exists&&(!report.owner.mfaRequired||report.owner.verifiedTotp)&&!report.missingInputs.length?'private_prerequisites_verified':'blocked_pending_owner_and_private_inputs';
}catch(e){report.status='blocked';report.failure=e.message;process.exitCode=1;}
await writeFile('docs/clinahir-upgrade/final-gates/production/private-configuration-verification.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,missingInputs:report.missingInputs,failure:report.failure}));
