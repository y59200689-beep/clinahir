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
 await page.goto('http://clinahir.localhost:4181/admin');await page.locator('input[name=email]').fill('owner@example.test');await page.locator('input[name=password]').fill('local-admin-fixture-only');await page.locator('button[type=submit]').click();await page.getByRole('link',{name:'Google Maps Search',exact:true}).click();await page.getByText('Online searches',{exact:true}).waitFor();
 await page.locator('.maps-options summary').click();
 const proxy=page.getByRole('button',{name:/^Proxy:/});
 await proxy.click();
 assert.equal(await page.getByRole('option',{name:'Use the configured local proxy',exact:true}).isDisabled(),true);
 await page.keyboard.press('ArrowDown');
 await page.keyboard.press('Enter');
 assert.match(await proxy.innerText(),/Continue without a proxy/);
 const search=page.getByRole('button',{name:'Search businesses',exact:true});assert.equal(await search.isEnabled(),true);assert.equal(await page.getByText(/Open this dashboard on localhost/).count(),0);
 await page.getByRole('textbox',{name:'Keywords',exact:true}).fill('Synthetic imaging');await page.getByRole('textbox',{name:'Cities or areas',exact:true}).fill('Rabat; Tangier');await search.click();const progress=page.getByRole('progressbar',{name:'Search progress'});
 await progress.waitFor();
 assert.equal(await progress.getAttribute('aria-valuetext'),'Queued');
 assert.equal(await progress.getAttribute('aria-valuenow'),null);
 await page.locator('[aria-label="Elapsed time"]').waitFor();
 await page.route('**/api/admin?action=maps-status',async route=>{
  const response=await route.fetch();
  const data=await response.json();
  await route.fulfill({response,json:{...data,job:{...data.job,startedAt:new Date(Date.now()-350000).toISOString()}}});
 });
 await page.reload();
 await progress.waitFor();
 assert.equal(await progress.getAttribute('aria-valuetext'),'Queued');
 await page.getByText('Taking longer than usual to start.',{exact:true}).waitFor();
 await page.unroute('**/api/admin?action=maps-status');
 const statusUrl='**/api/admin?action=maps-status';
 await page.route(statusUrl,async route=>{
  const response=await route.fetch();
  const queued=await response.json();
  await route.fulfill({response,json:{...queued,total:1,rows:[{title:'Live Imaging',category:'Imaging',city:'Rabat',location:'Rabat',website:'',phone:'',listing:'',rating:'',reviews:'',address:'',directoryMatch:false}],job:{...queued.job,status:'running',lastWorkerUpdate:new Date(Date.now()-125000).toISOString(),milestones:['finished','searching']}}});
 });
 await page.getByRole('status').filter({hasText:'Searching Google Maps'}).waitFor();
 assert.equal(await progress.getAttribute('aria-valuetext'),'Searching Google Maps');
 assert.equal(await progress.locator('span').first().getAttribute('data-state'),'complete');
 await page.getByText('Last worker update 2 minutes ago',{exact:true}).waitFor();
 await page.getByText('1 businesses found so far',{exact:true}).waitFor();
 await page.getByText('1 of 2 cities finished',{exact:true}).waitFor();
 await page.getByRole('row').filter({hasText:'Live Imaging'}).waitFor();
 await page.locator('.maps-history summary').click();
 await page.getByRole('button',{name:'Synthetic imaging in Rabat; Tangier',exact:true}).waitFor();
 await page.unroute(statusUrl);
 await page.getByRole('button',{name:'Stop search',exact:true}).click();await progress.waitFor({state:'hidden'});await search.waitFor();assert.equal(await search.isEnabled(),true);
 await page.getByRole('button',{name:'Rerun',exact:true}).click();
 await progress.waitFor();
 await page.getByRole('button',{name:'Synthetic imaging in Rabat; Tangier',exact:true}).last().click();
 await page.getByRole('button',{name:'Back to latest search',exact:true}).click();
 await progress.waitFor();
 await page.getByRole('button',{name:'Stop search',exact:true}).click();
 await progress.waitFor({state:'hidden'});
 await mkdir('output/playwright',{recursive:true});await page.screenshot({path:'output/playwright/maps-hosted-ready.png',fullPage:true});console.log('PASS non-local admin enables online searches, queues work, displays status and stops the queued job.');
}finally{await browser?.close();server.kill('SIGTERM');}
