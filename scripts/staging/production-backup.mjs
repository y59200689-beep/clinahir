// Approved exact-source read-only export. No roles, grants, policies or production writes.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {randomBytes,createHash} from 'node:crypto';
import {encryptBackup,decryptBackup} from './backup-crypto.mjs';
const ref='jsagrvxgydvhdoxibzny',dir='output/production',receipt='docs/clinahir-upgrade/final-gates/production';
const scheduled=process.argv.includes('--scheduled');
const originalBackup=scheduled?JSON.parse(await readFile(receipt+'/encrypted-backup.json','utf8')):null;
const credential=JSON.parse(await readFile(dir+'/export-credential.json','utf8'));
if(credential.projectRef!==ref||credential.user!=='postgres.'+ref||credential.host!=='aws-0-eu-west-1.pooler.supabase.com'||credential.port!==5432)throw Error('exact_production_identity_required');
const image='public.ecr.aws/supabase/postgres:17.11.0.006';
const env={PGHOST:credential.host,PGPORT:'5432',PGUSER:credential.user,PGPASSWORD:credential.password,PGDATABASE:'postgres',PGSSLMODE:'verify-full',PGSSLROOTCERT:'/ca.crt',PGCONNECT_TIMEOUT:'15',PGOPTIONS:'-c default_transaction_read_only=on -c statement_timeout=120000'};
if(process.argv.includes('--direct')){env.PGHOST='db.'+ref+'.supabase.co';env.PGUSER='postgres';}
function run(args,input,environment={}){return new Promise((res,rej)=>{const p=spawn('docker',args,{env:{...process.env,...environment},stdio:['pipe','pipe','pipe']});let out=[],err=[];p.on('error',rej);p.stdout.on('data',x=>out.push(x));p.stderr.on('data',x=>err.push(x));p.stdin.on('error',()=>{});p.on('close',code=>res({code,out:Buffer.concat(out),err:Buffer.concat(err).toString().replaceAll(credential.password,'[redacted]')}));p.stdin.end(input);});}
const pg=(tool,args=[],input)=>run(['run','--rm','-i','--network','bridge','--mount',`type=bind,src=${resolve('output/staging/supabase-ca.crt')},dst=/ca.crt,readonly`,...Object.keys(env).flatMap(k=>['--env',k]),'--entrypoint',tool,image,...args],input,env);
async function query(sql){const r=await pg('psql',['-X','-qAt','-v','ON_ERROR_STOP=1','-c','begin transaction read only;'+sql+';rollback;']);if(r.code!==0){await writeFile(dir+'/connection-diagnostic.txt',r.err,{mode:0o600});throw Error('read_only_connection_failed_private_diagnostic_saved');}return JSON.parse(r.out.toString());}
const report={checkedAt:new Date().toISOString(),projectRef:ref,scope:'Clinahir public application objects/data only; no managed Auth/Storage',productionChanges:false,checks:[]};
function check(name,ok){report.checks.push({name,passed:ok});if(!ok)throw Error(name);console.log('PASS '+name);}
await mkdir(dir,{recursive:true,mode:0o700});
try{
 const identity=await query("select json_build_object('user',current_user,'database',current_database(),'readOnly',current_setting('transaction_read_only'),'ssl',(select ssl from pg_stat_ssl where pid=pg_backend_pid()),'version',current_setting('server_version'),'projectRef',current_setting('app.settings.project_ref',true))");
 report.identity=identity;
 check('verified TLS and forced read-only session',identity.readOnly==='on'&&identity.database==='postgres');
 const objects=await query("select coalesce(json_agg(x),'[]') from (select c.relname as name,c.relkind as kind from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p','v','m','S') order by 1) x");
 const initialNames=['clinahir_leads','clinahir_lead_limits','clinahir_analytics_events','clinahir_conversion_daily'];
 const targetCatalog=scheduled?JSON.parse(await readFile(receipt+'/rehearsed-target-catalog.json','utf8')):null;
 const upgradedNames=targetCatalog?.relations.map(r=>r.relname).sort();
 const names=objects.map(x=>x.name).sort();
 check('only approved application relations exist in public schema',JSON.stringify(names)===JSON.stringify(initialNames.sort())||(scheduled&&JSON.stringify(names)===JSON.stringify(upgradedNames)));report.objects=objects;
 const routines=await query("select coalesce(json_agg(x),'[]') from (select p.proname as name from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and not exists(select 1 from pg_depend d where d.classid='pg_proc'::regclass and d.objid=p.oid and d.deptype='e') order by 1) x");
 const applicationRoutines=routines.filter(x=>x.name.startsWith('clinahir_')).map(x=>x.name).sort();
 const initialRoutineNames=['clinahir_allow_lead','clinahir_capture_lead','clinahir_claim_lead','clinahir_finish_lead','clinahir_record_analytics','clinahir_replay_lead','clinahir_update_timestamp'].sort();
 const expectedRoutines=targetCatalog?.routines.map(r=>r.signature.split('(')[0]).sort();
 report.routines=routines;check('public routines are only Clinahir application routines',(JSON.stringify(applicationRoutines)===JSON.stringify(initialRoutineNames)||(scheduled&&JSON.stringify(applicationRoutines)===JSON.stringify(expectedRoutines)))&&routines.every(x=>x.name.startsWith('clinahir_')||x.name==='rls_auto_enable'));report.routines=routines;
 if(process.argv.includes('--preflight')){report.status='preflight_passed';}
 else{
  const tables=objects.filter(x=>x.kind==='r').map(x=>x.name);
  const snapshots=()=>query("select json_agg(x order by name) from ("+tables.map(t=>`select '${t}' as name,count(*)::int as rows,md5(coalesce(string_agg(to_jsonb(t)::text,E'\\n' order by to_jsonb(t)::text),'')) as digest from public.${t} t`).join(' union all ')+") x");
  const before=await snapshots();const dump=await pg('pg_dump',['--format=custom','--schema=public','--serializable-deferrable','--no-publications','--no-subscriptions']);
  check('read-only production application export completed',dump.code===0&&dump.out.length>0);
  check('source data digests stable across export',JSON.stringify(before)===JSON.stringify(await snapshots()));
  const listing=await pg('pg_restore',['--list'],dump.out);check('archive catalog readable',listing.code===0);const selected=listing.out.toString().split('\n').filter(l=>l.startsWith(';')||l.includes('clinahir_')).join('\n');await writeFile(dir+'/restore-list.txt',selected,{mode:0o600});const converted=await run(['run','--rm','-i','--network','none','--mount',`type=bind,src=${resolve(dir+'/restore-list.txt')},dst=/restore-list,readonly`,'--entrypoint','pg_restore',image,'--no-owner','--use-list=/restore-list','--file=-'],dump.out);check('provider routines excluded from application SQL archive',converted.code===0&&!converted.out.toString().includes('CREATE FUNCTION public.rls_auto_enable'));dump.out.fill(0);dump.out=converted.out;
  const hash=b=>createHash('sha256').update(b).digest('hex');
  if(scheduled){const custody=JSON.parse(await readFile(receipt+'/recovery-key-custody.json','utf8'));if(custody.backupId!==originalBackup.id||custody.status!=='owner_confirmed_offline_off_mac_copy_secured')throw Error('confirmed_production_key_custody_required');}
  const key=scheduled?Buffer.from((await readFile(originalBackup.keyPath,'utf8')).trim(),'hex'):randomBytes(32),encrypted=encryptBackup(dump.out,key);check('authenticated encryption round trip verified',decryptBackup(encrypted,key).equals(dump.out));
  const id=new Date().toISOString().replaceAll(/[:.]/g,'-');await mkdir(dir+'/keys',{mode:0o700,recursive:true});
  const keyPath=scheduled?originalBackup.keyPath:dir+'/keys/'+id+'.key';if(!scheduled)await writeFile(keyPath,key.toString('hex')+'\n',{mode:0o600,flag:'wx'});key.fill(0);
  const archivePath=dir+'/clinahir-production-'+id+'.sql.aesgcm';await writeFile(archivePath,encrypted,{mode:0o600,flag:'wx'});check('ciphertext disk checksum verified',hash(await readFile(archivePath))===hash(encrypted));
  Object.assign(report,{id,status:'encrypted_export_verified',archivePath,keyPath,plaintextSha256:hash(dump.out),encryptedSha256:hash(encrypted),bytes:encrypted.length,tables:before,keyCustody:scheduled?'existing separate production key with owner-confirmed offline copy':'private local file only; owner-held offline custody not yet confirmed'});dump.out.fill(0);
  const manifest={id,projectRef:ref,scope:report.scope,createdAt:report.checkedAt,plaintextSha256:report.plaintextSha256,encryptedSha256:report.encryptedSha256,bytes:report.bytes,encryption:'AES-256-GCM; CLINAHIR-BACKUP-V1',recoveryKey:'Stored separately; never included in Drive'};
  report.manifestPath=scheduled?dir+'/integrity-manifest-'+id+'.json':dir+'/integrity-manifest.json';await writeFile(report.manifestPath,JSON.stringify(manifest,null,2)+'\n',{mode:0o600});
 }
}catch(e){report.status='failed';report.failure=e.message;process.exitCode=1;console.error(e.message);}
if(scheduled&&process.argv.includes('--preflight')){await writeFile(receipt+'/upgrade-backup-preflight.json',JSON.stringify(report,null,2)+'\n');}
else if(scheduled){await mkdir(dir+'/offsite/runs',{recursive:true,mode:0o700});await writeFile(dir+'/offsite/latest.json',JSON.stringify(report,null,2)+'\n',{mode:0o600});await writeFile(dir+'/offsite/runs/'+(report.id??new Date().toISOString().replaceAll(/[:.]/g,'-'))+'.json',JSON.stringify(report,null,2)+'\n',{mode:0o600});}
else await writeFile(receipt+(process.argv.includes('--preflight')?'/export-preflight.json':'/encrypted-backup.json'),JSON.stringify(report,null,2)+'\n');
