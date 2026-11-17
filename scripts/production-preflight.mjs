// Validate explicit build/runtime identities without networking or dotenv loading.
import {productionIssues} from '../.integration-build/server/environment.js';
const issues=productionIssues({...process.env,VERCEL_ENV:'production'});
if(process.env.VITE_APP_ENV!=='production')issues.push('public_production_build_identity_required');
if(process.env.VITE_SENTRY_ENABLED!=='false')issues.push('unapproved_browser_telemetry_must_be_disabled');
if(issues.length){console.error('Production preflight blocked: '+issues.join(', '));process.exitCode=1;}
else console.log('Production identities and disabled sending/telemetry validated; no external service acceptance claimed.');
