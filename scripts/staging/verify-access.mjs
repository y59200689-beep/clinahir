// No dotenv/Vite env loader: explicit, approved staging credentials only.
import {writeFile,mkdir} from 'node:fs/promises';
import {verifyStagingAccess} from './access-checks.mjs';
const report=await verifyStagingAccess(process.env);await mkdir('docs/clinahir-upgrade/phase3',{recursive:true});await writeFile('docs/clinahir-upgrade/phase3/staging-access-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));process.exitCode=report.status==='passed'?0:report.status==='blocked'?2:1;
