import {readFile,writeFile,chmod} from 'node:fs/promises';
import {hostingApi,stagingProjectId} from './hosting-cli.mjs';
const file='output/staging/hosting-env.json',env=JSON.parse(await readFile(file,'utf8')),owner=JSON.parse(await readFile('output/staging/human-owner.json','utf8'));
if(env.CLINAHIR_STAGING_SUPABASE_REF!=='fsfqgionuuxykpoxhrdm'||owner.email!=='youssefmahir87@gmail.com'||!/^[-a-f0-9]{36}$/.test(owner.userId))throw Error('reviewed_staging_owner_required');
const project=await hostingApi('/v9/projects/'+stagingProjectId);
if(project.name!=='clinahir-staging'||project.ssoProtection?.deploymentType!=='all')throw Error('protected_staging_required');
try{await writeFile('output/staging/hosting-env.before-human-owner.json',JSON.stringify(env),{mode:0o600,flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e;}
const changes={CLINAHIR_ADMIN_EMAIL:owner.email,CLINAHIR_ADMIN_USER_ID:owner.userId,CLINAHIR_ADMIN_MFA_REQUIRED:'true'};
for(const[key,value]of Object.entries(changes))await hostingApi(`/v10/projects/${stagingProjectId}/env?upsert=true`,{key,value,type:'encrypted',target:['preview']});
Object.assign(env,changes);await writeFile(file,JSON.stringify(env),{mode:0o600});await chmod(file,0o600);
await writeFile('docs/clinahir-upgrade/launch-session/owner-configuration.json',JSON.stringify({executedAt:new Date().toISOString(),projectId:stagingProjectId,target:'preview',ownerId:owner.userId,ownerEmail:'youssef…@gmail.com',mfaRequired:true,status:'configured_for_next_preview',humanEnrollmentVerified:false,productionChanged:false},null,2)+'\n');
console.log('Human owner and mandatory MFA configured for dedicated Preview only.');
