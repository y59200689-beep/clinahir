// Dedicated staging project only. Existing clinahir project and production aliases are never modified.
import {spawn} from 'node:child_process';import {writeFile} from 'node:fs/promises';
const scope='paraoonline',name='clinahir-staging',expectedTeam='team_TjuQw2TZ5FOq8fdj8xeiBoFz';
function cli(args,input){return new Promise(resolve=>{const c=spawn('npx',['--yes','vercel@65.16.0',...args],{stdio:['pipe','pipe','pipe']});let out='',err='';c.stdout.on('data',d=>out+=d);c.stderr.on('data',d=>err+=d);c.on('close',code=>{let data;try{data=JSON.parse(out);}catch{}resolve({code,data,errorCode:data?.error?.code,notFound:err.includes('(404)'),reason:err.replace(/\s+/g,' ').slice(0,700)});});c.stdin.end(input);});}
const report={executedAt:new Date().toISOString(),scope,name,mode:'dedicated protected staging project only; no deployment or production changes'};
const identity=await cli(['whoami','--format','json','--non-interactive']);if(identity.code!==0||identity.data?.team?.id!==expectedTeam)throw Error('hosting_owner_mismatch');report.accountVerified=true;report.plan=identity.data.team.plan;
let result=await cli(['api','/v9/projects/'+name,'--scope',scope,'--raw']);
if(result.code===0&&result.data?.id){report.status='already_exists_not_modified';}
else if(result.data?.error?.code==='not_found'||result.notFound){
 const payload={name,framework:'vite',buildCommand:'npm run build:staging',outputDirectory:'dist/client',publicSource:false,ssoProtection:{deploymentType:'all'}};
 result=await cli(['api','/v10/projects','--scope',scope,'--method','POST','--input','-','--raw'],JSON.stringify(payload));report.status=result.code===0&&result.data?.id?'created':'blocked';
}
if(result.data?.id){const d=result.data;report.project={id:d.id,name:d.name,accountId:d.accountId,ssoProtection:d.ssoProtection??null,framework:d.framework};report.protectionConfigured=Boolean(d.ssoProtection?.deploymentType);if(d.name!==name||d.accountId!==expectedTeam||!report.protectionConfigured){report.status='requires_review';process.exitCode=2;}}
else{report.errorCode=result.errorCode??'project_setup_failed';report.reason=result.reason;process.exitCode=2;}
await writeFile('docs/clinahir-upgrade/staging-execution/vercel-provisioning.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
