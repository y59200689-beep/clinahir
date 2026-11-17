import {execFileSync,spawn} from 'node:child_process';
import {resolve} from 'node:path';
export const sourceRef='fsfqgionuuxykpoxhrdm',restoreRef='xrfptjnsjckqgbvhvrwp',crmRef='wpjoszvojojuxmozkhkm';
const allowed=new Set([sourceRef,restoreRef,crmRef]);
const token=execFileSync('/usr/bin/security',['find-generic-password','-s','Supabase CLI','-a','supabase','-w'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
export async function api(ref,path='',body,method){
 if(!allowed.has(ref)||!path.startsWith('/'))throw Error('target_not_authorized');
 const r=await fetch(`https://api.supabase.com/v1/projects/${ref}${path}`,{method:method??(body?'POST':'GET'),headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),redirect:'error',signal:AbortSignal.timeout(30000)});
 if(!r.ok){await r.body?.cancel();throw Error('management_http_'+r.status);}const responseBody=await r.text();return responseBody.trim()?JSON.parse(responseBody):null;
}
export const query=(ref,sql)=>api(ref,'/database/query',{query:sql});
export function docker(args,input,environment={}){return new Promise(resolve=>{const c=spawn('docker',args,{env:{...process.env,...environment},stdio:['pipe','pipe','pipe']});const out=[],err=[];c.stdout.on('data',d=>out.push(d));c.stderr.on('data',d=>err.push(d));c.on('error',()=>resolve({code:1,out:Buffer.alloc(0),err:'process_failed'}));c.on('close',code=>resolve({code,out:Buffer.concat(out),err:Buffer.concat(err).toString()}));c.stdin.end(input);});}
export async function pg(ref,user,password,tool,args,input,mounts=[]){
 const poolers=await api(ref,'/config/database/pooler');const host=poolers[0]?.db_host;if(!/^[a-z0-9-]+\.pooler\.supabase\.com$/.test(host??''))throw Error('unverified_pooler_host');
 const environment={PGHOST:host,PGPORT:'5432',PGUSER:user+'.'+ref,PGPASSWORD:password,PGDATABASE:'postgres',PGSSLMODE:'verify-full',PGSSLROOTCERT:'/supabase-ca.crt',PGCONNECT_TIMEOUT:'10'};
 return docker(['run','--rm','-i','--network','bridge','--mount',`type=bind,src=${resolve('output/staging/supabase-ca.crt')},dst=/supabase-ca.crt,readonly`,...mounts.flatMap(([src,dst])=>['--mount',`type=bind,src=${resolve(src)},dst=${dst},readonly`]),...Object.keys(environment).flatMap(key=>['--env',key]),'--entrypoint',tool,'public.ecr.aws/supabase/postgres:17.11.0.006',...args],input,environment);
}
export const q=value=>"'"+String(value).replaceAll("'","''")+"'";
