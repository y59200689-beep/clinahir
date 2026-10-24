// Run from a trusted operator environment. Never print credentials or lead PII.
const base=process.env.CLINAHIR_URL,secret=process.env.CRON_SECRET;
if(!base||!secret)throw new Error('Set CLINAHIR_URL and CRON_SECRET in your private environment');
const url=new URL('/api/cron/health',base);if(url.protocol!=='https:')throw new Error('HTTPS required');
const response=await fetch(url,{headers:{Authorization:`Bearer ${secret}`},signal:AbortSignal.timeout(10000),redirect:'error'});
if(!response.ok)throw new Error(`Health check HTTP ${response.status}`);
const result=await response.json();console.log(JSON.stringify(result,null,2));
const last=result.heartbeat?.[0];
const stale=!last||Date.now()-Date.parse(last.completed_at)>27*60*60*1000;
const blocked=result.health.some(row=>['blocked','exhausted','review'].includes(row.status)&&Number(row.count)>0);
if(stale||blocked||last?.whatsapp_error){console.error('Action required: stale cron or delivery needs review');process.exitCode=1;}
