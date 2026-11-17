import {readFile,writeFile} from 'node:fs/promises';
import {hosting} from './hosting-cli.mjs';
const root='docs/clinahir-upgrade/final-gates/production/';
const checks=[];
for(const [name,status] of [['environment',200],['admin',200],['admin-session',401],['cron-denied',401],['cron-health',200],['crm-auth',400]]){
 const r=JSON.parse(await readFile('output/production/candidate-'+name+'.json'));
 const actual=Number(r.out.slice(r.out.lastIndexOf('\n')+1));
 if(r.code!==0||actual!==status)throw Error('candidate_not_passed_'+name);
 checks.push({name,status:actual,passed:true});
}
const auth=JSON.parse(await readFile(root+'release-authorization.json'));
const candidate=JSON.parse(await readFile(root+'release-candidate.json'));
if(!auth.productionActivationAuthorized||auth.sourceSha256!==candidate.sourceSha256)throw Error('release_authorization_mismatch');
await writeFile(root+'candidate-verification.json',JSON.stringify({checkedAt:new Date().toISOString(),status:'passed',checks},null,2));
const receipt={startedAt:new Date().toISOString(),promotions:[]};
for(const name of ['crm','source']){
 const d=JSON.parse(await readFile(root+name+'-staged-deployment.json'));
 const r=await hosting(['promote',d.url,'--scope','paraoonline','--yes']);
 await writeFile('output/production/'+name+'-promotion-cli.json',JSON.stringify(r),{mode:0o600});
 if(r.code!==0)throw Error('promotion_failed_'+name);
 receipt.promotions.push({name,url:d.url,status:'promoted',at:new Date().toISOString()});
 await writeFile(root+'deployment-execution.json',JSON.stringify(receipt,null,2));
 console.log(JSON.stringify(receipt.promotions.at(-1)));
}
