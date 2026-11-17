// Uses only the CLI credential for the owner-confirmed organization. No secret is printed or written.
import {execFileSync} from 'node:child_process';import {writeFile} from 'node:fs/promises';
const organization='ictxrvikmelaingrsqzq';
let token=process.env.SUPABASE_ACCESS_TOKEN;
try{if(!token)token=execFileSync('/usr/bin/security',['find-generic-password','-s','Supabase CLI','-a','supabase','-w'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();}catch{}
const report={checkedAt:new Date().toISOString(),organization,mode:'read-only plan and provisioning entitlement checks',credentialAvailable:Boolean(token),checks:{}};
if(token)for(const [name,path]of [['organization',`/v1/organizations/${organization}`],['entitlements',`/v1/organizations/${organization}/entitlements`]]){
 try{const r=await fetch('https://api.supabase.com'+path,{headers:{Authorization:'Bearer '+token},redirect:'error',signal:AbortSignal.timeout(10000)});report.checks[name]={httpStatus:r.status};if(r.ok){const d=await r.json();if(name==='organization')report.checks[name].details={id:d.id,name:d.name,plan:d.plan};else report.checks[name].details=d;}else await r.body?.cancel();}catch{report.checks[name]={error:'unreachable_or_timeout'};}
}
await writeFile('docs/clinahir-upgrade/staging-execution/supabase-account-preflight.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
if(!token||Object.values(report.checks).some(c=>c.httpStatus!==200))process.exitCode=1;
