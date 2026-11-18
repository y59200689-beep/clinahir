// Disposable browser integration check. No production data, Docker or external transport.
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
const root = await mkdtemp(join(tmpdir(), 'maps-import-qa-'));
const job = { id: 'fixture', directory: join(root, 'fixture'), query: 'imaging in Rabat', city: 'Rabat', status: 'completed' };
await mkdir(job.directory);
await writeFile(join(root, 'current.json'), JSON.stringify(job));
const rows = [{ title: ' FICTIONAL   PROSPECT ', complete_address: {city:' RABAT '} }, { title:'Fictional Prospect' }, ...Array.from({length:24}, (_,i)=>({title:`Synthetic Imaging ${i}`,link:`https://maps.example.test/${i}`,web_site:`https://clinic${i}.example.test`,phone:'+212600000000',review_rating:4.5,review_count:10,address:'Synthetic address',category:'Radiologist'}))];
await writeFile(join(job.directory, 'results.json'), rows.map(r=>JSON.stringify(r)).join('\n'));
const server=spawn(process.execPath,['scripts/verify-admin.mjs'],{env:{...process.env,CLINAHIR_MAPS_OUTPUT_DIR:root},stdio:['ignore','pipe','pipe']});
let log='', browser, page;server.stdout.on('data',d=>log+=d);server.stderr.on('data',d=>log+=d);
try {
 for(let i=0;;i++){if(server.exitCode!==null)throw Error(log);if(log.includes('Isolated admin QA:'))break;if(i===150)throw Error('Fixture readiness timeout');await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1440,height:1000}});page=await context.newPage();page.setDefaultTimeout(60000);
 const origin='http://127.0.0.1:4181';
 assert.equal((await context.request.post(origin+'/api/admin?action=maps-import',{data:{jobId:'fixture',sourceUseConfirmed:true},headers:{Origin:origin}})).status(),401);
 await page.goto(origin+'/admin');await page.locator('input[name=email]').fill('owner@example.test');await page.locator('input[name=password]').fill('local-admin-fixture-only');await page.locator('button[type=submit]').click();await page.getByRole('link',{name:'Google Maps Search',exact:true}).click();
 await page.getByRole('heading',{name:'Search results · 26',exact:true}).waitFor();assert.equal(await page.locator('tbody tr').count(),20);
 await mkdir('output/playwright',{recursive:true});await page.screenshot({path:'output/playwright/maps-design-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>document.documentElement.scrollWidth<=window.innerWidth,{},{timeout:5000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);await page.screenshot({path:'output/playwright/maps-design-mobile.png',fullPage:true});await page.setViewportSize({width:1440,height:1000});await page.waitForFunction(()=>document.querySelector('aside').getBoundingClientRect().x===0);
 const button=page.getByRole('button',{name:'Send to Prospect Directory',exact:true});await button.click();assert.equal(await button.isDisabled(),true);
 assert.equal((await context.request.post(origin+'/api/admin?action=maps-import',{data:{jobId:'wrong',sourceUseConfirmed:true},headers:{Origin:origin}})).status(),409);
 assert.equal((await context.request.post(origin+'/api/admin?action=maps-import',{data:{jobId:'fixture',sourceUseConfirmed:false},headers:{Origin:origin}})).status(),400);
 await page.getByRole('checkbox').check();await button.click();await page.getByRole('heading',{name:'Prospect Directory',exact:true}).waitFor();await page.getByText('Imported 24 prospects; 2 duplicates skipped.',{exact:true}).waitFor();await page.getByText('Synthetic Imaging 23',{exact:true}).waitFor();
 const snapshot=await (await context.request.get(origin+'/api/admin?action=prospects')).json();assert.equal(snapshot.total,25);const imported=snapshot.prospects.find(p=>p.center_name==='Synthetic Imaging 23');assert.equal(imported.city,'Rabat');assert.equal(imported.website_url,'https://clinic23.example.test');assert.equal(imported.phone,'+212600000000');assert.equal(imported.listing_url,'https://maps.example.test/23');
 await page.getByRole('link',{name:'Google Maps Search',exact:true}).click();await page.getByRole('button',{name:'Send to Prospect Directory',exact:true}).click();await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Send to Prospect Directory',exact:true}).click();await page.getByText('Imported 0 prospects; 26 duplicates skipped.',{exact:true}).waitFor();
 assert.equal((await (await context.request.get(origin+'/api/admin?action=prospects')).json()).total,25);
 await mkdir('output/playwright',{recursive:true});await page.screenshot({path:'output/playwright/maps-import-verified.png',fullPage:true});
 console.log('PASS authenticated Maps import transfers all 26 captured rows, navigates to directory, skips existing and intra-batch duplicates, and repeated import adds zero rows.');
 } catch(error) {
 if(page) {
  const diagnostics = await page.evaluate(() => {
   const clipped = el => { while(el.parentElement) { el=el.parentElement; if(['auto','scroll','hidden','clip'].includes(getComputedStyle(el).overflowX))return true; } return false; };
   return {width:innerWidth,scroll:document.documentElement.scrollWidth,overflows:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&!clipped(e)).map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width})).slice(0,12)};
  }); console.error(JSON.stringify(diagnostics,null,2));
 }
 await mkdir('output/playwright',{recursive:true}); if(page){await page.screenshot({path:'output/playwright/maps-import-failure.png',fullPage:true}).catch(()=>{});await writeFile('output/playwright/maps-import-failure.txt',await page.locator('body').innerText().catch(()=>''));}console.error(log);throw error;} finally {await browser?.close();server.kill('SIGTERM');await rm(root,{recursive:true,force:true});}
