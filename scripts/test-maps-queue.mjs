// Offline additive migration rehearsal; no hosted connection or production data.
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const name='clinahir-maps-sql-'+randomUUID().slice(0,8);
const docker=(args,input)=>execFileSync('docker',args,{encoding:'utf8',input,stdio:['pipe','pipe','pipe'],timeout:30000});
const sql=text=>docker(['exec','-i',name,'psql','-X','-qAt','-h','/tmp','-U','postgres','-v','ON_ERROR_STOP=1'],text).trim();
const actor='11111111-1111-4111-8111-111111111111',other='44444444-4444-4444-8444-444444444444',claim='33333333-3333-4333-8333-333333333333';
try{
 docker(['run','-d','--rm','--name',name,'--network','none','--user','postgres','--entrypoint','sh','public.ecr.aws/supabase/postgres:17.11.0.006','-c','initdb -D /tmp/maps-db -A trust -U postgres >/tmp/init.log && exec postgres -D /tmp/maps-db -c listen_addresses= -k /tmp']);
 for(let i=0;;i++){try{sql('select 1');break;}catch{if(i>80)throw Error('Postgres startup timed out');await new Promise(r=>setTimeout(r,200));}}
 sql('create role anon;create role authenticated;create role service_role bypassrls;');sql(readFileSync('supabase/migrations/20261118145558_hosted_maps_jobs.sql','utf8'));
 const call=(op,data={},who=actor)=>JSON.parse(sql(`select coalesce(public.clinahir_maps_job('${who}','${op}','${JSON.stringify(data).replaceAll("'","''")}'::jsonb),'null'::jsonb);`));
 let j=call('start',{keywords:'imaging',city:'Rabat'});const id=j.id;assert.equal(j.status,'queued');assert.equal(call('start',{keywords:'imaging',city:'Rabat'}).conflict,true);assert.equal(call('latest',{},other),null);
 j=call('claim',{claimToken:claim});assert.equal(j.status,'running');assert.equal(call('claim',{claimToken:claim}).id,id);assert.equal(call('claim',{claimToken:other}),null);
 assert.equal(call('progress',{id,token:other,results:[]}),null);assert.equal(call('progress',{id,token:claim,results:[{title:'Synthetic'}]}).results.length,1);
 assert.equal(call('stop',{id}).status,'stopped');assert.equal(call('finish',{id,token:claim,success:true,results:[]}),null);assert.equal(call('latest').results.length,1);
 sql(`update public.clinahir_maps_jobs set status='running',lease_until=now()-interval '1 minute' where id='${id}';`);assert.equal(call('start',{keywords:'dentists',city:'Rabat'}).status,'queued');assert.equal(sql(`select status from public.clinahir_maps_jobs where id='${id}'`),'failed');
 for(const role of ['anon','authenticated'])assert.equal(sql(`select has_table_privilege('${role}','public.clinahir_maps_jobs','select') or has_function_privilege('${role}','public.clinahir_maps_job(uuid,text,jsonb)','execute')`),'f');
 assert.equal(sql("select relrowsecurity from pg_class where oid='public.clinahir_maps_jobs'::regclass"),'t');console.log('PASS offline queue migration: isolation, RLS, private grants, idempotent claims, lease ownership, stop preservation and stale-worker recovery.');
}finally{docker(['rm','-f',name]);}
