import {readFile,writeFile} from 'node:fs/promises';
import {hosting} from './hosting-cli.mjs';
const root='docs/clinahir-upgrade/final-gates/production/';
const env=JSON.parse(await readFile('output/production/runtime-configuration.json'));
const source=JSON.parse(await readFile(root+'source-staged-deployment.json'));
const crm=JSON.parse(await readFile(root+'crm-staged-deployment.json'));
const checks=[];
async function check(name,url,path,status,config='',test=()=>true){
 const extra=config.split("\n").filter(Boolean).flatMap(line=>{const [key,...rest]=line.split(" = ");return ["--"+({request:"request",header:"header",data:"data"}[key]),JSON.parse(rest.join(" = "))];});
 const r=await hosting(['curl',url+path,'--scope','paraoonline','--','--silent','--show-error',...extra,'--write-out','\n%{http_code}'],undefined,url===crm.url?{cwd:new URL('../../output/production/crm-release/',import.meta.url).pathname}:{});
 await writeFile('output/production/candidate-'+name+'.json',JSON.stringify(r),{mode:0o600});
 const split=r.out.lastIndexOf('\n'),body=r.out.slice(0,split),actual=Number(r.out.slice(split+1));
 const passed=r.code===0&&actual===status&&test(body);
 checks.push({name,status:actual,passed}); console.log(JSON.stringify(checks.at(-1)));
 if(!passed)throw Error('candidate_check_failed_'+name);
}
if(!process.argv.includes('--crm-only')) {
await check('environment',source.url,'/api/environment',200,'',b=>JSON.parse(b).environment==='production');
await check('admin',source.url,'/admin',200,'',b=>b.includes('<html'));
await check('admin-session',source.url,'/api/admin?action=session',401);
await check('cron-denied',source.url,'/api/cron/health',401);
await check('cron-health',source.url,'/api/cron/health',200,'header = '+JSON.stringify('Authorization: Bearer '+env.CRON_SECRET)+'\n',b=>JSON.parse(b).whatsappEnabled===false);
}
await check('crm-auth',crm.url,'/api/integrations/clinahir/leads',400,'request = "POST"\nheader = "Content-Type: application/json"\nheader = '+JSON.stringify('Authorization: Bearer '+env.CLINAHIR_INTEGRATION_SECRET)+'\ndata = "{}"\n');
await writeFile(root+'candidate-verification.json',JSON.stringify({checkedAt:new Date().toISOString(),status:'passed',checks,sourceUrl:source.url,crmUrl:crm.url,productionDomainsChanged:false},null,2));
