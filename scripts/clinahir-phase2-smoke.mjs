import {spawn} from 'node:child_process';import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';import {chromium} from 'playwright';
const origin='http://127.0.0.1:4181',server=spawn(process.execPath,['scripts/verify-admin.mjs'],{stdio:['ignore','pipe','pipe']});let log='';server.stdout.on('data',d=>log+=d);server.stderr.on('data',d=>log+=d);const passed=[],errors=[];let browser;
const check=async(name,fn)=>{await fn();passed.push(name);console.log('PASS',name);};
try{
 for(let i=0;;i++){if(server.exitCode!==null)throw Error(log);if(log.includes('Isolated admin QA:'))break;if(i===150)throw Error('Fixture readiness timeout');await new Promise(r=>setTimeout(r,200));}
 browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/analytics',r=>r.fulfill({json:{ok:true}}));await page.addInitScript(()=>localStorage.setItem('site-language','en'));
 await page.goto(origin);await page.locator('#interactive-demo').waitFor();const nav=name=>page.locator('#interactive-demo aside').getByRole('button',{name,exact:true}).click();
 await check('English profile creation, validation, editing, archive and undo survive navigation',async()=>{
  for(const [route,add,name]of [['Patients','New Patient','Synthetic Patient'],['Doctors','Add doctor','Synthetic Radiologist'],['Staff','New account','Synthetic Coordinator']]){
   await nav(route);await page.getByRole('button',{name:add,exact:true}).click();let d=page.getByRole('dialog');await d.getByRole('button',{name:'Save profile'}).click();await d.getByRole('alert').waitFor();
   await d.getByLabel('Sample name',{exact:true}).fill(name);if(route==='Patients')await d.getByLabel('Sample phone').fill('0000000000');if(route==='Doctors')await d.getByLabel('Specialty').fill('Radiology');await d.getByRole('button',{name:'Save profile'}).click();await d.waitFor({state:'hidden'});
   await page.getByLabel('Search profiles',{exact:true}).fill(name);let row=page.locator('tr[data-profile-id]');assert.equal(await row.count(),1);await row.getByRole('button',{name:'Edit profile'}).click();d=page.getByRole('dialog');await d.getByLabel('Sample name',{exact:true}).fill(name+' Edited');await d.getByRole('button',{name:'Save profile'}).click();await d.waitFor({state:'hidden'});
   await nav('Agenda');await nav(route);await page.getByLabel('Search profiles',{exact:true}).fill(name+' Edited');row=page.locator('tr[data-profile-id]');assert.equal(await row.count(),1);
   await row.getByRole('button',{name:'Archive',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Archive',exact:true}).click();await page.getByRole('button',{name:'Undo archive'}).click();assert.equal(await page.locator('tr[data-profile-id]').count(),1);
  }
 });
 await check('New doctor and patient assignment, conflict prevention and profile-calendar synchronization',async()=>{
  await nav('Appointments');await page.getByRole('button',{name:'New Appointment',exact:true}).click();let d=page.getByRole('dialog');
  const patient=await d.getByLabel('Patient profile',{exact:true}).locator('option').last().getAttribute('value');await d.getByLabel('Patient profile',{exact:true}).selectOption(patient);await d.getByLabel('Doctor',{exact:true}).selectOption({index:4});await d.getByLabel('Date',{exact:true}).fill('2026-09-29');await d.getByLabel('Time',{exact:true}).fill('08:00');await d.getByRole('button',{name:'Save appointment'}).click();await d.waitFor({state:'hidden'});
  await nav('Doctors');await page.getByLabel('Search profiles',{exact:true}).fill('Synthetic Radiologist Edited');let row=page.locator('tr[data-profile-id]');assert.equal(await row.locator('td').nth(2).innerText(),'1');
  await row.getByRole('button',{name:'Archive',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Archive',exact:true}).click();await page.getByRole('dialog').getByRole('alert').waitFor();await page.keyboard.press('Escape');
  await row.getByRole('button',{name:'Edit profile'}).click();await page.getByRole('dialog').getByLabel('Sample name',{exact:true}).fill('Renamed Synthetic Doctor');await page.getByRole('dialog').getByRole('button',{name:'Save profile'}).click();
  await nav('Appointments');await page.getByRole('button',{name:'New Appointment',exact:true}).click();d=page.getByRole('dialog');await d.getByLabel('Doctor',{exact:true}).selectOption({index:4});await d.getByRole('button',{name:'Save appointment'}).click();await d.getByRole('alert').waitFor();await page.keyboard.press('Escape');
  await page.getByPlaceholder('Search by name, phone, service or doctor...').fill('Renamed Synthetic Doctor');await page.getByRole('button',{name:'Details / edit'}).click();d=page.getByRole('dialog');await d.getByLabel('Time',{exact:true}).fill('08:30');await d.getByRole('button',{name:'Save appointment'}).click();await d.waitFor({state:'hidden'});
  await nav('Agenda');const event=page.getByRole('button').filter({hasText:'08:30'}).first();await event.click();d=page.getByRole('dialog');assert.equal(await d.getByLabel('Time',{exact:true}).inputValue(),'08:30');await page.keyboard.press('Escape');
 });
 await check('French demo profile create/edit/archive/restore and appointment validation',async()=>{
  await page.getByLabel('Site language / Langue du site').first().selectOption('fr');await nav('Patients');await page.getByRole('button',{name:'Nouveau patient',exact:true}).click();let d=page.getByRole('dialog');await d.getByLabel('Nom fictif',{exact:true}).fill('Patient Fictif Français');await d.getByLabel('Téléphone fictif').fill('0000000000');await d.getByRole('button',{name:'Enregistrer le profil'}).click();await d.waitFor({state:'hidden'});
  await page.getByLabel('Rechercher un profil',{exact:true}).fill('Patient Fictif Français');await page.locator('tr[data-profile-id]').getByRole('button',{name:'Modifier le profil'}).click();await page.getByRole('dialog').getByLabel('Nom fictif',{exact:true}).fill('Patient Fictif Modifié');await page.getByRole('dialog').getByRole('button',{name:'Enregistrer le profil'}).click();await page.getByLabel('Rechercher un profil',{exact:true}).fill('Patient Fictif Modifié');await page.locator('tr[data-profile-id]').getByRole('button',{name:'Archiver',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Archiver',exact:true}).click();await page.getByRole('button',{name:'Archivés',exact:true}).click();await page.locator('tr[data-profile-id]').getByRole('button',{name:'Restaurer'}).click();
  for(const [route,add,name]of [['Médecins','Ajouter un médecin','Médecin Fictif Français'],['Personnel','Nouveau compte','Équipe Fictive Française']]){await nav(route);await page.getByRole('button',{name:add,exact:true}).click();let form=page.getByRole('dialog');await form.getByLabel('Nom fictif',{exact:true}).fill(name);if(route==='Médecins')await form.getByLabel('Spécialité').fill('Radiologie');await form.getByRole('button',{name:'Enregistrer le profil'}).click();await form.waitFor({state:'hidden'});await page.getByLabel('Rechercher un profil',{exact:true}).fill(name);await page.locator('tr[data-profile-id]').getByRole('button',{name:'Modifier le profil'}).click();form=page.getByRole('dialog');await form.getByLabel('Nom fictif',{exact:true}).fill(name+' Modifié');await form.getByRole('button',{name:'Enregistrer le profil'}).click();await page.getByLabel('Rechercher un profil',{exact:true}).fill(name+' Modifié');await page.locator('tr[data-profile-id]').getByRole('button',{name:'Archiver',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Archiver',exact:true}).click();await page.getByRole('button',{name:'Annuler l’archivage'}).click();}
  await nav('Rendez-vous');await page.getByRole('button',{name:'Nouveau RDV',exact:true}).click();d=page.getByRole('dialog');await d.getByLabel('Nom fictif du patient',{exact:true}).fill(' ');await d.getByRole('button',{name:'Enregistrer le rendez-vous'}).click();await d.getByRole('alert').first().waitFor();await page.keyboard.press('Escape');
 });
 await check('French unauthorized login error, owner session and every admin route',async()=>{
  await page.goto(origin+'/admin');await page.getByRole('button',{name:/^Admin language \/ Langue:/}).click();await page.getByRole('option',{name:'Français',exact:true}).click();await page.locator('input[name=email]').fill('owner@example.test');await page.locator('input[name=password]').fill('incorrect');await page.locator('button[type=submit]').click();await page.getByText('L’adresse e-mail ou le mot de passe est incorrect.',{exact:true}).waitFor();await page.locator('input[name=password]').fill('local-admin-fixture-only');await page.locator('button[type=submit]').click();
  const routes=[['Vue d’ensemble','Vue d’ensemble'],['Demandes entrantes','Demandes entrantes'],['Répertoire des prospects','Répertoire des prospects'],['Contenu du site','Contenu du site'],['Analyse des conversions','Statistiques'],['Centre des transmissions','Transmissions'],['Journal d’audit','Journal d’activité'],['Paramètres','Paramètres']];
  for(const [button,heading]of routes){await page.getByRole('link',{name:new RegExp('^'+button)}).first().click();await page.getByRole('heading',{name:heading,exact:true}).waitFor();assert.equal(await page.locator('main').getByText('Operation failed. Please try again.',{exact:true}).count(),0);}
 });
 await page.screenshot({path:'output/playwright/phase2-admin-fr.png'});
 await check('French lead edits preserve machine stage values and French prospect review persists',async()=>{
  await page.getByRole('link',{name:/^Demandes entrantes/}).click();await page.getByRole('row',{name:/Ouvrir Atlas Imaging Center/}).click();let d=page.getByRole('dialog',{name:'Fiche de la demande'});const stagePicker=d.getByRole('button',{name:/^Étape de la demande:/});await stagePicker.press('ArrowDown');await d.getByRole('listbox').waitFor();await page.keyboard.press('Escape');await d.getByRole('listbox').waitFor({state:'hidden'});assert.equal(await d.isVisible(),true);await stagePicker.click();await d.getByRole('option',{name:'Qualifié',exact:true}).click();await d.getByLabel('Notes internes').fill('Note fictive en français');await d.getByRole('button',{name:'Enregistrer les modifications'}).click();await d.waitFor({state:'hidden'});await page.getByRole('row',{name:/Ouvrir Atlas Imaging Center/}).click();assert.equal((await page.getByRole('dialog').getByRole('button',{name:/^Étape de la demande:/}).innerText()).trim(),'Qualifié');await page.keyboard.press('Escape');
  await page.getByRole('link',{name:'Répertoire des prospects',exact:true}).click();await page.getByRole('row').filter({hasText:'Fictional Prospect'}).click();d=page.getByRole('dialog',{name:'Fiche du prospect'});await d.getByRole('button',{name:/^Statut de vérification:/}).click();await d.getByRole('option',{name:'Qualifié',exact:true}).click();await d.getByLabel('Notes internes').fill('Vérification fictive');await d.getByRole('button',{name:'Enregistrer la vérification'}).click();await d.waitFor({state:'hidden'});
 });
 await check('French snapshot outage shows actionable failure and retry recovers',async()=>{
  await page.route('**/api/admin?action=snapshot*',route=>route.fulfill({status:503,json:{error:'The admin service is temporarily unavailable. Please try again shortly.'}}));
  await page.getByRole('link',{name:/^Demandes entrantes/}).click();await page.getByLabel('Rechercher une demande…').fill('Atlas');await page.getByRole('alert').filter({hasText:'Le service d’administration est temporairement indisponible.'}).waitFor();await page.unroute('**/api/admin?action=snapshot*');await page.getByRole('button',{name:'Réessayer',exact:true}).click();await page.getByRole('row',{name:/Ouvrir Atlas Imaging Center/}).waitFor();
 });
 await check('Admin French and English switch without reloading or changing content-editor locale',async()=>{
  await page.getByRole('link',{name:'Contenu du site',exact:true}).click();await page.getByRole('button',{name:'Enregistrer le brouillon'}).waitFor();await page.getByRole('button',{name:'Français',exact:true}).click();await page.locator('textarea').first().fill('Titre fictif français');await page.getByRole('button',{name:'Enregistrer le brouillon'}).click();await page.getByText('Brouillon enregistré.',{exact:true}).waitFor();await page.getByRole('button',{name:/^Admin language \/ Langue:/}).click();await page.getByRole('option',{name:'English',exact:true}).click();await page.getByRole('heading',{name:'Website Content',exact:true}).waitFor();assert.equal(await page.locator('textarea').first().inputValue(),'Titre fictif français');
 });
 await check('English admin route parity and accessible control names',async()=>{
  const routes=[['Overview','Overview'],['Inbound Leads','Inbound Leads'],['Prospect Directory','Prospect Directory'],['Website Content','Website Content'],['Conversion Insights','Analytics'],['Delivery Center','Deliveries'],['Audit Activity','Activity Log'],['Settings','Settings']];
  for(const[button,heading]of routes){await page.getByRole('link',{name:new RegExp('^'+button)}).first().click();await page.getByRole('heading',{name:heading,exact:true}).waitFor();const unnamed=await page.locator('main button').evaluateAll(buttons=>buttons.filter(button=>button.getClientRects().length&&!button.textContent.trim()&&!button.getAttribute('aria-label')&&!button.getAttribute('title')&&!button.getAttribute('aria-labelledby')).length);assert.equal(unnamed,0,heading);}
  await page.getByRole('link',{name:'Website Content',exact:true}).click();
 });
 await check('Admin deep links preserve the session, history and sign-in destination',async()=>{
  const routes=[['Overview','overview'],['Inbound Leads','leads'],['Google Maps Search','maps'],['Prospect Directory','prospects'],['Website Content','website'],['Conversion Insights','analytics'],['Delivery Center','deliveries'],['Audit Activity','activity'],['Settings','settings']];
  for(const [name,slug] of routes){
   const link=page.getByRole('link',{name,exact:true});
   assert.equal(await link.getAttribute('href'),'/admin/'+slug);
   await link.click();
   assert.equal(new URL(page.url()).pathname,'/admin/'+slug);
   await page.reload();
   await page.getByRole('link',{name,exact:true}).and(page.locator('[aria-current=page]')).waitFor();
   assert.equal(await page.locator('input[name=password]').count(),0);
  }
  await page.getByRole('link',{name:'Google Maps Search',exact:true}).click();
  await page.goBack();await page.getByRole('link',{name:'Settings',exact:true}).and(page.locator('[aria-current=page]')).waitFor();
  await page.goForward();await page.getByRole('heading',{name:'Google Maps Search',exact:true}).waitFor();
  const visitor=await browser.newContext();
  try{
   const tab=await visitor.newPage();
   await tab.goto(origin+'/admin/prospects');
   await tab.locator('input[name=email]').fill('owner@example.test');
   await tab.locator('input[name=password]').fill('local-admin-fixture-only');
   await tab.locator('button[type=submit]').click();
   await tab.getByRole('heading',{name:'Prospect Directory',exact:true}).waitFor();
   assert.equal(new URL(tab.url()).pathname,'/admin/prospects');
  }finally{await visitor.close();}
  await page.getByRole('link',{name:'Website Content',exact:true}).click();
 });
 await check('Mobile and tablet admin layouts, focus containment and Escape navigation',async()=>{
  for(const width of [390,768,1024]){await page.setViewportSize({width,height:900});await page.getByRole('heading',{name:'Website Content',exact:true}).waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(width===390){await page.getByRole('button',{name:'Open navigation'}).click();await page.keyboard.press('Tab');assert.ok(await page.locator('aside').evaluate(el=>el.contains(document.activeElement)));await page.keyboard.press('Escape');}}
  await page.screenshot({path:'output/playwright/phase2-admin-tablet.png'});
 });
 await check('Fresh browser context has no profile edits or admin session',async()=>{
  const isolated=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const p=await isolated.newPage();await p.addInitScript(()=>localStorage.setItem('site-language','en'));await p.route('**/api/analytics',r=>r.fulfill({json:{ok:true}}));await p.goto(origin);await p.locator('#interactive-demo').waitFor();await p.locator('#interactive-demo aside').getByRole('button',{name:'Doctors',exact:true}).click();await p.getByLabel('Search profiles',{exact:true}).fill('Renamed Synthetic Doctor');assert.equal(await p.locator('tr[data-profile-id]').count(),0);assert.equal((await isolated.request.get(origin+'/api/admin?action=snapshot')).status(),401);await isolated.close();
 });
 assert.deepEqual(errors,[]);
}catch(error){console.error(error);process.exitCode=1;for(const c of browser?.contexts()??[])for(const p of c.pages()){await p.screenshot({path:'output/playwright/phase2-failure.png'}).catch(()=>{});await writeFile('output/playwright/phase2-failure.txt',await p.locator('body').innerText()).catch(()=>{});}}
finally{await mkdir('docs/clinahir-upgrade',{recursive:true});await writeFile('docs/clinahir-upgrade/phase2-browser-results.json',JSON.stringify({passed,errors,success:process.exitCode!==1},null,2)+'\n');await browser?.close();server.kill('SIGTERM');}
