// Run only from the trusted default-branch workflow. Never log queries, results or secrets.
import {parseMapsLocations, mapsQueryFile, mapsResultCity} from '../server/maps-locations.mjs';
import {randomUUID} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const exec=promisify(execFile);
const origin=process.env.CLINAHIR_MAPS_ORIGIN;
const identityUrl=process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
const identityCredential=process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
if(origin!=='https://clinahir.tech'||!identityUrl||!identityCredential)throw Error('Worker configuration is missing or invalid');
const image='gosom/google-maps-scraper@sha256:0b9be6be68ad134dd2e9af30e33def1a5f49295965889daec30f0bd111eb9c7d';
async function identity(){
 const url=new URL(identityUrl);if(url.protocol!=='https:'||!url.hostname.endsWith('.actions.githubusercontent.com'))throw Error('Invalid GitHub identity endpoint');url.searchParams.set('audience',origin+'/api/maps-worker');
 const response=await fetch(url,{headers:{Authorization:'Bearer '+identityCredential},redirect:'error',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('GitHub worker identity unavailable');const d=await response.json();if(typeof d.value!=='string')throw Error('Invalid worker identity');return d.value;
}
async function api(body){
 for(let attempt=0;attempt<3;attempt++){
  try{const token=await identity();const r=await fetch(origin+'/api/maps-worker',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(20000)});if(r.ok)return await r.json();if(r.status<500)throw Error('Worker request rejected');}catch{if(attempt===2)throw Error('Worker service unavailable');}
  await new Promise(resolve=>setTimeout(resolve,2000));
 }
 throw Error('Worker service unavailable');
}
const claimed=await api({op:'claim',claimToken:randomUUID()});const job=claimed.job;
if(!job){console.log('No queued search.');process.exit(0);}
if(!/^[0-9a-f-]{36}$/i.test(job.id)||!/^[0-9a-f-]{36}$/i.test(job.token)||typeof job.query!=='string'||job.query.length>260||/[\r\n\x00-\x1f]/.test(job.query))throw Error('Invalid job received');
const locations = parseMapsLocations(job.city);
const keywords = job.keywords ?? job.query.slice(0, -(job.city?.length + 4));
if (!locations.length || typeof keywords !== 'string' || !keywords.trim() || keywords.length > 120 || /[\x00-\x1f]|#!#/.test(keywords)) throw Error('Invalid search locations received');
console.log('Processing one private Maps search.');
const directory=await mkdtemp(join(tmpdir(),'clinahir-hosted-maps-'));const name='clinahir-maps-'+job.id;let rows=[],stopped=false;
const docker=args=>exec('docker',args,{timeout:30000,maxBuffer:65536});
const string=(value,max)=>String(value??'').slice(0,max);
async function collect(){
 try{const data=await readFile(join(directory,'results.json'),'utf8');rows=data.split(/\r?\n/).filter(Boolean).flatMap(line=>{try{const r=JSON.parse(line);return [{title:string(r.title,200),category:string(r.category,120),rating:string(r.review_rating,10),reviews:string(r.review_count,12),phone:string(r.phone,40),website:string(r.web_site??r.website,1000),address:string(r.address,500),listing:string(r.link,1000),city:string(mapsResultCity(r.complete_address?.city, r.input_id, locations),120)}];}catch{return [];}}).slice(0,500);}catch{}
 return rows;
}
try{
 await writeFile(join(directory,'queries.txt'),mapsQueryFile(keywords, locations),{mode:0o600});
 // A heartbeat keeps the lease alive during the first image download.
 await api({op:'progress',id:job.id,token:job.token,results:[]});
 await exec('docker',['pull',image],{timeout:240000,maxBuffer:1024*1024});
 const ready=await api({op:'progress',id:job.id,token:job.token,results:[]});if(!ready.accepted){stopped=true;throw Error('Search was stopped');}
 await docker(['run','-d','--init','-e','DISABLE_TELEMETRY=1','--name',name,'--cpus','2','--memory','3g','--pids-limit','512','-v',join(directory,'queries.txt')+':/queries.txt:ro','-v',directory+':/out',image,'-input','/queries.txt','-results','/out/results.json','-json','-depth','1','-c','2','-lang','en','-exit-on-inactivity','3m']);
 const deadline=Date.now()+12*60*1000;let success=false,partial=false,lastCount=0,lastChangeAt=Date.now();
 while(Date.now()<deadline){
  await new Promise(resolve=>setTimeout(resolve,20000));await collect();
  if(rows.length>lastCount){lastCount=rows.length;lastChangeAt=Date.now();}
  const progress=await api({op:'progress',id:job.id,token:job.token,results:rows});if(!progress.accepted){stopped=true;break;}
  const {stdout}=await docker(['inspect','--format','{{json .State}}',name]);const state=JSON.parse(stdout);
  if(state.Status==='exited'){success=state.ExitCode===0&&rows.length>0;partial=!success&&rows.length>0;break;}
  if(rows.length>0&&Date.now()-lastChangeAt>=90_000){partial=true;break;}
 }
 if(!stopped){await collect();if(rows.length>0&&!success)partial=true;await api({op:'finish',id:job.id,token:job.token,results:rows,success,partial,error:success?null:(partial?'The scraper stopped finding new businesses. The partial results are ready.':'No businesses were captured. Try different keywords or a nearby city.')});console.log((success?'Search finished.':'Search finished with partial results.')+' Captured businesses: '+rows.length);}
}catch{
 if(!stopped){const captured=await collect();partial=captured.length>0;await api({op:'finish',id:job.id,token:job.token,results:captured,success:false,partial,error:partial?'The scraper stopped finding new businesses. The partial results are ready.':'The online search could not finish. Try different keywords or a nearby city.'}).catch(()=>{});}
 console.log(stopped?'Search stopped by the owner.':'Search failed; partial results preserved.');
 process.exitCode=stopped?0:1;
}finally{await docker(['rm','-f',name]).catch(()=>{});await rm(directory,{recursive:true,force:true});}
