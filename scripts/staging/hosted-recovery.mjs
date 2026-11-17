import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {sourceRef,restoreRef,query,pg,q} from './remote-platform.mjs';
const report={executedAt:new Date().toISOString(),sourceRef,restoreRef,scope:'Hosted synthetic application database and test receiver only; Auth users, Storage objects and infrastructure excluded',checks:[]};
const check=(name,passed)=>{report.checks.push({name,passed});if(!passed)throw Error('verification_failed');console.log('PASS',name);};
const credential=JSON.parse(await readFile('output/staging/backup-credential.json','utf8')),secrets=JSON.parse(await readFile('output/staging/provisioned-secrets.json','utf8'));
let granted=false;
const schemas=['public','clinahir_staging_fixture'];
const tables=await query(sourceRef,"select schemaname,tablename from pg_tables where schemaname in ('public','clinahir_staging_fixture') order by schemaname,tablename");
async function snapshot(ref){
 const rows=[];for(const {schemaname,tablename}of tables){const result=await query(ref,`select count(*)::int as rows,md5(coalesce(string_agg(to_jsonb(t)::text,E'\\n' order by to_jsonb(t)::text),'')) as digest from "${schemaname}"."${tablename}" t`);rows.push({schema:schemaname,table:tablename,...result[0]});}
 const constraints=await query(ref,"select n.nspname,c.relname,k.conname,pg_get_constraintdef(k.oid) as definition from pg_constraint k join pg_class c on c.oid=k.conrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','clinahir_staging_fixture') order by 1,2,3");
 return {rows,constraints};
}
try{
 check('backup login is restricted to exact staging project',credential.target===sourceRef&&/^[a-z0-9_]+$/.test(credential.role));
 const empty=await query(restoreRef,"select tablename from pg_tables where schemaname='public'");check('independent restore target contains no application tables',empty.length===0);
 // Expiring login gets SELECT only. Policies apply exclusively to this synthetic backup role.
 await query(sourceRef,`grant usage on schema public,clinahir_staging_fixture to ${credential.role};grant select on all tables in schema public,clinahir_staging_fixture to ${credential.role};grant select on all sequences in schema public,clinahir_staging_fixture to ${credential.role};`);granted=true;
 for(const {schemaname,tablename}of tables)await query(sourceRef,`create policy clinahir_temporary_recovery_read on "${schemaname}"."${tablename}" for select to ${credential.role} using(true);`);
 const before=await snapshot(sourceRef);
 const dump=await pg(sourceRef,credential.role,credential.password,'pg_dump',['--format=custom','--schema=public','--schema=clinahir_staging_fixture','--enable-row-security']);
 if(dump.code!==0){report.diagnostic=dump.err.replaceAll(credential.password,'[redacted]').slice(0,1200);throw Error('export_failed');}
 const path='output/staging/hosted-application.dump';await writeFile(path,dump.out,{mode:0o600});report.backup={bytes:dump.out.length,sha256:createHash('sha256').update(dump.out).digest('hex')};check('hosted backup readback checksum matches',createHash('sha256').update(await readFile(path)).digest('hex')===report.backup.sha256);
 check('source did not change during export',JSON.stringify(before)===JSON.stringify(await snapshot(sourceRef)));
 const listing=await pg(restoreRef,'postgres',secrets['clinahir-staging-restore'].databasePassword,'pg_restore',['--list'],dump.out);if(listing.code!==0)throw Error('archive_listing_failed');
 const listPath='output/staging/full-restore-list.txt';await writeFile(listPath,listing.out.toString().split('\n').filter(line=>!/^\d+;.* (SCHEMA - public|ACL - SCHEMA public|COMMENT - SCHEMA public|DEFAULT ACL) /.test(line)&&!line.includes('rls_auto_enable')).join('\n'),{mode:0o600});
 report.restorePolicy='Preserve target Supabase public schema/provider default ACLs and provider rls_auto_enable helper; restore application tables, routines, explicit grants, data and synthetic receiver.';
 const restoredSql=await pg(restoreRef,'postgres',secrets['clinahir-staging-restore'].databasePassword,'pg_restore',['--no-owner','--use-list=/restore-list.txt','--file=-'],dump.out,[[listPath,'/restore-list.txt']]);
 if(restoredSql.code!==0)throw Error('restore_sql_generation_failed');
 const reconcile=await readFile('scripts/staging/reconcile-private-restore.sql');
 const restored=await pg(restoreRef,'postgres',secrets['clinahir-staging-restore'].databasePassword,'psql',['-X','--set=ON_ERROR_STOP=1','--single-transaction','--dbname=postgres'],Buffer.concat([restoredSql.out,Buffer.from('\n'),reconcile]));
 if(restored.code!==0){report.diagnostic=restored.err.replaceAll(secrets['clinahir-staging-restore'].databasePassword,'[redacted]').slice(0,1400);throw Error('restore_failed');}check('actual hosted application archive restored independently',true);
 const after=await snapshot(restoreRef);for(const row of before.rows){const other=after.rows.find(r=>r.schema===row.schema&&r.table===row.table);check('full-row digest and count match '+row.schema+'.'+row.table,JSON.stringify(row)===JSON.stringify(other));}
 check('all restored constraints match',JSON.stringify(before.constraints)===JSON.stringify(after.constraints));report.manifest=before;
 const denied=await query(restoreRef,"select tablename,has_table_privilege('anon',quote_ident(schemaname)||'.'||quote_ident(tablename),'select') as anon_select,has_table_privilege('authenticated',quote_ident(schemaname)||'.'||quote_ident(tablename),'select') as authenticated_select from pg_tables where schemaname='public'");check('restored private table grants reject both browser roles',denied.length===8&&denied.every(t=>!t.anon_select&&!t.authenticated_select));report.status='passed';
}catch(e){report.status='failed';report.failure=e.message;process.exitCode=1;}
finally{
 if(granted)for(const ref of [sourceRef,restoreRef]){try{const actual=await query(ref,"select schemaname,tablename from pg_tables where schemaname in ('public','clinahir_staging_fixture')");for(const {schemaname,tablename}of actual)await query(ref,`drop policy if exists clinahir_temporary_recovery_read on "${schemaname}"."${tablename}";`);for(const schema of [...new Set(actual.map(t=>t.schemaname))])await query(ref,`revoke select on all tables in schema "${schema}" from ${credential.role};revoke select on all sequences in schema "${schema}" from ${credential.role};revoke usage on schema "${schema}" from ${credential.role};`);}catch{report.cleanup='temporary backup role grants/policies require review';}}
}
await writeFile('docs/clinahir-upgrade/staging-execution/hosted-recovery.json',JSON.stringify(report,null,2)+'\n');console.log(report.status);
