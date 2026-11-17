import {execFileSync} from 'node:child_process';import {readFile,writeFile,chmod} from 'node:fs/promises';import {randomBytes} from 'node:crypto';
const org='brsuzhrspehgfpsoloyi',name='clinahir-crm-sandbox',token=execFileSync('/usr/bin/security',['find-generic-password','-s','Supabase CLI','-a','supabase','-w'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const api=(path,body)=>fetch('https://api.supabase.com/v1'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),redirect:'error',signal:AbortSignal.timeout(30000)});
const report={executedAt:new Date().toISOString(),organization:org,name,scope:'New dedicated CRM sandbox only; no existing database/project changes'};
try{
 const r=await api('/organizations/'+org);if(!r.ok)throw Error('organization_access_required');const organization=await r.json();if(organization.plan!=='free')throw Error('nonzero_cost_requires_review');report.plan='free';report.quotedMonthlyUSD=0;
 const listed=await api('/projects');if(!listed.ok)throw Error('project_inventory_failed');const projects=await listed.json();const existing=projects.find(p=>p.name===name&&p.organization_id===org);
 if(existing){report.status='already_exists';report.projectRef=existing.id;}
 else{
  const password=randomBytes(36).toString('base64url'),path='output/staging/crm-sandbox-secrets.json';await writeFile(path,JSON.stringify({name,databasePassword:password}),{mode:0o600});await chmod(path,0o600);
  const created=await api('/projects',{name,organization_slug:org,region_selection:{type:'specific',code:'eu-central-1'},desired_instance_size:'nano',db_pass:password});const body=await created.json();report.httpStatus=created.status;
  if(created.status===201){report.status='created';report.projectRef=body.id;await writeFile(path,JSON.stringify({name,databasePassword:password,projectRef:body.id}),{mode:0o600});}
  else{report.status='blocked';report.reason=String(body.message??'Free project creation unavailable').replaceAll(token,'[redacted]').replaceAll(password,'[redacted]').replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[owner]').slice(0,500);process.exitCode=2;}
 }
}catch(e){report.status='blocked';report.reason=e.message;process.exitCode=2;}
await writeFile('docs/clinahir-upgrade/next-milestone/crm-sandbox-provisioning.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
