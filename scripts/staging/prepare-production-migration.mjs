// Produces a review-only candidate outside the normal fresh-install migration chain.
import {readFile,writeFile,rename} from 'node:fs/promises';import {createHash} from 'node:crypto';
const base='docs/clinahir-upgrade/final-gates/production';
const initial=JSON.parse(await readFile(base+'/restored-baseline-catalog.json','utf8'));
const hash=x=>createHash('sha256').update(x).digest('hex');
const sql=await readFile('scripts/staging/production-catalog.sql','utf8');
const select=sql.replace(/^--.*$/gm,'').trim().replace(/;\s*$/,'');
const generated='/tmp/clinahir-migration-preparation/supabase/migrations/20261116234811_clinahir_production_upgrade.sql';
const path=base+'/20261116234811_clinahir_production_upgrade.sql';
try{await rename(generated,path);}catch(e){if(e.code!=='ENOENT')throw e;await readFile(path);}
const header=`-- REVIEW CANDIDATE ONLY. No hosted execution approved.\n-- Source: jsagrvxgydvhdoxibzny; backup 2026-11-16T23-30-09-724Z.\n-- Keep outside supabase/migrations: historical local files target a different baseline.\n-- One explicit transaction; guard aborts on drift or reapplication.\nbegin;\nset local lock_timeout='5s';\nset local statement_timeout='120s';\ndo $guard$\ndeclare actual jsonb;\nbegin\n select catalog into actual from (${select}) baseline;\n if actual is distinct from $baseline$${JSON.stringify(initial)}$baseline$::jsonb then\n  raise exception 'production_baseline_mismatch: refresh catalog and rehearse again';\n end if;\nend $guard$;\n`;
const sources=['20261020165330_whatsapp_contact_leads.sql','20261020171750_clinahir_admin_workspace.sql','20261024110233_preselection_prospects.sql','20261026090000_prospect_address_category_and_filters.sql'];
let body='';const sourceHashes=[];
for(const name of sources){let s=await readFile('supabase/migrations/'+name,'utf8');sourceHashes.push({name,sha256:hash(s)});
 if(name==='20261020171750_clinahir_admin_workspace.sql')s=s.replace('create index clinahir_leads_submitted_idx on public.clinahir_leads(submitted_at desc);','-- Existing equivalent production submitted_at index is retained.');
 if(name==='20261024110233_preselection_prospects.sql'){
  s=s.replace(/create function public\.clinahir_admin_prospects\([\s\S]*?\n\$\$;/,'-- Install only the final five-argument prospects listing RPC below.');
  s=s.replace(/public\.clinahir_admin_prospects\(text,text,integer\),\s*/g,'');
 }
 if(name==='20261026090000_prospect_address_category_and_filters.sql')s=s.replace('drop function if exists public.clinahir_admin_prospects(text, text, integer);','-- No old signature exists on this production baseline; no function is dropped.');
 body+='\n-- Adapted source: '+name+'\n'+s;
}
const hardening=`\n-- Preserve original tables, IDs, constraints, indexes, triggers and outbox state.\n-- Explicitly close all Clinahir browser-role grants; service_role remains server-only.\ndo $private$\ndeclare routine record;\nbegin\n for routine in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace\n where n.nspname='public' and left(p.proname,9)='clinahir_' and p.prokind='f' loop\n  execute format('revoke all on function %s from public,anon,authenticated',routine.signature);\n  execute format('grant execute on function %s to service_role',routine.signature);\n end loop;\nend $private$;\ncommit;\n`;
const candidate=header+body+hardening;await writeFile(path,candidate);
await writeFile(base+'/migration-candidate.json',JSON.stringify({preparedAt:new Date().toISOString(),projectRef:'jsagrvxgydvhdoxibzny',candidatePath:path,candidateSha256:hash(candidate),baselineFingerprint:hash(JSON.stringify(initial)),backupId:'2026-11-16T23-30-09-724Z',sourceHashes,status:'prepared_for_local_rehearsal',productionApplicationAuthorized:false,historicalMigrationRepair:false,normalFreshInstallChainModified:false},null,2)+'\n');
console.log(JSON.stringify({candidatePath:path,sha256:hash(candidate),historicalFilesUnchanged:true}));
