// Explicit process environment only: never import the existing development .env.local.
import { stagingIssues } from '../.integration-build/server/environment.js';
const issues = stagingIssues(process.env);
if (process.env.CLINAHIR_ENV !== 'staging') issues.push('explicit_staging_identity_required');
if (process.env.VITE_APP_ENV !== 'staging') issues.push('visible_staging_identity_required');
console.log(JSON.stringify({ scope: 'local configuration only; not remote protection or readiness', issues }, null, 2));
if (issues.length) process.exitCode = 2;
