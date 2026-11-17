// Temporary recovery credential for the exact empty staging project. Owner's password is not changed.
import {execFileSync} from 'node:child_process';import {randomBytes} from 'node:crypto';import {readFile,writeFile,chmod} from 'node:fs/promises';
const ref='fsfqgionuuxykpoxhrdm',token=execFileSync('/usr/bin/security',['find-generic-password','-s','Supabase CLI','-a','supabase','-w'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const call=query=>fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query}),redirect:'error',signal:AbortSignal.timeout(15000)});
const savedPath='output/staging/backup-credential.json';let saved;try{saved=JSON.parse(await readFile(savedPath,'utf8'));}catch{}
const report={executedAt:new Date().toISOString(),target:ref,scope:'temporary staging-only backup login; original owner password unchanged'};
if(saved?.target===ref){report.status='existing_private_credential_retained';}
else{
 let r=await call("begin transaction read only;select tablename from pg_tables where schemaname='public';rollback;");if(!r.ok)throw Error('staging_catalog_unavailable');const tables=await r.json();if(tables.length)throw Error('nonempty_staging_requires_review');
 const role='clinahir_stage_backup_'+randomBytes(5).toString('hex'),password=randomBytes(36).toString('base64url'),expiresAt=new Date(Date.now()+2*60*60*1000).toISOString();
 r=await call(`begin;create role ${role} login noinherit password '${password}' valid until '${expiresAt}';grant connect on database postgres to ${role};grant usage on schema public to ${role};commit;`);report.httpStatus=r.status;
 if(r.ok){saved={target:ref,role,password,expiresAt};await writeFile(savedPath,JSON.stringify(saved,null,2)+'\n',{mode:0o600});await chmod(savedPath,0o600);report.status='created';report.expiresAt=expiresAt;}else{const d=await r.json().catch(()=>({}));report.status='blocked';report.reason=String(d.message??'Role configuration rejected').replaceAll(password,'[redacted]').slice(0,400);process.exitCode=1;}
}
await writeFile('docs/clinahir-upgrade/staging-execution/backup-credential-setup.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
