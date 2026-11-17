import {mkdir,readFile,writeFile,readdir,copyFile} from 'node:fs/promises';import {execFileSync} from 'node:child_process';import {resolve} from 'node:path';import {createHash} from 'node:crypto';
import {hosting,stagingProjectId,stagingTeamId} from './hosting-cli.mjs';
const snapshot=resolve('output/staging/release-'+new Date().toISOString().replaceAll(/[:.]/g,'-'));await mkdir(snapshot,{recursive:true});
const reportPath=process.argv.includes('--final-gates')?'docs/clinahir-upgrade/final-gates/deployment.json':process.argv.includes('--launch-session')?'docs/clinahir-upgrade/launch-session/deployment.json':process.argv.includes('--crm-milestone')?'docs/clinahir-upgrade/next-milestone/clinahir-deployment.json':'docs/clinahir-upgrade/staging-execution/deployment.json';
const entries=['package.json','package-lock.json','index.html','vite.config.mjs','tsconfig.json','tsconfig.tests.json','tailwind.config.js','postcss.config.js','src','components','api','server','public','scripts','worker','.openai'];
for(const path of entries){try{execFileSync('rsync',['-a','--exclude=.env*','--exclude=node_modules','--exclude=output','--exclude=.DS_Store',path,snapshot+'/'],{stdio:'pipe'});}catch{throw Error('snapshot_copy_failed_'+path);}}
await copyFile('vercel.staging.json',snapshot+'/vercel.json');
await mkdir(snapshot+'/.vercel');await writeFile(snapshot+'/.vercel/project.json',JSON.stringify({projectId:stagingProjectId,orgId:stagingTeamId,projectName:'clinahir-staging'}));
async function inventory(dir,prefix=''){const files=[];for(const e of await readdir(dir,{withFileTypes:true})){if(e.name==='.vercel')continue;const path=prefix+e.name;if(e.isDirectory())files.push(...await inventory(dir+'/'+e.name,path+'/'));else files.push({path,sha256:createHash('sha256').update(await readFile(dir+'/'+e.name)).digest('hex')});}return files.sort((a,b)=>a.path.localeCompare(b.path));}
const files=await inventory(snapshot);const sha256=createHash('sha256').update(JSON.stringify(files)).digest('hex');
const receipt={createdAt:new Date().toISOString(),projectId:stagingProjectId,sourceSha256:sha256,files,status:'snapshot_created'};
await writeFile(reportPath,JSON.stringify(receipt,null,2)+'\n');
const result=await hosting(['deploy','--yes','--scope','paraoonline','--target','preview'],undefined,{cwd:snapshot});
await writeFile('output/staging/deployment-cli.json',JSON.stringify(result),{mode:0o600});
receipt.status=result.code===0?'deployed':'failed';receipt.url=result.out.match(/https:\/\/[a-z0-9-]+\.vercel\.app/)?.[0];
await writeFile(reportPath,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({status:receipt.status,url:receipt.url,sourceSha256:sha256}));if(result.code!==0)process.exitCode=1;
