// Non-local hostname exercises the hosted UI using an isolated fictional backend.
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const server=spawn(process.execPath,['scripts/verify-admin.mjs'],{env:{...process.env,CLINAHIR_MAPS_HOSTED_QA:'true'},stdio:['ignore','pipe','pipe']});let log='',browser;
server.stdout.on('data',d=>log+=d);server.stderr.on('data',d=>log+=d);
try{
 for(let i=0;;i++){if(server.exitCode!==null)throw Error(log);if(log.includes('Isolated admin QA:'))break;if(i===150)throw Error('Fixture readiness timeout');await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(30000);
 await page.goto('http://clinahir.localhost:4181/admin');await page.locator('input[name=email]').fill('owner@example.test');await page.locator('input[name=password]').fill('local-admin-fixture-only');await page.locator('button[type=submit]').click();await page.getByRole('button',{name:'Google Maps Search',exact:true}).click();await page.getByText('Online searches',{exact:true}).waitFor();
 const search=page.getByRole('button',{name:'Search businesses',exact:true});assert.equal(await search.isEnabled(),true);assert.equal(await page.getByText(/Open this dashboard on localhost/).count(),0);
 await page.getByRole('textbox',{name:'Keywords',exact:true}).fill('Synthetic imaging');await page.getByRole('textbox',{name:'City or area',exact:true}).fill('Rabat');await search.click();await page.getByText('Your search is queued. The online worker will pick it up shortly.',{exact:true}).waitFor();await page.getByRole('button',{name:'Stop search',exact:true}).click();await search.waitFor();assert.equal(await search.isEnabled(),true);
 await mkdir('output/playwright',{recursive:true});await page.screenshot({path:'output/playwright/maps-hosted-ready.png',fullPage:true});console.log('PASS non-local admin enables online searches, queues work, displays status and stops the queued job.');
}finally{await browser?.close();server.kill('SIGTERM');}
