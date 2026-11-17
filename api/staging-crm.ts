import {createHash,timingSafeEqual} from 'node:crypto';
import {environmentFailure} from '../server/environment.js';
async function handle(request:Request):Promise<Response>{
 const env=process.env;
 const reply=(status:number,body:unknown={ok:status<300})=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
 if(env.CLINAHIR_ENV!=='staging'||env.CLINAHIR_STAGING_RECEIVER_ENABLED!=='true')return reply(404);
 const failure=environmentFailure(env,request);if(failure)return failure;
 const expected=Buffer.from('Bearer '+(env.CLINAHIR_INTEGRATION_SECRET??'')),actual=Buffer.from(request.headers.get('authorization')??'');
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return reply(401);
 const url=new URL(request.url);let args:Record<string,string>;
 try{
  if(request.method==='GET'&&/^\/__verification\/receipts\/cli_[0-9a-f-]{36}$/i.test(url.pathname))args={p_action:'receipt',p_external_id:url.pathname.split('/').pop()!};
  else if(request.method==='POST'&&url.pathname==='/__verification/mode'){
   const body=await request.json();if(!['healthy','outage','timeout','accepted-but-unacknowledged'].includes(body.mode))return reply(400);args={p_action:'mode',p_mode:body.mode};
  }else if(request.method==='POST'&&url.pathname==='/api/integrations/clinahir/leads'){
   const raw=await request.text();if(Buffer.byteLength(raw)>16384)return reply(413);const body=JSON.parse(raw);
   if(!/^cli_[0-9a-f-]{36}$/i.test(body.externalId??'')||!String(body.companyName??'').startsWith('Synthetic '))return reply(400);
   args={p_action:'record',p_external_id:body.externalId,p_fingerprint:createHash('sha256').update(raw).digest('hex')};
  }else return reply(404);
  const response=await fetch(env.SUPABASE_URL+'/rest/v1/rpc/clinahir_staging_receiver',{method:'POST',headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY!,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY!,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(7000),redirect:'error'});
  if(!response.ok){await response.body?.cancel();return reply(503);}const result=await response.json();
  if(args.p_action!=='record')return reply(200,result);
  if(result.mode==='timeout')await new Promise(resolve=>setTimeout(resolve,10000));
  return reply(result.conflict?409:result.mode==='healthy'?201:503);
 }catch{return reply(503);}
}
export const GET=handle;export const POST=handle;
