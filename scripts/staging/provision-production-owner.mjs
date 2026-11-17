import {readFile,writeFile} from 'node:fs/promises';
const base='docs/clinahir-upgrade/final-gates/production',path='output/production/runtime-configuration.json';
const authorization=JSON.parse(await readFile(base+'/release-authorization.json','utf8'));
const env=JSON.parse(await readFile(path,'utf8'));
if(!authorization.productionActivationAuthorized||env.projectRef!=='jsagrvxgydvhdoxibzny'||env.CLINAHIR_ADMIN_EMAIL!=='youssefmahir87@gmail.com')throw Error('reviewed_owner_authorization_required');
const headers={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'};
const call=(route,body)=>fetch(env.SUPABASE_URL+'/auth/v1/'+route,{method:body?'POST':'GET',headers,...(body?{body:JSON.stringify(body)}:{}),redirect:'error',signal:AbortSignal.timeout(20000)});
const listed=await call('admin/users?page=1&per_page=100');if(!listed.ok)throw Error('owner_inventory_failed');
const users=(await listed.json()).users??[];let owner=users.find(u=>u.email?.toLowerCase()===env.CLINAHIR_ADMIN_EMAIL);let created=false;
if(!owner){const response=await call('admin/users',{email:env.CLINAHIR_ADMIN_EMAIL,email_confirm:false});if(!response.ok)throw Error('owner_creation_failed_'+response.status);owner=await response.json();created=true;}
env.CLINAHIR_ADMIN_USER_ID=owner.id;
const proposed=JSON.parse(await readFile('output/production/proposed-secret-replacements.json','utf8'));
if(proposed.projectRef!==env.projectRef)throw Error('secret_proposal_target_mismatch');
env.CRON_SECRET=proposed.CRON_SECRET;env.CLINAHIR_INTEGRATION_SECRET=proposed.CLINAHIR_INTEGRATION_SECRET;
await writeFile(path,JSON.stringify(env)+'\n',{mode:0o600});
await writeFile(base+'/owner-provisioning.json',JSON.stringify({executedAt:new Date().toISOString(),projectRef:env.projectRef,ownerEmail:env.CLINAHIR_ADMIN_EMAIL,ownerId:owner.id,created,passwordGenerated:false,emailSent:false,mfaEnrolled:false,status:'owner_created_pending_private_password_and_mfa',productionHostingChanged:false},null,2)+'\n');
console.log(JSON.stringify({status:'owner_prepared',ownerId:owner.id,created,passwordGenerated:false,emailSent:false}));
