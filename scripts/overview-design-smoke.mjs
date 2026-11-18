// Isolated Overview UI verification. Fictional data and local transport only.
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const origin='http://127.0.0.1:4181';
const server=spawn(process.execPath,['scripts/verify-admin.mjs'],{stdio:['ignore','pipe','pipe']});let log='',browser,page,zero=false;
server.stdout.on('data',d=>log+=d);server.stderr.on('data',d=>log+=d);
try{
 for(let i=0;;i++){if(server.exitCode!==null)throw Error(log);if(log.includes('Isolated admin QA:'))break;if(i===150)throw Error('Fixture readiness timeout');await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});page=await context.newPage();page.setDefaultTimeout(30000);
 await page.route('**/api/admin?action=snapshot*',async route=>{const response=await route.fetch();const data=await response.json();if(zero){data.leads=[];data.total=0;data.summary={total:0,new:0,qualified:0,won:0,attention:0};data.analytics=data.analytics.map(r=>({...r,demo_submissions:0}));data.heartbeat=null;data.integrations={dailyCommand:false,whatsappConfigured:false,whatsappEnabled:false,cron:false};}await route.fulfill({json:data});});
 await page.goto(origin+'/admin');await page.locator('input[name=email]').fill('owner@example.test');await page.locator('input[name=password]').fill('local-admin-fixture-only');await page.locator('button[type=submit]').click();
 await page.locator('.overview-metric strong').first().getByText('2',{exact:true}).waitFor();assert.equal(await page.locator('.overview-metric').count(),4);assert.equal(await page.locator('.overview-chart-column').count(),7);
 await page.getByRole('button',{name:'14 Days',exact:true}).click();assert.equal(await page.locator('.overview-chart-column').count(),14);assert.equal(await page.getByRole('button',{name:'14 Days',exact:true}).getAttribute('aria-pressed'),'true');
 await page.locator('.overview-lead button').first().click();await page.getByRole('heading',{name:'Inbound Leads',exact:true}).waitFor();await page.getByRole('button',{name:'Overview',exact:true}).click();
 await page.locator('.overview-metric strong').first().getByText('2',{exact:true}).waitFor();await page.waitForFunction(()=>document.querySelectorAll('.overview-table tbody tr').length===4);await mkdir('output/playwright',{recursive:true});await page.screenshot({path:'output/playwright/overview-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>document.documentElement.scrollWidth<=window.innerWidth);await page.screenshot({path:'output/playwright/overview-mobile.png',fullPage:true});
 await page.getByLabel('Admin language / Langue').selectOption('fr');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);await page.screenshot({path:'output/playwright/overview-mobile-fr.png',fullPage:true});await page.getByLabel('Admin language / Langue').selectOption('en');
 await page.setViewportSize({width:1440,height:1000});zero=true;await page.reload();await page.getByRole('heading',{name:'No inquiries recorded yet',exact:true}).waitFor();await page.getByRole('heading',{name:'No submissions in this period',exact:true}).waitFor();assert.equal(await page.locator('.overview-chart-column').count(),0);assert.equal(await page.locator('.overview-followup').count(),0);await page.screenshot({path:'output/playwright/overview-empty.png',fullPage:true});
 await page.getByRole('button',{name:'Find prospects',exact:true}).click();await page.getByRole('heading',{name:'Google Maps Search',exact:true}).waitFor();console.log('PASS Overview populated/empty states, chart period controls, inquiry navigation, prospect discovery, French copy and 390px layout.');
}catch(error){if(page){await mkdir('output/playwright',{recursive:true});await page.screenshot({path:'output/playwright/overview-failure.png',fullPage:true}).catch(()=>{});await writeFile('output/playwright/overview-failure.txt',await page.locator('body').innerText().catch(()=>''));}console.error(log);throw error;}finally{await browser?.close();server.kill('SIGTERM');}
