import {readFile,writeFile,chmod} from 'node:fs/promises';import {createHash} from 'node:crypto';import {crmRef,api,query,pg,docker,q} from './remote-platform.mjs';
const report={executedAt:new Date().toISOString(),projectRef:crmRef,scope:'New empty dedicated CRM sandbox only; no live CRM or Clinahir source migrations',migrations:[]};
try{
 const secretPath='output/staging/crm-sandbox-secrets.json',secrets=JSON.parse(await readFile(secretPath,'utf8'));if(secrets.projectRef!==crmRef)throw Error('sandbox_identity_mismatch');
 let ready=false;for(let i=0;i<20;i++){try{await query(crmRef,'begin transaction read only;select 1;rollback;');ready=true;break;}catch{await new Promise(r=>setTimeout(r,2000));}}if(!ready)throw Error('new_database_not_ready');
 const tables=await query(crmRef,"select tablename from pg_tables where schemaname='public'");const history=await api(crmRef,'/database/migrations');if(tables.length||history.length)throw Error('empty_new_sandbox_required');
 const plan=JSON.parse(await readFile('docs/clinahir-upgrade/next-milestone/crm-sandbox-plan.json','utf8'));const migrations=[];for(const m of plan.migrations){const sql=await readFile('output/staging/daily-command-sandbox/supabase/migrations/'+m.name,'utf8');if(createHash('sha256').update(sql).digest('hex')!==m.sha256)throw Error('source_hash_changed');migrations.push({...m,sql});}
 const baseline=await pg(crmRef,'postgres',secrets.databasePassword,'pg_dump',['--format=custom','--schema=public']);if(baseline.code!==0)throw Error('empty_baseline_export_failed');
 const listing=await docker(['run','--rm','-i','--network','none','--entrypoint','pg_restore','public.ecr.aws/supabase/postgres:17.11.0.006','--list'],baseline.out);if(listing.code!==0)throw Error('baseline_archive_unreadable');
 await writeFile('output/staging/crm-empty-baseline.dump',baseline.out,{mode:0o600});report.baseline={publicTables:0,migrationHistoryRows:0,sha256:createHash('sha256').update(baseline.out).digest('hex'),bytes:baseline.out.length,archiveReadable:true,independentHostedRestore:'Not performed; prior restore target paused with explicit approval'};
 const keys=await api(crmRef,'/api-keys');await writeFile('output/staging/crm-sandbox-keys.json',JSON.stringify(keys),{mode:0o600});await chmod('output/staging/crm-sandbox-keys.json',0o600);
 for(const m of migrations){
  const fullName=m.name.replace(/\.sql$/,''),[version,...suffix]=fullName.split('_');await api(crmRef,'/database/migrations',{name:fullName,query:m.sql});
  const receipt=await query(crmRef,`select version from supabase_migrations.schema_migrations where name=${q(fullName)}`);if(receipt.length!==1)throw Error('migration_receipt_ambiguous');await query(crmRef,`update supabase_migrations.schema_migrations set version=${q(version)},name=${q(suffix.join('_'))} where version=${q(receipt[0].version)} and name=${q(fullName)}`);
  report.migrations.push({name:m.name,sha256:m.sha256,providerVersion:receipt[0].version,version,status:'applied'});await writeFile('docs/clinahir-upgrade/next-milestone/crm-database.json',JSON.stringify(report,null,2)+'\n');console.log('APPLIED',m.name);
 }
 report.tables=await query(crmRef,"select tablename,rowsecurity from pg_tables where schemaname='public' order by tablename");if(report.tables.some(t=>!t.rowsecurity))throw Error('sandbox_rls_required_on_all_tables');report.status='passed';
}catch(e){report.status='failed';report.failure=e.message;process.exitCode=1;}
await writeFile('docs/clinahir-upgrade/next-milestone/crm-database.json',JSON.stringify(report,null,2)+'\n');console.log(report.status);
