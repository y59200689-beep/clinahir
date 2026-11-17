// Read-only metadata/zero-row probes. No login, writes, deliveries, cron or secret output.
import { loadEnv } from 'vite';
import { writeFile, mkdir } from 'node:fs/promises';
const env = { ...loadEnv('development', process.cwd(), ''), ...process.env };
const keys = ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','CLINAHIR_ADMIN_EMAIL','CLINAHIR_ADMIN_USER_ID','DAILY_COMMAND_URL','CLINAHIR_INTEGRATION_SECRET','CRON_SECRET','WHATSAPP_ENABLED','WHATSAPP_ACCESS_TOKEN','WHATSAPP_PHONE_NUMBER_ID','WHATSAPP_API_VERSION','WHATSAPP_TEMPLATE_NAME','WHATSAPP_TEMPLATE_LANGUAGE','WHATSAPP_DEMO_URL'];
const report = { checkedAt: new Date().toISOString(), mode:'read-only; no data rows requested', configuration: Object.fromEntries(keys.map(key => [key, key==='WHATSAPP_ENABLED' ? env[key]==='true' : Boolean(env[key])])), probes: {}, limitations:['Zero-row HTTP probes establish endpoint access, not successful data persistence or installed migration history.','Without an independently configured public API key, anonymous RLS cannot be distinguished from API-gateway rejection.','No credentials were changed. No auth session, lead, CRM delivery, WhatsApp send or cron run was created.'] };
async function probe(name,path,{anonymous=false,owner=false}={}) {
  const key=anonymous?(env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY):env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    const response=await fetch(new URL(path,env.SUPABASE_URL),{headers:key?{apikey:key,Authorization:`Bearer ${key}`}:{},signal:AbortSignal.timeout(8000),redirect:'error'});
    report.probes[name]={status:response.status,access:response.ok?'reachable':'rejected'};
    if(owner&&response.ok){const result=await response.json();report.probes[name].matchesConfiguredOwner=result.id===env.CLINAHIR_ADMIN_USER_ID && result.email?.toLowerCase()===env.CLINAHIR_ADMIN_EMAIL?.toLowerCase();}
    if(anonymous)report.probes[name].publicKeyAvailable=Boolean(key);
    await response.body?.cancel().catch(()=>{});
  }catch{report.probes[name]={access:'unreachable_or_timeout'};}
}
let valid=false;try{const url=new URL(env.SUPABASE_URL);valid=url.protocol==='https:'&&/^[a-z]{20}\.supabase\.co$/.test(url.hostname)&&url.pathname==='/'&&!url.search&&!url.hash&&!url.username&&!url.password;}catch{}
if(valid&&env.SUPABASE_SERVICE_ROLE_KEY){
 await Promise.all([
  probe('leadTableZeroRows','/rest/v1/clinahir_leads?select=external_id&limit=0'),
  probe('contentTableZeroRows','/rest/v1/clinahir_site_content?select=version&limit=0'),
  probe('auditTableZeroRows','/rest/v1/clinahir_admin_audit?select=id&limit=0'),
  probe('whatsappTableZeroRows','/rest/v1/clinahir_whatsapp_jobs?select=external_id&limit=0'),
  probe('configuredOwner',`/auth/v1/admin/users/${encodeURIComponent(env.CLINAHIR_ADMIN_USER_ID||'')}`,{owner:true}),
  probe('anonymousLeadAccess','/rest/v1/clinahir_leads?select=external_id&limit=0',{anonymous:true}),
 ]);
}else report.probes.configuration={access:'missing_or_invalid_configuration'};
await mkdir('docs/clinahir-upgrade',{recursive:true});await writeFile('docs/clinahir-upgrade/phase2-readonly-results.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
