import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {sourceRef,api,query,q} from './remote-platform.mjs';
const report={executedAt:new Date().toISOString(),projectRef:sourceRef,migrations:[]};
try{
 const baseline=JSON.parse(await readFile('docs/clinahir-upgrade/staging-execution/hosted-baseline-backup.json','utf8'));
 if(baseline.status!=='passed'||baseline.sourceRef!==sourceRef)throw Error('verified_baseline_required');
 const manifest=JSON.parse(await readFile('docs/clinahir-upgrade/phase3/release-manifest.json','utf8'));
 const reviewed=await Promise.all(manifest.migrations.map(async m=>{const sql=await readFile('supabase/migrations/'+m.name,'utf8');if(createHash('sha256').update(sql).digest('hex')!==m.sha256)throw Error('reviewed_hash_mismatch');return {...m,sql};}));
 const before=await api(sourceRef,'/database/migrations');
 if(!Array.isArray(before)||before.length)throw Error('empty_migration_history_required');
 const tables=await query(sourceRef,"select tablename from pg_tables where schemaname='public'");if(tables.length)throw Error('empty_application_schema_required');
 for(const m of reviewed){
  const [version,...nameParts]=m.name.replace(/\.sql$/,'').split('_');const name=nameParts.join('_');
  await api(sourceRef,'/database/migrations',{name:m.name.replace(/\.sql$/,''),query:m.sql});
  const rows=await query(sourceRef,`select version,name from supabase_migrations.schema_migrations where name=${q(m.name.replace(/\.sql$/,''))}`);
  if(rows.length!==1)throw Error('migration_receipt_ambiguous');
  const providerVersion=rows[0].version;
  // Normalize only the just-created receipt to the reviewed repository version.
  await query(sourceRef,`update supabase_migrations.schema_migrations set version=${q(version)},name=${q(name)} where version=${q(providerVersion)} and name=${q(m.name.replace(/\.sql$/,''))};`);
  const verified=await query(sourceRef,`select version,name from supabase_migrations.schema_migrations where version=${q(version)} and name=${q(name)}`);
  if(verified.length!==1)throw Error('migration_history_normalization_failed');
  report.migrations.push({name:m.name,sha256:m.sha256,providerVersion,version,status:'applied'});
  await writeFile('docs/clinahir-upgrade/staging-execution/hosted-migrations.json',JSON.stringify(report,null,2)+'\n');console.log('APPLIED',m.name);
 }
 report.tables=await query(sourceRef,"select tablename,rowsecurity from pg_tables where schemaname='public' order by tablename");
 if(report.tables.length!==8||report.tables.some(t=>!t.rowsecurity))throw Error('expected_eight_rls_tables_required');
 report.status='passed';
}catch(e){report.status='failed';report.failure=e.message;process.exitCode=1;console.error(report.failure);}
await writeFile('docs/clinahir-upgrade/staging-execution/hosted-migrations.json',JSON.stringify(report,null,2)+'\n');
