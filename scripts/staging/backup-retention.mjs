import {pathToFileURL} from 'node:url';import {readFile,writeFile} from 'node:fs/promises';
export const backupFolder='18_BWG8NWnSiWSc_pgcocxkLFHaHIWbzA',backupProject='fsfqgionuuxykpoxhrdm';
export function retentionPlan(records,now=new Date(),scope={project:backupProject,folder:backupFolder,filePattern:/^clinahir-staging-.*\.dump\.aesgcm$/}){
 if(!Array.isArray(records)||!Number.isFinite(+now))throw Error('invalid_catalog');const ids=new Set();
 for(const r of records){if(!r.id||ids.has(r.id)||r.projectRef!==scope.project||r.folderId!==scope.folder||!/^[-_a-zA-Z0-9]{10,}$/.test(r.fileId??'')||!scope.filePattern.test(r.fileName??'')||!Number.isFinite(Date.parse(r.createdAt))||Date.parse(r.createdAt)>+now+300000)throw Error('unsafe_catalog');ids.add(r.id);}
 const verified=records.filter(r=>r.verified===true&&!r.trashed).sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)),keep=new Set(verified.slice(0,2).map(r=>r.id)),day=86400000;
 const week=d=>{const n=new Date(d);n.setUTCHours(0,0,0,0);n.setUTCDate(n.getUTCDate()-((n.getUTCDay()+6)%7));return n.toISOString().slice(0,10);};
 const buckets=[{limit:14,key:d=>new Date(d).toISOString().slice(0,10),age:d=>Math.floor((Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate())-Date.parse(new Date(d).toISOString().slice(0,10)))/day)},{limit:8,key:week,age:d=>Math.round((Date.parse(week(now))-Date.parse(week(d)))/(7*day))},{limit:12,key:d=>new Date(d).toISOString().slice(0,7),age:d=>(now.getUTCFullYear()-new Date(d).getUTCFullYear())*12+now.getUTCMonth()-new Date(d).getUTCMonth()}];
 for(const b of buckets){const seen=new Set();for(const r of verified){const age=b.age(r.createdAt),key=b.key(r.createdAt);if(age>=0&&age<b.limit&&!seen.has(key)){seen.add(key);keep.add(r.id);}}}
 for(const r of verified)if(r.pinned)keep.add(r.id);
 // Unverified files and unknown files are never deletion candidates. Keep at least two verified recovery points.
 return {policy:'14 daily / 8 weekly / 12 monthly; newest two and pinned always retained',keep:verified.filter(r=>keep.has(r.id)),trashCandidates:verified.filter(r=>!keep.has(r.id)),unverified:records.filter(r=>!r.verified),permanentDeletionAllowed:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const catalog=JSON.parse(await readFile('output/staging/offsite/catalog.json','utf8')),plan=retentionPlan(catalog);await writeFile('docs/clinahir-upgrade/final-gates/retention-plan.json',JSON.stringify({executedAt:new Date().toISOString(),...plan},null,2)+'\n');console.log(JSON.stringify(plan,null,2));}
