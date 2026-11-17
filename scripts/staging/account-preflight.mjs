// Read-only account discovery. Never emit the auth file, response bodies or environment values.
import {readFile,writeFile} from 'node:fs/promises';
const auth=JSON.parse(await readFile('/Users/youssefmahir/Library/Application Support/com.vercel.cli/auth.json','utf8'));
const linked=JSON.parse(await readFile('.vercel/project.json','utf8'));
const token=process.env.VERCEL_TOKEN||auth.token;
const report={checkedAt:new Date().toISOString(),mode:'read-only account discovery',tokenAvailable:Boolean(token),checks:{}};
for(const [name,path]of [['user','/v2/user'],['teams','/v2/teams'],['linkedProject',`/v9/projects/${encodeURIComponent(linked.projectId)}?teamId=${encodeURIComponent(linked.orgId)}`]]){
 try{
  const response=await fetch('https://api.vercel.com'+path,{headers:{Authorization:`Bearer ${token}`},redirect:'error',signal:AbortSignal.timeout(10000)});
  report.checks[name]={status:response.status};
  if(response.ok){const d=await response.json();if(name==='user')report.checks[name].account={id:d.user?.id,username:d.user?.username};if(name==='teams')report.checks[name].teams=d.teams?.map(t=>({id:t.id,slug:t.slug,name:t.name}));if(name==='linkedProject')report.checks[name].project={id:d.id,name:d.name,accountId:d.accountId,framework:d.framework,ssoProtection:d.ssoProtection??null,passwordProtectionConfigured:Boolean(d.passwordProtection),trustedIpsConfigured:Boolean(d.trustedIps),hasAutomationBypass:Boolean(d.protectionBypass),targets:Object.keys(d.targets??{})};
  }else {const d=await response.json().catch(()=>({}));const code=d.error?.code;if(typeof code==='string'&&/^[a-zA-Z0-9_ -]{1,80}$/.test(code))report.checks[name].errorCode=code;}
 }catch{report.checks[name]={status:'unreachable_or_timeout'};}
}
await writeFile('docs/clinahir-upgrade/staging-execution/account-preflight.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
if(Object.values(report.checks).some(check=>check.status!==200))process.exitCode=1;
