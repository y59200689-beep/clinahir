// Only inspect the exact staging reference supplied by the owner. No schema changes or key retrieval.
import {execFileSync} from 'node:child_process';import {writeFile} from 'node:fs/promises';import {loadEnv} from 'vite';
const ref='fsfqgionuuxykpoxhrdm';const token=execFileSync('/usr/bin/security',['find-generic-password','-s','Supabase CLI','-a','supabase','-w'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const report={checkedAt:new Date().toISOString(),targetRef:ref,mode:'exact-owner-target read-only discovery',distinctFromDevelopment:loadEnv('development',process.cwd(),'').SUPABASE_URL!==`https://${ref}.supabase.co`,checks:{}};
const request=(path,init={})=>fetch('https://api.supabase.com'+path,{...init,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},redirect:'error',signal:AbortSignal.timeout(15000)});
let r=await request('/v1/projects/'+ref);report.checks.project={httpStatus:r.status};
if(r.ok){const d=await r.json();report.checks.project.metadata={id:d.id,name:d.name,status:d.status,organizationId:d.organization_id,region:d.region};
 if(d.id===ref&&report.distinctFromDevelopment){r=await request(`/v1/projects/${ref}/database/query`,{method:'POST',body:JSON.stringify({query:"begin transaction read only;select schemaname,tablename,rowsecurity from pg_catalog.pg_tables where schemaname in ('public','supabase_migrations') order by schemaname,tablename;rollback;"})});report.checks.schema={httpStatus:r.status};if(r.ok)report.checks.schema.tables=await r.json();else await r.body?.cancel();}
}else await r.body?.cancel();
await writeFile('docs/clinahir-upgrade/staging-execution/target-preflight.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(report.checks.project.httpStatus!==200||report.checks.schema?.httpStatus!==201&&report.checks.schema?.httpStatus!==200)process.exitCode=1;
