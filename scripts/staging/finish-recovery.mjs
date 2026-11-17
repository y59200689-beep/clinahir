import {readFile,writeFile} from 'node:fs/promises';import {sourceRef,restoreRef,query} from './remote-platform.mjs';
const credential=JSON.parse(await readFile('output/staging/backup-credential.json','utf8'));if(credential.target!==sourceRef||!/^[a-z0-9_]+$/.test(credential.role))throw Error('recovery_identity_mismatch');
const report={executedAt:new Date().toISOString(),checks:[]};
for(const ref of [sourceRef,restoreRef]){
 await query(ref,`alter role ${credential.role} nologin;revoke connect on database postgres from ${credential.role};`);
 const roles=await query(ref,`select rolcanlogin,rolsuper,rolbypassrls from pg_roles where rolname='${credential.role}'`);
 const policies=await query(ref,"select count(*)::int as count from pg_policies where policyname='clinahir_temporary_recovery_read'");
 const passed=roles.length===1&&!roles[0].rolcanlogin&&!roles[0].rolsuper&&!roles[0].rolbypassrls&&policies[0].count===0;report.checks.push({projectRef:ref,temporaryLoginDisabled:!roles[0]?.rolcanlogin,temporaryPoliciesRemoved:policies[0].count===0,passed});if(!passed)process.exitCode=1;
}
report.status=process.exitCode===1?'failed':'passed';await writeFile('docs/clinahir-upgrade/staging-execution/recovery-cleanup.json',JSON.stringify(report,null,2)+'\n');
// Keep the observed first permission failure separate from the successful repaired verification.
const path='docs/clinahir-upgrade/staging-execution/hosted-recovery.json',recovery=JSON.parse(await readFile(path,'utf8'));if(recovery.status==='passed'){recovery.preRepairFailures=[...(recovery.preRepairFailures??[]),...recovery.checks.filter(c=>!c.passed)];recovery.checks=recovery.checks.filter(c=>c.passed);await writeFile(path,JSON.stringify(recovery,null,2)+'\n');}
console.log(report.status);
