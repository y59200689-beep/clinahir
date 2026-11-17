import {readFile,writeFile,chmod} from 'node:fs/promises';import {randomBytes,createHash} from 'node:crypto';
import {sourceRef,query} from './remote-platform.mjs';
import {hostingApi,stagingProjectId,stagingOrigin} from './hosting-cli.mjs';
const report={executedAt:new Date().toISOString(),projectRef:sourceRef,hostingProjectId:stagingProjectId,productionCrm:'Owner confirmed no production CRM configured on 2026-11-16'};
try{
 const project=await hostingApi('/v9/projects/'+stagingProjectId);if(project.name!=='clinahir-staging'||project.ssoProtection?.deploymentType!=='all')throw Error('protected_staging_project_required');
 const keys=JSON.parse(await readFile('output/staging/target-cli-keys.json','utf8')).keys;const accounts=JSON.parse(await readFile('output/staging/test-accounts.json','utf8'));
 const development=await readFile('.env.local','utf8');const protectedRef=development.match(/https:\/\/([a-z]{20})\.supabase\.co/)?.[1];if(!protectedRef||protectedRef===sourceRef)throw Error('distinct_protected_project_required');
 const file='output/staging/hosting-secrets.json';let secrets;try{secrets=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;secrets={bypass:randomBytes(32).toString('hex'),crm:randomBytes(32).toString('hex'),cron:randomBytes(32).toString('hex')};await writeFile(file,JSON.stringify(secrets),{mode:0o600});await chmod(file,0o600);}
 if(secrets.bypass.length!==32){secrets.bypass=randomBytes(16).toString('hex');await writeFile(file,JSON.stringify(secrets),{mode:0o600});}
 if(!Object.hasOwn(project.protectionBypass??{},secrets.bypass))await hostingApi(`/v1/projects/${stagingProjectId}/protection-bypass`,{generate:{secret:secrets.bypass}},'PATCH');report.automationAccessConfigured=true;
 const sql=await readFile('scripts/staging/receiver-fixture.sql','utf8');await query(sourceRef,sql);report.receiverFixture={sha256:createHash('sha256').update(sql).digest('hex'),scope:'private synthetic receipt/control schema and service-role-only RPC; outside seven application migrations'};
 const env={CLINAHIR_ENV:'staging',VITE_APP_ENV:'staging',CLINAHIR_STAGING_ORIGIN:stagingOrigin,CLINAHIR_STAGING_SUPABASE_REF:sourceRef,CLINAHIR_PRODUCTION_SUPABASE_REF:protectedRef,SUPABASE_URL:`https://${sourceRef}.supabase.co`,SUPABASE_SERVICE_ROLE_KEY:keys.find(k=>k.name==='service_role').api_key,CLINAHIR_ADMIN_EMAIL:accounts.owner.email,CLINAHIR_ADMIN_USER_ID:accounts.owner.id,CRON_SECRET:secrets.cron,DAILY_COMMAND_URL:stagingOrigin,CLINAHIR_STAGING_CRM_ORIGIN:stagingOrigin,CLINAHIR_PRODUCTION_CRM_CONFIGURED:'false',CLINAHIR_INTEGRATION_SECRET:secrets.crm,WHATSAPP_ENABLED:'false',VITE_SENTRY_ENABLED:'false',CLINAHIR_STAGING_RECEIVER_ENABLED:'true',STAGING_PROTECTION_BYPASS:secrets.bypass};
 for(const [key,value]of Object.entries(env))await hostingApi(`/v10/projects/${stagingProjectId}/env?upsert=true`,{key,value,type:'encrypted',target:['preview']});
 await writeFile('output/staging/hosting-env.json',JSON.stringify(env),{mode:0o600});await chmod('output/staging/hosting-env.json',0o600);report.environmentKeys=Object.keys(env);report.status='configured_not_deployed';
}catch(e){report.status='failed';report.failure=e.message;process.exitCode=1;}
await writeFile('docs/clinahir-upgrade/staging-execution/hosting-configuration.json',JSON.stringify(report,null,2)+'\n');console.log(report.status);
