import {readFile} from 'node:fs/promises';import {compareRecovery} from './recovery.mjs';
if(process.argv.length!==4){console.error('Provide two private synthetic staging manifest paths. No files were read.');process.exitCode=2;}else{
 try{const report=compareRecovery(...await Promise.all(process.argv.slice(2).map(async path=>JSON.parse(await readFile(path,'utf8')))));console.log(JSON.stringify(report,null,2));process.exitCode=report.consistent?0:1;}catch{console.error('Invalid recovery manifest. No secret content printed.');process.exitCode=1;}
}
