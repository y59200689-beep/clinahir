import {readFile,writeFile} from 'node:fs/promises';import {api,query,pg,sourceRef,crmRef} from './remote-platform.mjs';
const report={executedAt:new Date().toISOString(),scope:'Require database SSL on dedicated Clinahir and CRM staging projects only; no live project or credentials changed',checks:[]};
try{
 for(const ref of [sourceRef,crmRef]){
  const before=await api(ref,'/ssl-enforcement');if(!before.currentConfig?.database)await api(ref,'/ssl-enforcement',{requestedConfig:{database:true}},'PUT');
  let confirmed=false;for(let i=0;i<25;i++){const state=await api(ref,'/ssl-enforcement');if(state.currentConfig?.database===true&&state.appliedSuccessfully===true){confirmed=true;break;}await new Promise(resolve=>setTimeout(resolve,1500));}
  report.checks.push({name:'provider confirms database SSL enforcement '+ref,passed:confirmed});if(!confirmed)throw Error('ssl_enforcement_pending');
  await query(ref,'begin transaction read only;select 1;rollback;');report.checks.push({name:'management database access recovers '+ref,passed:true});
 }
 const secrets=JSON.parse(await readFile('output/staging/crm-sandbox-secrets.json','utf8'));const result=await pg(crmRef,'postgres',secrets.databasePassword,'psql',['-X','-At','--command','select ssl from pg_stat_ssl where pid=pg_backend_pid()']);const tls=result.code===0&&result.out.toString().trim()==='t';report.checks.push({name:'CRM session pooler connection uses certificate-verified TLS',passed:tls});if(!tls)throw Error('tls_connection_not_verified');report.status='passed';
}catch(e){report.status='failed';report.failure=e.message;process.exitCode=1;}
await writeFile('docs/clinahir-upgrade/next-milestone/tls-enforcement.json',JSON.stringify(report,null,2)+'\n');console.log(report.status);
