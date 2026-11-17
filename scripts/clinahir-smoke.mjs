// Local-only browser QA. Admin transport is a deterministic fixture; public APIs are intercepted.
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const origin = 'http://127.0.0.1:4181';
const server = spawn(process.execPath, ['scripts/verify-admin.mjs'], { stdio: ['ignore', 'pipe', 'pipe'] });
let serverLog = ''; server.stdout.on('data', d => serverLog += d); server.stderr.on('data', d => serverLog += d);
let browser; const results = []; const failures = [];
const check = async (name, action) => { await action(); results.push(name); console.log('PASS', name); };
try {
  for (let i = 0; ; i++) {
    if (server.exitCode !== null) throw new Error(serverLog);
    try { if ((await fetch(origin)).ok) break; } catch {}
    if (i === 100) throw new Error(`Fixture server timeout: ${serverLog}`);
    await new Promise(r => setTimeout(r, 300));
  }
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage(); page.on('pageerror', e => failures.push(e.message));
  await page.route('**/api/analytics', route => route.fulfill({ json: { ok: true } }));
  let leadCalls = 0; let leadFailure = false;
  await page.route('**/api/leads', async route => { leadCalls++; await route.fulfill({ status: leadFailure ? 503 : 201, json: leadFailure ? {error:'Fixture outage'} : {ok:true,externalId:'cli_11111111-1111-4111-8111-111111111111'} }); });
  await page.addInitScript(() => localStorage.setItem('site-language', 'en'));
  await page.goto(origin); await page.locator('#interactive-demo').waitFor();
  const nav = name => page.locator('#interactive-demo aside').getByRole('button', { name, exact: true }).click();
  await check('Homepage and English/French language selection', async () => {
    await page.getByLabel('Site language / Langue du site').first().selectOption('fr');
    await page.waitForFunction(() => document.documentElement.lang === 'fr');
    await page.getByLabel('Site language / Langue du site').first().selectOption('en');
    await page.waitForFunction(() => document.documentElement.lang === 'en');
  });
  await check('Create appointment, detect conflict, edit and share calendar state', async () => {
    await nav('Appointments'); await page.getByRole('button', { name: 'New Appointment', exact: true }).click();
    let dialog = page.getByRole('dialog', { name: 'New Appointment' });
    await dialog.getByLabel('Sample patient name').fill('Synthetic QA'); await dialog.getByLabel('Date', {exact:true}).fill('2026-09-29'); await dialog.getByLabel('Time', {exact:true}).fill('08:00');
    await dialog.getByRole('button', {name:'Save appointment'}).click(); await dialog.waitFor({state:'hidden'});
    await page.getByPlaceholder('Search by name, phone, service or doctor...').fill('Synthetic QA');
    assert.equal(await page.locator('tbody tr').count(),1);
    await page.getByRole('button', {name:'New Appointment',exact:true}).click();
    await page.getByRole('dialog').getByRole('button',{name:'Save appointment'}).click();
    assert.match(await page.getByRole('dialog').getByRole('alert').innerText(), /already has/);
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Details / edit'}).click();
    dialog = page.getByRole('dialog',{name:'Appointment details'}); await dialog.getByLabel('Time',{exact:true}).fill('08:30');
    await dialog.getByRole('button',{name:'Save appointment'}).click();
    await nav('Agenda'); await page.getByRole('button').filter({hasText:'08:30'}).first().waitFor(); assert.ok(await page.getByRole('button').filter({hasText:'08:30'}).count());
    await page.getByRole('button',{name:'Week',exact:true}).click(); await page.getByRole('button',{name:'Day',exact:true}).click();
    await nav('Appointments'); await page.getByPlaceholder('Search by name, phone, service or doctor...').fill('Synthetic QA');
    await page.getByRole('button',{name:'Details / edit'}).click(); await page.getByRole('dialog').locator('select[name=status]').selectOption('cancelled');
    await page.getByRole('dialog').getByRole('button',{name:'Save appointment'}).click();
    await nav('Patients'); await page.getByLabel('Sort patients').selectOption('visits'); await nav('Staff'); await nav('Doctors'); await nav('Activity Log');
  });
  await check('Demo form validation, visible outage, successful confirmation', async () => {
    const form = page.locator('#book-demo form'); await form.getByRole('button',{name:/demo|request/i}).click(); assert.ok(await form.locator('[aria-invalid="true"]').count());
    await form.locator('[name=center_name]').fill('Fixture Center'); await form.locator('[name=city]').fill('Rabat'); await form.locator('[name=contact_name]').fill('Fixture Owner'); await form.locator('[name=phone]').fill('+212600000000');
    await page.locator('#demo-role').click(); await page.getByRole('option',{name:'Owner / director',exact:true}).click();
    await page.locator('#demo-priority').click(); await page.locator('#demo-priority-options').getByRole('option').first().click();
    leadFailure = true; await form.locator('button[type=submit]').click(); await form.getByRole('alert').waitFor();
    leadFailure = false; await form.locator('button[type=submit]').click(); await page.getByRole('dialog',{name:'Request received'}).waitFor(); assert.equal(leadCalls,2); await page.keyboard.press('Escape');
  });
  await check('Mobile homepage fits viewport', async () => {
    await page.setViewportSize({width:390,height:844}); await page.goto(origin); await page.locator('#interactive-demo').waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('h1')).opacity) === 1);
    await page.screenshot({path:'output/playwright/marketing-mobile.png'});
    await page.setViewportSize({width:1440,height:1000});
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('h1')).opacity) === 1);
    await page.screenshot({path:'output/playwright/marketing-desktop.png'});
  });
  await check('Admin unauthorized rejection, login, lead notes and stage', async () => {
    assert.equal((await context.request.get(`${origin}/api/admin?action=snapshot`)).status(),401);
    await page.goto(`${origin}/admin`); await page.locator('input[name=email]').fill('owner@example.test'); await page.locator('input[name=password]').fill('local-admin-fixture-only'); await page.locator('button[type=submit]').click();
    await page.getByRole('button',{name:/Inbound Leads/}).click(); await page.getByRole('row',{name:/Open Atlas Imaging Center/}).waitFor();
    await page.getByRole('row',{name:/Open Atlas Imaging Center/}).focus(); await page.keyboard.press('Enter');
    const panel = page.getByRole('dialog',{name:'Lead Record'}); await panel.locator('select').selectOption('contacted'); await panel.locator('textarea').fill('Fixture-only follow-up note'); await panel.getByRole('button',{name:/Save/}).click();
    await panel.waitFor({state:'hidden'}); await page.getByRole('row',{name:/Open Atlas Imaging Center/}).click(); assert.equal(await page.getByRole('dialog').locator('textarea').inputValue(),'Fixture-only follow-up note'); await page.keyboard.press('Escape');
  });
  await check('Admin content draft editing and delivery monitoring', async () => {
    await page.getByRole('button',{name:'Website Content',exact:true}).click(); await page.locator('textarea').first().waitFor();
    await page.locator('textarea').first().fill('Fixture-only headline'); await page.getByRole('button',{name:/Save draft/i}).click();
    await page.getByText('Draft saved.',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Publish',exact:true}).click();
    await page.getByRole('dialog',{name:'Publish website changes?'}).getByRole('button',{name:'Publish',exact:true}).click();
    await page.getByText('Website published.',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Delivery Center',exact:true}).click(); await page.getByRole('heading',{name:'Deliveries',exact:true}).waitFor();
    await page.screenshot({path:'output/playwright/admin-deliveries.png'});
    await page.setViewportSize({width:390,height:844});
    await page.getByRole('button',{name:'Open navigation',exact:true}).click();
    await page.keyboard.press('Escape');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({path:'output/playwright/admin-mobile.png'});
  });
  assert.deepEqual(failures, [], 'No uncaught browser errors');
} catch (error) { console.error(error); process.exitCode=1; for (const context of browser?.contexts() ?? []) for (const page of context.pages()) { await page.screenshot({path:'output/playwright/failure.png'}).catch(()=>{}); await writeFile('output/playwright/failure.txt', await page.locator('body').innerText()); } }
finally { await mkdir('docs/clinahir-upgrade',{recursive:true}); await writeFile('docs/clinahir-upgrade/browser-results.json',JSON.stringify({passed:results,errors:failures,success:process.exitCode!==1},null,2)); await browser?.close(); server.kill('SIGTERM'); }
