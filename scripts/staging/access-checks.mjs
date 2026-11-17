import {httpsOrigin} from '../../.integration-build/server/environment.js';
export const privateTables=['clinahir_leads','clinahir_lead_limits','clinahir_whatsapp_jobs','clinahir_cron_runs','clinahir_site_content','clinahir_admin_audit','clinahir_prospects','clinahir_analytics_events','clinahir_delivery_health','clinahir_conversion_daily'];
export function hostingProtected(response){
 if([401,403].includes(response.status))return true;
 try{const url=new URL(response.headers.get('location'));return [302,303,307,308].includes(response.status)&&url.origin==='https://vercel.com'&&url.pathname==='/sso-api';}catch{return false;}
}
export function isPublicApiKey(key){
 if(typeof key!=='string')return false;
 if(key.startsWith('sb_publishable_'))return true;
 try{return JSON.parse(Buffer.from(key.split('.')[1]??'', 'base64url').toString()).role==='anon';}catch{return false;}
}
export function accessPrerequisites(env){
 const issues=[];
 if(env.STAGING_VERIFICATION_APPROVED!=='synthetic-staging-auth-only')issues.push('owner_authorization_required');
 if(env.CLINAHIR_ENV!=='staging'||env.VERCEL_ENV==='production')issues.push('staging_identity_required');
 const ref=env.CLINAHIR_STAGING_SUPABASE_REF??'',production=env.CLINAHIR_PRODUCTION_SUPABASE_REF??'';
 if(!/^[a-z]{20}$/.test(ref)||!/^[a-z]{20}$/.test(production)||ref===production||httpsOrigin(env.SUPABASE_URL)!==`https://${ref}.supabase.co`)issues.push('dedicated_database_identity_required');
 if(!httpsOrigin(env.CLINAHIR_STAGING_ORIGIN))issues.push('protected_site_origin_required');
 if(!isPublicApiKey(env.SUPABASE_ANON_KEY)||!env.STAGING_OWNER_EMAIL||!env.STAGING_OWNER_PASSWORD||!env.STAGING_NONOWNER_EMAIL||!env.STAGING_NONOWNER_PASSWORD||!env.STAGING_OWNER_ID||!env.STAGING_NONOWNER_ID||env.STAGING_NONOWNER_ID===env.STAGING_OWNER_ID)issues.push('restricted_role_accounts_required');
 if(env.WHATSAPP_ENABLED!=='false')issues.push('whatsapp_must_be_disabled');
 return issues;
}
export async function verifyStagingAccess(env,fetcher=fetch){
 const report={executedAt:new Date().toISOString(),scope:'Actual staging HTTP checks only when approved; no service-role access and no business-record writes',status:'blocked',prerequisites:accessPrerequisites(env),checks:[]};
 if(report.prerequisites.length)return report;
 const origin=httpsOrigin(env.CLINAHIR_STAGING_ORIGIN),supabase=httpsOrigin(env.SUPABASE_URL);let ownerCookie,nonownerToken;
 const siteHeaders=env.STAGING_PROTECTION_BYPASS?{'x-vercel-protection-bypass':env.STAGING_PROTECTION_BYPASS}:{};
 const run=async(name,url,init={})=>{
  const response=await fetcher(url,{...init,redirect:'manual',signal:AbortSignal.timeout(10000)});return response;
 };
 const check=(name,pass,status)=>{report.checks.push({name,passed:pass,...(status?{httpStatus:status}:{})});if(!pass)throw Error('verification_failed');};
 const dbHeaders=token=>({apikey:env.SUPABASE_ANON_KEY,...(token?{Authorization:`Bearer ${token}`}:{})});
 try{
  let r=await run('protection',origin+'/');check('unauthenticated hosting access is protected',hostingProtected(r),r.status);await r.body?.cancel();
  r=await run('environment',origin+'/api/environment',{headers:siteHeaders});check('environment endpoint accessible with approved protection access',r.status===200,r.status);check('server identifies staging',(await r.json()).environment==='staging');
  r=await run('public-key',supabase+'/auth/v1/settings',{headers:dbHeaders()});check('independent public API key accepted by Auth',r.status===200,r.status);await r.body?.cancel();
  r=await run('anon-admin',origin+'/api/admin?action=snapshot',{headers:siteHeaders});check('anonymous private API rejected',r.status===401,r.status);await r.body?.cancel();
  r=await run('invalid-login',origin+'/api/admin?action=login',{method:'POST',headers:{...siteHeaders,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({email:env.STAGING_OWNER_EMAIL,password:'synthetic-invalid-password-'+crypto.randomUUID()})});check('invalid owner credentials rejected',r.status===401,r.status);await r.body?.cancel();
  r=await run('nonowner-login',supabase+'/auth/v1/token?grant_type=password',{method:'POST',headers:{...dbHeaders(),'Content-Type':'application/json'},body:JSON.stringify({email:env.STAGING_NONOWNER_EMAIL,password:env.STAGING_NONOWNER_PASSWORD})});check('restricted test account authenticates',r.status===200,r.status);const account=await r.json();nonownerToken=account.access_token;check('actual non-owner account identity matches',Boolean(nonownerToken)&&account.user?.id===env.STAGING_NONOWNER_ID);
  r=await run('nonowner-admin',origin+'/api/admin?action=snapshot',{headers:{...siteHeaders,Cookie:'clinahir_admin_session='+encodeURIComponent(nonownerToken)}});check('authenticated non-owner API rejected',r.status===403,r.status);await r.body?.cancel();
  // Zero/one-row reads: any successful private access fails immediately. Never save returned rows.
  for(const [role,token]of [['anon',undefined],['authenticated-nonowner',nonownerToken]])for(const table of privateTables){
   r=await run('restricted-read',`${supabase}/rest/v1/${table}?select=*&limit=1`,{headers:dbHeaders(token)});const status=r.status;await r.body?.cancel();check(role+' cannot read '+table,[401,403].includes(status),status);

  }
  for(const [role,token]of [['anon',undefined],['authenticated-nonowner',nonownerToken]]) {r=await run('restricted-rpc',supabase+'/rest/v1/rpc/clinahir_admin_snapshot',{method:'POST',headers:{...dbHeaders(token),'Content-Type':'application/json'},body:'{}'});const status=r.status;await r.body?.cancel();check(role+' cannot execute private snapshot RPC',[401,403].includes(status),status);}
  r=await run('owner-login',origin+'/api/admin?action=login',{method:'POST',headers:{...siteHeaders,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({email:env.STAGING_OWNER_EMAIL,password:env.STAGING_OWNER_PASSWORD})});check('staging owner signs in',r.status===200,r.status);const cookie=r.headers.get('set-cookie')??'';ownerCookie=cookie.split(';')[0];check('session cookie is private and secure',/HttpOnly/i.test(cookie)&&/Secure/i.test(cookie)&&/SameSite=Strict/i.test(cookie));const signedIn=await r.json();check('owner identity matches configured account',signedIn.user?.email?.toLowerCase()===env.STAGING_OWNER_EMAIL.toLowerCase());
  r=await run('owner-provider-identity',supabase+'/auth/v1/user',{headers:dbHeaders(decodeURIComponent(ownerCookie.split('=').slice(1).join('=')))});check('owner provider identity readable',r.status===200,r.status);check('owner ID matches staging allowlist',(await r.json()).id===env.STAGING_OWNER_ID);
  for(const action of ['session','snapshot','content','prospects']){r=await run('owner-read',origin+'/api/admin?action='+action,{headers:{...siteHeaders,Cookie:ownerCookie}});check('owner can read '+action,r.status===200,r.status);await r.body?.cancel();}
  r=await run('logout',origin+'/api/admin?action=logout',{method:'POST',headers:{...siteHeaders,Origin:origin,Cookie:ownerCookie}});check('logout clears browser cookie',r.status===200&&/Max-Age=0/.test(r.headers.get('set-cookie')??''),r.status);await r.body?.cancel();
  r=await run('logout-replay',origin+'/api/admin?action=session',{headers:{...siteHeaders,Cookie:ownerCookie}});check('logged-out bearer cannot be replayed',r.status===401,r.status);await r.body?.cancel();ownerCookie=undefined;
  report.status='passed';
 }catch{report.status='failed';report.failure='Stopped at failed check or network error; no sensitive response content recorded.';}
 finally{
  if(ownerCookie){try{await (await run('cleanup-owner',origin+'/api/admin?action=logout',{method:'POST',headers:{...siteHeaders,Origin:origin,Cookie:ownerCookie}})).body?.cancel();}catch{report.cleanup='owner logout requires operator review';}}
  if(nonownerToken){try{const r=await run('cleanup-nonowner',supabase+'/auth/v1/logout',{method:'POST',headers:dbHeaders(nonownerToken)});await r.body?.cancel();if(!r.ok)report.cleanup='non-owner logout requires operator review';}catch{report.cleanup='non-owner logout requires operator review';}}
 }
 return report;
}
