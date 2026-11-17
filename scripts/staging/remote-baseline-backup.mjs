import {readFile,writeFile,chmod} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {sourceRef,restoreRef,query,pg} from './remote-platform.mjs';
const report={executedAt:new Date().toISOString(),sourceRef,restoreRef,scope:'hosted public application-schema baseline only; managed Auth/Storage and infrastructure not included',checks:[]};
const check=(name,ok)=>{report.checks.push({name,passed:ok});if(!ok)throw Error(name);console.log('PASS',name);};
try{
 const source=await query(sourceRef,"begin transaction read only;select tablename from pg_tables where schemaname='public';rollback;");const restored=await query(restoreRef,"begin transaction read only;select tablename from pg_tables where schemaname='public';rollback;");check('both supplied staging and isolated restore application schemas are empty',source.length===0&&restored.length===0);
 const credential=JSON.parse(await readFile('output/staging/backup-credential.json','utf8'));const secrets=JSON.parse(await readFile('output/staging/provisioned-secrets.json','utf8'));check('backup credential belongs to exact staging target',credential.target===sourceRef);
 // Source schema ACL contains this temporary read-only role; recreate it without login on the restore target.
 await query(restoreRef,`do $$begin if not exists(select from pg_roles where rolname='${credential.role}') then create role ${credential.role} nologin;end if;end$$;`);
 const dump=await pg(sourceRef,credential.role,credential.password,'pg_dump',['--format=custom','--schema=public','--enable-row-security']);
 if(dump.code!==0){report.connectionDiagnostic=dump.err.replaceAll(credential.password,'[redacted]').slice(0,1500);throw Error('baseline_export_failed');}check('actual hosted baseline exported over verified TLS',dump.out.length>0);
 const path='output/staging/baseline-'+sourceRef+'.dump';await writeFile(path,dump.out,{mode:0o600});await chmod(path,0o600);const checksum=createHash('sha256').update(dump.out).digest('hex');check('private baseline checksum verified after readback',createHash('sha256').update(await readFile(path)).digest('hex')===checksum);report.backup={bytes:dump.out.length,sha256:checksum};
 const listing=await pg(restoreRef,'postgres',secrets['clinahir-staging-restore'].databasePassword,'pg_restore',['--list'],dump.out);
 if(listing.code!==0)throw Error('archive_listing_failed');
 // Supabase provisions public and its provider ACLs. Preserve those; restore only application objects.
 const listPath='output/staging/baseline-restore-list.txt';
 await writeFile(listPath,listing.out.toString().split('\n').filter(line=>!/^\d+;.* (SCHEMA - public|ACL - SCHEMA public|COMMENT - SCHEMA public|DEFAULT ACL) /.test(line)).join('\n'),{mode:0o600});
 report.restorePolicy='Preserve target provider public schema, schema ACL/comment and provider default privileges; replay application objects only. Empty application baseline has no such objects.';
 const restore=await pg(restoreRef,'postgres',secrets['clinahir-staging-restore'].databasePassword,'pg_restore',['--no-owner','--single-transaction','--exit-on-error','--use-list=/restore-list.txt','--dbname=postgres'],dump.out,[[listPath,'/restore-list.txt']]);
 if(restore.code!==0){report.restoreDiagnostic=restore.err.replaceAll(secrets['clinahir-staging-restore'].databasePassword,'[redacted]').slice(0,1500);throw Error('baseline_restore_failed');}check('hosted baseline restored into independent Supabase project',true);
 const after=await query(restoreRef,"begin transaction read only;select tablename from pg_tables where schemaname='public';rollback;");check('restored application baseline remains empty',after.length===0);report.status='passed';
}catch(error){report.status='failed';report.failure=String(error.message).slice(0,200);process.exitCode=1;console.error(report.failure);}
await writeFile('docs/clinahir-upgrade/staging-execution/hosted-baseline-backup.json',JSON.stringify(report,null,2)+'\n');
