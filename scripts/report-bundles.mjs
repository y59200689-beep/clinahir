import {readdir,readFile,writeFile} from 'node:fs/promises';import {gzipSync} from 'node:zlib';
const dir='dist/client/assets',files=(await readdir(dir)).filter(name=>name.endsWith('.js'));
const chunks=await Promise.all(files.map(async name=>{const source=await readFile(`${dir}/${name}`);return{name,bytes:source.length,gzipBytes:gzipSync(source).length};}));
chunks.sort((a,b)=>b.bytes-a.bytes);const report={scope:'Local production-build byte counts, not field Core Web Vitals',chunks,over500KiB:chunks.filter(chunk=>chunk.bytes>500*1024).map(chunk=>chunk.name)};
await writeFile('docs/clinahir-upgrade/phase2-bundles.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({largest:chunks.slice(0,4),over500KiB:report.over500KiB},null,2));
