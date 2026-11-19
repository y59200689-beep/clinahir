import { validMapsWorker } from './maps-worker-auth.js';
import { SupabaseLeadStore } from './supabase.js';
import { environmentFailure } from './environment.js';
import { parseMapsLocations, mapsResultCity, selectMapsRows } from './maps-locations.mjs';
import { parseProspectCsv } from './prospects.js';
type Env = Record<string,string|undefined>;
export type MapsRow = {title:string;category:string;rating:string;reviews:string;phone:string;website:string;address:string;listing:string;city:string;location?:string};
type Milestone = "pending" | "searching" | "finished" | "incomplete";
interface Job {id:string; keywords:string;city:string;status:string;created_at:string;updated_at?:string;milestones?:Milestone[];total?:number;lease_token:string|null;results:MapsRow[];error:string|null;conflict?:boolean;limited?:boolean}
const reply=(data:object,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const uuid=(value:unknown):value is string=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const text=(value:unknown,max:number)=>typeof value==='string'&&value.trim().length>0&&value.length<=max&&!/[\x00-\x1f]/.test(value);
const publicJob = (job: Job | null) => {
 if (!job) return null;
 const locations = parseMapsLocations(job.city);
 return { id: job.id, query: `${job.keywords} in ${locations.join('; ') || job.city}`,
  keywords: job.keywords, locations, status: job.status, startedAt: job.created_at,
  lastWorkerUpdate: job.status === 'running' ? job.updated_at : undefined,
  total: job.total ?? job.results?.length, milestones: job.milestones, error: job.error };
};
const cell=(v:unknown)=>'"'+String(v??'').replaceAll('"','""')+'"';
export function mapsCsv(rows:MapsRow[],city?:string,internal=false){
 const keys=internal?['center_name','city','address','category','phone','website_url','rating','review_count','listing_url','source_name','source_url']:['title','category','rating','reviews','phone','website','address','city'];
 const locations=parseMapsLocations(city);
 const values=rows.map(r=>internal?[r.title,mapsResultCity(r.city, undefined, locations),r.address,r.category,r.phone,r.website,r.rating,r.reviews,r.listing,'Google Maps',r.listing||'https://www.google.com/maps']:[r.title,r.category,r.rating,r.reviews,r.phone,r.website,r.address,r.city]);
 const quote=(v:unknown)=>cell(!internal&&/^(?:\s*[=+@-]|[\t\r\n])/.test(String(v??''))?"'"+v:v);
 return (internal?'':'\uFEFF')+[keys,...values].map(row=>row.map(quote).join(',')).join('\r\n');
}
export async function mapsAdminRequest(request:Request,body:Record<string,unknown>|undefined,store:SupabaseLeadStore,actor:string):Promise<Response>{
 const params = new URL(request.url).searchParams;
 const action = params.get('action');
 const rpc=(op:string,data:object={})=>store.adminRpc<Job|null>('clinahir_maps_job',{p_actor:actor,p_op:op,p_data:data});
 if(action==='maps-start'&&request.method==='POST'){
  const locations = parseMapsLocations(body?.city);
  if(!body||!text(body.keywords,120)||String(body.keywords).includes('#!#')||!locations.length||body.proxy!=='none')return reply({error:'Enter keywords and up to 5 cities or areas.'},400);
  const j=await rpc('start',{keywords:(body.keywords as string).trim(),city:locations.join(';')});
  if(j?.conflict)return reply({error:'A search is already running.'},409);if(j?.limited)return reply({error:'Daily search limit reached. Try again tomorrow.'},429);
  return reply({job:publicJob(j)});
 }
 if (action === 'maps-history' && request.method === 'GET') {
  const jobs = await store.adminRpc<Job[]>('clinahir_maps_history', { p_actor: actor });
  return reply({ jobs: jobs.map(publicJob) });
 }
 const jobId = action === 'maps-import' ? body?.jobId : params.get('job');
 if (jobId != null && !uuid(jobId)) return reply({ error: 'Search results changed. Refresh and try again.' }, 400);
 const j = jobId && action !== 'maps-stop' ? await rpc('get', { id: jobId }) : await rpc('latest');
 if (jobId && (!j || j.id !== jobId)) return reply({ error: 'Search results changed. Refresh and try again.' }, action === 'maps-import' ? 409 : 404);
 if(action==='maps-stop'&&request.method==='POST'){
  if(!j || (body?.jobId && body.jobId !== j.id) || !await rpc('stop',{id:j.id}))return reply({error:'No running search to stop.'},409);return reply({stopped:true});
 }
 if(action==='maps-import'&&request.method==='POST'){
  if(!j||body?.jobId!==j.id)return reply({error:'Search results changed. Refresh and try again.'},409);
  if(body.sourceUseConfirmed!==true)return reply({error:'Confirm the data source and choose a valid CSV under 180 KB.'},400);
  if(['queued','running'].includes(j.status))return reply({error:'Wait for the search to finish or stop it before importing.'},409);
  const selected = selectMapsRows(j.results, body.indices) as MapsRow[] | null;
  if (!selected?.length) return reply({error:'No results to import.'},400);
  try{const rows=parseProspectCsv(mapsCsv(selected,j.city,true),true);return reply(await store.adminRpc('clinahir_admin_import_prospects',{p_actor:actor,p_rows:rows}));}catch{return reply({error:'Search results could not be imported. Check the captured business fields.'},400);}
 }
 if(request.method!=='GET')return reply({error:'Method not allowed'},405);
 if(action==='maps-export')return new Response(mapsCsv(j?.results??[]),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="google-maps-results.csv"','Cache-Control':'no-store'}});
 const results = j?.results ?? [];
 const locations = parseMapsLocations(j?.city);
 const keys = results.map(row => ({ title: row.title ?? '', city: mapsResultCity(row.city, undefined, locations) }));
 const prospects = keys.length
  ? await store.adminRpc<(string | null)[]>('clinahir_maps_matched_prospects', { p_rows: keys }).catch(() => null)
  : [];
 const legacyMatches = prospects === null
  ? await store.adminRpc<boolean[]>('clinahir_maps_matches', { p_rows: keys }).catch(() => null)
  : null;
 return reply({ job: publicJob(j), rows: results.map((row, index) => ({
  ...row,
  directoryMatch: prospects ? Boolean(prospects[index]) : legacyMatches?.[index] ?? null,
  prospectId: prospects?.[index] ?? null,
 })), total: results.length });
}
export async function mapsWorkerRequest(request:Request,env:Env,fetcher:typeof fetch=fetch):Promise<Response>{
 const failure=environmentFailure(env,request);if(failure)return failure;
 const supplied=request.headers.get('authorization')?.replace(/^Bearer /,'')??'';
 if(!await validMapsWorker(supplied,fetcher))return reply({error:'Access denied.'},401);
 if(request.method!=='POST')return reply({error:'Method not allowed'},405);
 try{
  if(!env.CLINAHIR_ADMIN_USER_ID||!env.SUPABASE_URL||!env.SUPABASE_SERVICE_ROLE_KEY)return reply({error:'Worker not configured.'},503);
  const raw=await request.text();if(raw.length>1500000)return reply({error:'Request too large'},413);const d=JSON.parse(raw) as Record<string,unknown>;
  if(!['claim','progress','finish'].includes(String(d.op)))return reply({error:'Invalid request'},400);
  if(d.op==='claim'&&!uuid(d.claimToken))return reply({error:'Invalid claim'},400);
  if(d.op!=='claim'){
   if(!uuid(d.id)||!uuid(d.token)||!Array.isArray(d.results)||d.results.length>500||d.results.some(r=>!r||typeof r!=='object'||Object.entries(r).some(([k,v])=>!['title','category','rating','reviews','phone','website','address','listing','city','location'].includes(k)||typeof v!=='string'||v.length>2000)))return reply({error:'Invalid results'},400);
   if (d.milestones !== undefined && (!Array.isArray(d.milestones) || d.milestones.length > 5 || d.milestones.some(value => !['pending','searching','finished','incomplete'].includes(value)))) return reply({error:'Invalid milestones'},400);
   if(d.op==='finish'&&(typeof d.success!=='boolean'||(d.partial!=null&&typeof d.partial!=='boolean')||(d.error!=null&&(!text(d.error,200)))))return reply({error:'Invalid completion'},400);
  }
  const store=new SupabaseLeadStore(env.SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,fetcher);
  const j=await store.adminRpc<Job|null>('clinahir_maps_job',{p_actor:env.CLINAHIR_ADMIN_USER_ID,p_op:d.op,p_data:d});
  return reply(d.op==='claim'?{job:j?{id:j.id,token:j.lease_token,query:`${j.keywords} in ${j.city}`,keywords:j.keywords,city:j.city}:null}:{accepted:!!j});
 }catch{return reply({error:'Worker request could not be completed.'},503);}
}
