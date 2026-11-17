// Offline rehearsal only: never reads database/export credentials or calls a hosted service.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {createHash,randomUUID} from 'node:crypto';
import {decryptBackup} from './backup-crypto.mjs';

const base='docs/clinahir-upgrade/final-gates/production',dir='output/production/migration-rehearsal';
await mkdir(dir,{recursive:true,mode:0o700});
const backup=JSON.parse(await readFile(base+'/encrypted-backup.json','utf8'));
const authorization=JSON.parse(await readFile(base+'/backup-authorization.json','utf8'));
if(authorization.executionStatus!=='backup_recovery_gate_passed'||backup.projectRef!=='jsagrvxgydvhdoxibzny')throw Error('closed_exact_source_backup_gate_required');
const hash=x=>createHash('sha256').update(x).digest('hex');
const cipher=await readFile('output/production/independent-download.aesgcm');
if(hash(cipher)!==backup.encryptedSha256)throw Error('ciphertext_mismatch');
const key=Buffer.from((await readFile(backup.keyPath,'utf8')).trim(),'hex');
const plain=decryptBackup(cipher,key);key.fill(0);
if(hash(plain)!==backup.plaintextSha256)throw Error('plaintext_mismatch');
const image='public.ecr.aws/supabase/postgres:17.11.0.006',container='clinahir-migration-'+randomUUID().slice(0,8);
const report={executedAt:new Date().toISOString(),projectRef:backup.projectRef,backupId:backup.id,backupSha256:backup.plaintextSha256,scope:'Offline production application upgrade rehearsal only; no hosted writes, Auth/Storage or live delivery',image,checks:[],productionChanges:false,activationAuthorized:false};
let created=false;
const command=(args,input)=>new Promise((resolve,reject)=>{
 const p=spawn('docker',args,{stdio:['pipe','pipe','pipe']});let out=[],err=[];
 p.on('error',reject);p.stdout.on('data',x=>out.push(x));p.stderr.on('data',x=>err.push(x));p.stdin.on('error',()=>{});
 p.on('close',code=>resolve({code,out:Buffer.concat(out),err:Buffer.concat(err).toString()}));p.stdin.end(input);
});
const sql=(text,db='postgres')=>command(['exec','-i',container,'psql','-X','-qAt','-h','/tmp','-U','postgres','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose',db],text);
async function query(text,db){const r=await sql(text,db);if(r.code!==0){await writeFile(dir+'/private-diagnostic.txt',r.err,{mode:0o600});throw Error('local_sql_failed_'+(r.err.match(/ERROR:\s+([A-Z0-9]{5})/)?.[1]??'unknown'));}return r.out.toString().trim();}
function check(name,ok){report.checks.push({name,passed:ok});if(!ok)throw Error(name);console.log('PASS '+name);}
const catalogSql=await readFile('scripts/staging/production-catalog.sql','utf8');
const catalog=async()=>JSON.parse(await query(catalogSql));
const snapshot=async(excludeNew=false)=>JSON.parse(await query('select json_agg(x order by name) from ('+backup.tables.map(t=>`select '${t.name}' as name,count(*)::int as rows,md5(coalesce(string_agg(${excludeNew&&t.name==='clinahir_leads'?"(to_jsonb(t)-'admin_stage'-'admin_notes')":"to_jsonb(t)"}::text,E'\\n' order by ${excludeNew&&t.name==='clinahir_leads'?"(to_jsonb(t)-'admin_stage'-'admin_notes')":"to_jsonb(t)"}::text),'')) as digest from public.${t.name} t`).join(' union all ')+') x;'));
const bool=async(name,text)=>check(name,await query(text)==='t');
try{
 check('independently downloaded backup authenticated and checksum verified',true);
 const start=await command(['run','--detach','--rm','--name',container,'--network','none','--user','postgres','--entrypoint','sh',image,'-c','initdb -D /tmp/clinahir-data -A trust -U postgres >/tmp/init.log && exec postgres -D /tmp/clinahir-data -c listen_addresses= -k /tmp']);check('fresh local PostgreSQL container created',start.code===0);created=true;
 const inspect=await command(['inspect','--format','{{json .HostConfig.NetworkMode}} {{json .HostConfig.PortBindings}} {{json .Mounts}}',container]);check('container isolated with no network ports or host mounts',inspect.code===0&&inspect.out.toString().trim()==='"none" {} []');
 for(let i=0;;i++){if((await sql('select 1;')).code===0)break;if(i>100)throw Error('postgres_timeout');await new Promise(r=>setTimeout(r,200));}
 await query('create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create role supabase_admin nologin;create role authenticator nologin;grant usage on schema public to anon,authenticated,service_role;');
 await query('begin;\n'+plain.toString()+'\ncommit;');plain.fill(0);check('original production application backup restored without schema reconciliation',true);
 const before=await snapshot();check('restored original row digests equal backup receipt',JSON.stringify(before)===JSON.stringify(backup.tables));
 const initial=await catalog();await writeFile(base+'/restored-baseline-catalog.json',JSON.stringify(initial,null,2)+'\n');
 if(process.argv.includes('--inspect')){report.status='baseline_inspected';}
 else{
  const manifest=JSON.parse(await readFile(base+'/migration-candidate.json','utf8'));
  const candidate=await readFile(manifest.candidatePath,'utf8');
  check('candidate hash matches frozen manifest',hash(candidate)===manifest.candidateSha256);report.candidateSha256=manifest.candidateSha256;report.candidatePath=manifest.candidatePath;
  const fingerprint=hash(JSON.stringify(initial));
  check('restored baseline metadata matches migration precondition',fingerprint===manifest.baselineFingerprint);report.baselineFingerprint=fingerprint;
  const fail=await sql(candidate.replace(/commit;\s*$/i,"do $$begin raise exception 'intentional_rollback_probe';end$$;\ncommit;"));
  check('injected migration failure rejected',fail.code!==0&&fail.err.includes('intentional_rollback_probe'));
  check('failed migration restores complete original catalog',JSON.stringify(await catalog())===JSON.stringify(initial));
  check('failed migration preserves all original row digests',JSON.stringify(await snapshot())===JSON.stringify(before));
  await query(candidate);check('exact candidate migration commits on restored production baseline',true);
  check('all original fields and rows unchanged after migration',JSON.stringify(await snapshot(true))===JSON.stringify(before));
  const after=await catalog();await writeFile(base+'/rehearsed-target-catalog.json',JSON.stringify(after,null,2)+'\n');
  check('five new private tables added',after.relations.filter(r=>r.relkind==='r').length===8);
  check('all eight application tables retain RLS',after.relations.filter(r=>r.relkind==='r').every(r=>r.relrowsecurity));
  check('all application routines are invoker with restricted search_path',after.routines.every(r=>!r.prosecdef&&r.definition.includes("SET search_path TO ''")));
  check('all application routines deny browser roles',after.routines.every(r=>!r.anon_execute&&!r.authenticated_execute&&r.service_execute));
  check('application views use invoker permissions',after.relations.filter(r=>r.relkind==='v').every(r=>r.reloptions?.includes('security_invoker=true')));
  await bool('legacy UUID primary key and unique external ID preserved',"select exists(select 1 from pg_constraint where conrelid='public.clinahir_leads'::regclass and contype='p' and pg_get_constraintdef(oid)='PRIMARY KEY (id)') and exists(select 1 from pg_constraint where conrelid='public.clinahir_leads'::regclass and contype='u' and pg_get_constraintdef(oid)='UNIQUE (external_id)');");
  await bool('existing timestamp trigger preserved',"select exists(select 1 from pg_trigger where tgrelid='public.clinahir_leads'::regclass and tgname='clinahir_leads_update_timestamp');");
  await bool('migration adds no messaging jobs or fictional business records',"select (select count(*) from public.clinahir_whatsapp_jobs)=0 and (select count(*) from public.clinahir_prospects)=0 and (select count(*) from public.clinahir_admin_audit)=0 and (select count(*) from public.clinahir_site_content where id and draft is null and published is null and version=0)=1;");
  for(const role of ['anon','authenticated'])for(const table of after.relations.filter(r=>r.relkind==='r'||r.relkind==='v')){
   const n=table.relname; if(!/^clinahir_[a-z0-9_]+$/.test(n))throw Error('invalid_table_name');
   const denied=await sql(`set role ${role};select * from public.${n} limit 1;`);check(role+' actual read denied '+n,denied.code!==0&&denied.err.includes('42501'));
   if(table.relkind==='r')for(const action of ['insert','update','delete']){
    const first=after.columns.find(c=>c.table_name===n&&c.is_identity==='NO'&&c.is_generated==='NEVER').column_name;
    const statement=action==='insert'?`insert into public.${n} default values`:action==='update'?`update public.${n} set ${first}=${first} where false`:`delete from public.${n} where false`;
    const deniedWrite=await sql(`set role ${role};${statement};`);check(role+' actual '+action+' denied '+n,deniedWrite.code!==0&&deniedWrite.err.includes('42501'));
   }
  }
  for(const role of ['anon','authenticated']){const denied=await sql(`set role ${role};select public.clinahir_admin_snapshot();`);check(role+' private admin RPC denied',denied.code!==0&&denied.err.includes('42501'));}
  // All workflow mutations below are fictional and rolled back inside the disconnected container.
  const assertions=await readFile('scripts/staging/production-migration-assertions.sql','utf8');await query(assertions);check('transactional legacy/new capture CMS prospects retry and audit acceptance',true);
  await bool('RLS hides all leads even under a temporary SELECT grant',"begin;grant select on public.clinahir_leads to anon;set role anon;select count(*)=0 from public.clinahir_leads;reset role;rollback;");
  check('workflow probes rolled back without changing original rows',JSON.stringify(await snapshot(true))===JSON.stringify(before));
  const rerun=await sql(candidate);check('accidental candidate reapplication is rejected by baseline guard',rerun.code!==0&&rerun.err.includes('production_baseline_mismatch'));
  check('rejected reapplication leaves target catalog unchanged',JSON.stringify(await catalog())===JSON.stringify(after));
  report.status='passed';
 }
}catch(e){report.status='failed';report.failure=e.message;process.exitCode=1;console.error('FAIL '+e.message);}
finally{
 plain.fill(0);if(created){report.containerRemoved=(await command(['stop',container])).code===0;if(!report.containerRemoved){report.status='failed';process.exitCode=1;}}
 await writeFile(base+(process.argv.includes('--inspect')?'/migration-baseline-inspection.json':'/migration-rehearsal.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:report.status,checks:report.checks.length,containerRemoved:report.containerRemoved,failure:report.failure}));
}
