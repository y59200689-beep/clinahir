import {spawn} from 'node:child_process';import {writeFile} from 'node:fs/promises';import {sourceRef,crmRef} from './remote-platform.mjs';
const report={executedAt:new Date().toISOString(),scope:'Read-only provider security advisors for isolated staging projects; findings are not automatically fixed',projects:[]};
for(const ref of [sourceRef,crmRef]){
 const r=await new Promise(resolve=>{const p=spawn('supabase',['db','advisors','--linked','--project-ref',ref,'--type','security','--output-format','json'],{stdio:['ignore','pipe','pipe']});let out='',err='';p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>err+=d);p.on('close',code=>resolve({code,out,err}));});await writeFile('output/staging/advisors-'+ref+'.json',JSON.stringify(r),{mode:0o600});
 try{const d=JSON.parse(r.out);if(r.code!==0||!Array.isArray(d.results))throw Error();report.projects.push({projectRef:ref,status:'executed',findings:d.results.map(f=>({name:f.name,level:f.level,title:f.title,remediation:f.remediation})),counts:d.results.reduce((a,f)=>(a[f.level]=(a[f.level]??0)+1,a),{})});}catch{report.projects.push({projectRef:ref,status:'failed'});process.exitCode=1;}
}
await writeFile('docs/clinahir-upgrade/next-milestone/security-advisors.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.projects.map(p=>({projectRef:p.projectRef,status:p.status,counts:p.counts}))));
