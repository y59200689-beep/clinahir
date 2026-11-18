import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import lighthouse from 'lighthouse';
import {launch} from 'chrome-launcher';
import {mkdir,writeFile} from 'node:fs/promises';
import {auditServer} from './audit-server.mjs';
const dir=process.argv.includes('--final-gates')?'docs/clinahir-upgrade/final-gates':process.argv.includes('--launch-session')?'docs/clinahir-upgrade/launch-session':'docs/clinahir-upgrade/phase3',origin='http://127.0.0.1:4182';
await mkdir(dir,{recursive:true});await mkdir('output/playwright',{recursive:true});
const server=await auditServer();let browser,chrome;const report={executedAt:new Date().toISOString(),scope:'Local production artifact, fictional admin transport; external requests blocked. Not field data or WCAG certification.',axe:[],lighthouse:[]};
try{
 browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();
 await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
 const scan=async name=>{await page.waitForTimeout(1400);const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();report.axe.push({name,violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,helpUrl:v.helpUrl,nodes:v.nodes.map(n=>({target:n.target,failureSummary:n.failureSummary}))})),incomplete:result.incomplete.map(v=>({id:v.id,nodes:v.nodes.length})),passes:result.passes.length});console.log('AXE',name,result.violations.length);};
 for(const locale of ['en','fr']){
  await page.goto(origin);await page.getByLabel('Site language / Langue du site').first().selectOption(locale);await page.locator('#interactive-demo').waitFor();await page.locator('a[href="#solutions"]').first().click();await page.locator('#book-demo').waitFor();await page.evaluate(()=>scrollTo(0,0));await scan('public-'+locale);
  const nav=label=>page.locator('#interactive-demo aside').getByRole('button',{name:label,exact:true}).click();
  await nav('Patients');await scan('patients-'+locale);await page.getByRole('button',{name:locale==='fr'?'Nouveau patient':'New Patient',exact:true}).click();await scan('profile-dialog-'+locale);await page.keyboard.press('Escape');
 }
 await page.goto(origin+'/admin');await page.locator('input[name=email]').waitFor();await scan('admin-login-en');await page.locator('input[name=email]').fill('owner@example.test');await page.locator('input[name=password]').fill('local-admin-fixture-only');await page.locator('button[type=submit]').click();
 for(const locale of ['en','fr']){
  await page.getByRole('button',{name:/^Admin language \/ Langue:/}).click();await page.getByRole('option',{name:locale === 'fr' ? 'Français' : 'English',exact:true}).click();
  const routes=locale==='fr'?['Vue d’ensemble','Demandes entrantes','Répertoire des prospects','Contenu du site','Analyse des conversions','Centre des transmissions','Journal d’audit','Paramètres']:['Overview','Inbound Leads','Prospect Directory','Website Content','Conversion Insights','Delivery Center','Audit Activity','Settings'];
  for(const route of routes){await page.getByRole('link',{name:new RegExp('^'+route)}).first().click();await page.locator('main h1').waitFor();await scan('admin-'+locale+'-'+route);}
 }
 await page.screenshot({path:'output/playwright/phase3-admin-audit.png'});
 await browser.close();browser=undefined;
 chrome=await launch({chromePath:chromium.executablePath(),chromeFlags:['--headless','--disable-gpu'],logLevel:'silent'});
 for(const [name,path,formFactor]of [['public-mobile','/','mobile'],['admin-login-desktop','/admin','desktop']]){
  const result=await lighthouse(origin+path,{port:chrome.port,logLevel:'error',output:'json',onlyCategories:['performance','accessibility','best-practices','seo'],formFactor,screenEmulation:formFactor==='desktop'?{mobile:false,width:1440,height:1000,deviceScaleFactor:1,disabled:false}:undefined,blockedUrlPatterns:['https://*']},formFactor==='desktop'?desktopConfig:undefined);
  const lhr=result.lhr;await writeFile(`${dir}/lighthouse-${name}.json`,JSON.stringify(lhr,null,2)+'\n');
  report.lighthouse.push({name,fetchTime:lhr.fetchTime,lighthouseVersion:lhr.lighthouseVersion,categories:Object.fromEntries(Object.entries(lhr.categories).map(([k,v])=>[k,v.score])),metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(id=>[id,{value:lhr.audits[id]?.numericValue,unit:lhr.audits[id]?.numericUnit}])),failedAudits:Object.entries(lhr.audits).filter(([,a])=>a.score!==null&&a.score<1).map(([id,a])=>({id,title:a.title,score:a.score,displayValue:a.displayValue}))});console.log('LIGHTHOUSE',name);
 }
}catch(error){console.error(error);report.error='Audit execution failed; inspect local diagnostics and do not infer a pass.';process.exitCode=1;}
finally{await browser?.close();await chrome?.kill();await new Promise(resolve=>server.close(resolve));await writeFile(`${dir}/audit-results.json`,JSON.stringify(report,null,2)+'\n');}
if(report.error)console.error(report.error);
if(report.axe.some(scan=>scan.violations.length))process.exitCode=1;
