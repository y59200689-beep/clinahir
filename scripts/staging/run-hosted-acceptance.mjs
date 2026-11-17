import {readFile,writeFile} from 'node:fs/promises';
import {verifyStagingAccess} from './access-checks.mjs';import {verifyStagingWorkflow} from './workflow-checks.mjs';
const env=JSON.parse(await readFile('output/staging/hosting-env.json','utf8')),accounts=JSON.parse(await readFile('output/staging/test-accounts.json','utf8')),keys=JSON.parse(await readFile('output/staging/target-cli-keys.json','utf8')).keys;
Object.assign(env,{VERCEL_ENV:'preview',STAGING_VERIFICATION_APPROVED:'synthetic-staging-auth-only',STAGING_WORKFLOW_APPROVED:'synthetic-staging-business-writes',SUPABASE_ANON_KEY:keys.find(k=>k.name==='anon').api_key,STAGING_OWNER_EMAIL:accounts.owner.email,STAGING_OWNER_PASSWORD:accounts.owner.password,STAGING_OWNER_ID:accounts.owner.id,STAGING_NONOWNER_EMAIL:accounts.nonowner.email,STAGING_NONOWNER_PASSWORD:accounts.nonowner.password,STAGING_NONOWNER_ID:accounts.nonowner.id});
for(const [name,verify]of [['access',verifyStagingAccess],['workflow',verifyStagingWorkflow]]){
 const report=await verify(env);await writeFile(`docs/clinahir-upgrade/staging-execution/hosted-${name}.json`,JSON.stringify(report,null,2)+'\n');console.log(name,report.status,'passed',report.checks.filter(c=>c.passed).length,'failed',report.checks.filter(c=>!c.passed).length);if(report.status!=='passed')process.exitCode=1;
}
