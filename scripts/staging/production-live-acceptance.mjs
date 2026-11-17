import {readFile,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
const root='docs/clinahir-upgrade/final-gates/production/';
const origin='https://clinahir.tech';
let fixture;
try {fixture=JSON.parse(await readFile(root+'live-acceptance-fixture.json'));}
catch {fixture={submissionId:randomUUID(),companyName:'SYNTHETIC RELEASE CHECK — NOT A CUSTOMER',contactName:'Release Acceptance Fixture',city:'Synthetic',email:'release-check@example.test',phone:'+12025550199',role:'Owner / director',priority:'A connected end-to-end workflow',formType:'demo',landingPage:'/',message:'Fictional production acceptance record. No outreach, no patient data.',utmSource:'release_acceptance'};await writeFile(root+'live-acceptance-fixture.json',JSON.stringify(fixture,null,2));}
const checks=[];
async function get(path,status,test=()=>true){const r=await fetch(origin+path,{redirect:'manual'});const text=await r.text();const ok=r.status===status&&test(text,r);checks.push({path,status:r.status,passed:ok});if(!ok)throw Error('live_check_failed_'+path);}
await get('/api/environment',200,b=>JSON.parse(b).environment==='production');
await get('/admin',200,(b,r)=>b.includes('<html')&&r.headers.get('x-robots-tag')?.includes('noindex')&&r.headers.get('cache-control')?.includes('no-store'));
await get('/api/admin?action=session',401);
await get('/api/cron/leads',401);
for(let attempt=1;attempt<=2;attempt++){
 const r=await fetch(origin+'/api/leads',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(fixture)});
 const data=await r.json();const passed=r.status===201&&data.ok===true&&data.externalId==='cli_'+fixture.submissionId;
 checks.push({name:'fictional_submission_'+attempt,status:r.status,passed,externalId:data.externalId});
 if(!passed)throw Error('synthetic_submission_failed');
}
const report={checkedAt:new Date().toISOString(),status:'http_passed_pending_independent_database_verification',externalId:'cli_'+fixture.submissionId,checks,realCustomerDataUsed:false,whatsappAuthorized:false};
await writeFile(root+'live-acceptance.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
