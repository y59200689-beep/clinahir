import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const testRoot = await mkdtemp(join(tmpdir(), 'maps-jobs-test-'));
process.env.CLINAHIR_MAPS_OUTPUT_DIR = testRoot;
const { mapsDevRequest } = await import('../scripts/maps-dev.mjs');
const request = (action, body, method = body ? 'POST' : 'GET') => new Request(`http://localhost/api/admin?action=${action}`, { method, headers: { origin: 'http://localhost', 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
test('local Maps jobs validate input, preserve partial results and escape CSV formulas', async () => {
  assert.equal((await mapsDevRequest(request('maps-start'))).status, 405);
  assert.equal((await mapsDevRequest(request('maps-start', { keywords: 'x\nmalicious', city: 'City', proxy: 'none' }))).status, 400);
  assert.equal((await mapsDevRequest(new Request('http://localhost/api/admin?action=maps-start', { method: 'POST', headers: { origin: 'http://other' } }))).status, 403);
  const bin = await mkdtemp(join(tmpdir(), 'maps-test-'));
  const oldPath = process.env.PATH;
  try {
    await writeFile(join(bin, 'docker'), '#!/bin/sh\ncase "$1" in\ninfo) echo 1;;\nps) exit 0;;\ninspect) echo \'{"Status":"exited","ExitCode":1}\';;\nesac\n', { mode: 0o700 });
    await writeFile(join(bin, 'bash'), '#!/usr/bin/env node\nconst fs=require("node:fs"); const a=process.argv; const dir=a[a.indexOf("--output-dir")+1];fs.writeFileSync(dir+"/results.json",JSON.stringify({title:"=FORMULA()",input_id:"clinahir-1",web_site:"https://example.com",phone:"+212123",address:"a,b",website:"javascript:alert(1)"})+"\\n");', { mode: 0o700 });
    process.env.PATH = `${bin}:${oldPath}`;
    const started = await mapsDevRequest(request('maps-start', { keywords: 'radiology', city: 'Casablanca, Morocco; Rabat; casablanca, morocco', proxy: 'none' }));
    assert.equal(started.status, 200);
    const { job } = await started.json();
    const queries = await readFile(join(testRoot, job.id, 'queries.txt'), 'utf8');
    assert.match(queries, /^radiology in casablanca, morocco #!#clinahir-0\nradiology in Rabat #!#clinahir-1\n$/);
    assert.equal((await mapsDevRequest(request('maps-start', { keywords: 'test', city: 'city', proxy: 'none' }))).status, 409);
    // Wait for the asynchronous process to write its result.
    let result;
    for (let i=0;i<200;i++) { result=await (await mapsDevRequest(request('maps-status'))).json(); if(result.job.status==='failed')break; await new Promise(r=>setTimeout(r,100)); }
    assert.equal(result.job.status,'failed'); assert.equal(result.total,1); assert.equal(result.rows[0].city,'Rabat'); assert.equal(result.rows[0].title,'=FORMULA()'); assert.equal(result.rows[0].website,'https://example.com');
    const csv = await (await mapsDevRequest(request('maps-export'))).text();
    assert.ok(csv.includes('"\'=FORMULA()"')); assert.ok(csv.includes('"\'+212123"')); assert.ok(csv.includes('"a,b","Rabat"'));
  } finally { process.env.PATH=oldPath; await rm(bin,{recursive:true,force:true}); await rm(testRoot,{recursive:true,force:true}); delete process.env.CLINAHIR_MAPS_OUTPUT_DIR; }
});
