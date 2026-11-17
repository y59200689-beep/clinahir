import {writeFile,mkdir} from 'node:fs/promises';import {resolve} from 'node:path';import {hosting,hostingApi,stagingTeamId} from './hosting-cli.mjs';
const name='clinahir-crm-sandbox',report={executedAt:new Date().toISOString(),name,scope:'Separate protected CRM sandbox hosting only; never the live Daily Command project'};
try{
 const projects=await hostingApi('/v9/projects?limit=100');let project=projects.projects.find(p=>p.name===name);
 if(!project)project=await hostingApi('/v10/projects',{name,framework:'nextjs',installCommand:'npm ci',publicSource:false,ssoProtection:{deploymentType:'all'}});
 const exact=await hostingApi('/v9/projects/'+project.id);if(exact.name!==name||exact.accountId!==stagingTeamId||exact.ssoProtection?.deploymentType!=='all'||exact.id==='prj_qkHMHxMVera3Lp6yHg82GXwXSNnR')throw Error('new_protected_sandbox_required');report.projectId=exact.id;report.protection='all';report.origin='https://'+name+'.vercel.app';
 await writeFile('docs/clinahir-upgrade/next-milestone/crm-hosting.json',JSON.stringify(report,null,2)+'\n');
 if(!exact.latestDeployments?.length){
  const path=resolve('output/staging/crm-placeholder');await mkdir(path+'/.vercel',{recursive:true});await mkdir(path+'/public',{recursive:true});await writeFile(path+'/.vercel/project.json',JSON.stringify({projectId:exact.id,orgId:stagingTeamId,projectName:name}));await writeFile(path+'/public/index.html','<!doctype html><html lang="en"><meta name="robots" content="noindex,nofollow"><title>Protected CRM sandbox</title><h1>CRM sandbox preparation</h1><p>No live sales routing.</p></html>');await writeFile(path+'/vercel.json',JSON.stringify({framework:null,buildCommand:'',installCommand:'',outputDirectory:'public',headers:[{source:'/(.*)',headers:[{key:'X-Robots-Tag',value:'noindex, nofollow, noarchive'}]}]}));
  const r=await hosting(['deploy','--yes','--scope','paraoonline','--prod'],undefined,{cwd:path});await writeFile('output/staging/crm-placeholder-cli.json',JSON.stringify(r),{mode:0o600});if(r.code!==0)throw Error('static_sandbox_bootstrap_failed');report.bootstrap={scope:'Static protected maintenance placeholder only; provider initial Production label; no app credentials or scheduled jobs',url:r.out.match(/https:\/\/[a-z0-9-]+\.vercel\.app/)?.[0]};
 }
 report.status='protected_hosting_prepared';
}catch(e){report.status='failed';report.failure=e.message;process.exitCode=1;}
await writeFile('docs/clinahir-upgrade/next-milestone/crm-hosting.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
