import { parseMapsLocations, mapsQueryFile, mapsResultCity, mapsQueryLocation, selectMapsRows } from '../server/maps-locations.mjs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
const exec = promisify(execFile);
const root = process.env.CLINAHIR_MAPS_OUTPUT_DIR || join(tmpdir(), 'clinahir-maps');
const skill = resolve('../.agents/skills/google-maps-scraper');
// Preserve the active job across Vite configuration reloads in this process.
const stateKey = Symbol.for('clinahir.maps.dev');
const shared = globalThis[stateKey] ??= { job: null, starting: false };
let job = shared.job, starting = shared.starting;
const run = (file, args) => exec(file, args, { timeout: 30000, maxBuffer: 1024 * 1024 });
const publicJob = ({ directory, ...details }) => details;
const saveJob = job => writeFile(join(job.directory, 'job.json'), JSON.stringify(job), { mode: 0o600 });
const jobIdPattern = /^[0-9a-f-]{36}$/i;

async function archivedJob(id) {
  if (!jobIdPattern.test(id)) return null;
  const directory = join(root, id);
  try { return { ...JSON.parse(await readFile(join(directory, 'job.json'), 'utf8')), directory }; }
  catch { return null; }
}

export async function mapsDevRequest(request, { importProspects, matchProspects } = {}) {
  job = shared.job; starting = shared.starting;
  if (!job) {
    try { job = JSON.parse(await readFile(join(root, 'current.json'), 'utf8')); shared.job = job; } catch {}
  }
  const params = new URL(request.url).searchParams;
  const action = params.get('action');
  const reply = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
  if (action === 'maps-history' && request.method === 'GET') {
    const ids = await readdir(root).catch(() => []);
    const previous = await Promise.all(ids.filter(id => id !== job?.id).map(archivedJob));
    const jobs = [job, ...previous].filter(Boolean).sort((a,b) => (b.startedAt ?? '').localeCompare(a.startedAt ?? '')).slice(0,12);
    return reply({ jobs: jobs.map(publicJob) });
  }
  if (action === 'maps-stop') {
    if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
    if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Request not allowed' }, 403);
    const body = await request.json().catch(() => null);
    if (!job || job.status !== 'running' || (body?.jobId && body.jobId !== job.id)) return reply({ error: 'No running search to stop.' }, 409);
    try {
      await run('docker', ['stop', '--time', '10', 'gmaps-scraper-agent']);
      job.status = 'stopped';
      await writeFile(join(root, 'current.json'), JSON.stringify(job), { mode: 0o600 });
      return reply({ stopped: true });
    } catch { return reply({ error: 'The search could not be stopped. Try again.' }, 503); }
  }
  if (action === 'maps-start') {
    if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
    if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Request not allowed' }, 403);
    if (starting || job?.status === 'starting' || job?.status === 'running') return reply({ error: 'A search is already running.' }, 409);
    let body;
    try { body = await request.json(); } catch { return reply({ error: 'Invalid request' }, 400); }
    const clean = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 120 && !/[\r\n\x00-\x1f]/.test(value);
    const locations = parseMapsLocations(body?.city);
    if (!clean(body?.keywords) || body.keywords.includes('#!#') || !locations.length || !['none', 'configured'].includes(body.proxy)) return reply({ error: 'Enter keywords and up to 5 cities or areas.' }, 400);
    starting = true; shared.starting = true;
    try {
      await run('docker', ['info', '--format', '{{.ServerVersion}}']);
      // Never replace another active crawl, including one started outside the dashboard.
      const existing = await run('docker', ['ps', '--filter', 'name=^/gmaps-scraper-agent$', '--format', '{{.Names}}']);
      if (existing.stdout.trim()) return reply({ error: 'A search is already running.' }, 409);
      await mkdir(root, { recursive: true, mode: 0o700 });
      const directory = join(root, randomUUID());
      await mkdir(directory, { mode: 0o700 });
      const query = `${body.keywords.trim()} in ${locations.join('; ')}`;
      const input = join(directory, 'queries.txt');
      await writeFile(input, mapsQueryFile(body.keywords.trim(), locations), { mode: 0o600 });
      const args = [join(skill, 'scripts/run-local.sh'), '--queries', input, '--output-dir', directory, '--format', 'json', '--depth', '1'];
      if (body.proxy === 'configured') {
        if (!process.env.CLINAHIR_MAPS_PROXY_FILE) return reply({ error: 'The local proxy file is not configured.' }, 400);
        args.push('--proxy-file', process.env.CLINAHIR_MAPS_PROXY_FILE);
      }
      if (job) await saveJob(job);
      job = { id: directory.split('/').pop(), directory, query, keywords: body.keywords.trim(), locations, status: 'starting', startedAt: new Date().toISOString() };
      shared.job = job;
      await writeFile(join(root, 'current.json'), JSON.stringify(job), { mode: 0o600 });
      const current = job;
      execFile('bash', args, { timeout: 600000, maxBuffer: 1024 * 1024 }, error => {
        current.status = error ? 'failed' : 'running';
        if (error) current.error = 'Search could not start. Check Docker and image download connectivity.';
        void writeFile(join(root, 'current.json'), JSON.stringify(current), { mode: 0o600 }).catch(() => {});
      });
      return reply({ job: { ...job, directory: undefined } });
    } catch { return reply({ error: 'Start Docker Desktop, then try again.' }, 503); }
    finally { starting = false; shared.starting = false; }
  }
  const importing = action === 'maps-import';
  let indices;
  let requestedJob = params.get('job');
  if (importing) {
    if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
    if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Request not allowed' }, 403);
    let body;
    try { body = await request.json(); } catch { return reply({ error: 'Invalid request' }, 400); }
    requestedJob = body?.jobId;
    indices = body?.indices;
    if (!requestedJob) return reply({ error: 'Search results changed. Refresh and try again.' }, 409);
    if (body.sourceUseConfirmed !== true) return reply({ error: 'Confirm the data source and choose a valid CSV under 180 KB.' }, 400);

  } else if (request.method !== 'GET') return reply({ error: 'Method not allowed' }, 405);
  const resultJob = requestedJob && requestedJob !== job?.id ? await archivedJob(requestedJob) : job;
  if (requestedJob && !resultJob) return reply({ error: 'Search results changed. Refresh and try again.' }, 404);
  if (!resultJob) return reply({ job: null, rows: [], total: 0 });
  if (resultJob === job && job.status === 'starting') {
    try { const saved = JSON.parse(await readFile(join(root, 'current.json'), 'utf8')); if (saved.id === job.id) Object.assign(job, saved); } catch {}
  }
  if (resultJob === job && job.status === 'running') {
    try {
      const { stdout } = await run('docker', ['inspect', '--format', '{{json .State}}', 'gmaps-scraper-agent']);
      const state = JSON.parse(stdout);
      if (state.Status === 'exited') job.status = state.ExitCode === 0 ? 'completed' : 'failed';
    } catch { job.status = 'failed'; }
  }
  const locations = resultJob.locations ?? [resultJob.city || resultJob.query.split(' in ').at(-1)].filter(Boolean);
  let rows = [];
  try {
    const source = await readFile(join(resultJob.directory, 'results.json'), 'utf8');
    rows = source.split(/\r?\n/).filter(Boolean).flatMap(line => { try { const r = JSON.parse(line); return [{ title: String(r.title ?? ''), category: String(r.category ?? ''), rating: String(r.review_rating ?? ''), reviews: String(r.review_count ?? ''), phone: String(r.phone ?? ''), website: String(r.web_site ?? r.website ?? ''), address: String(r.address ?? ''), listing: String(r.link ?? ''), city: mapsResultCity(r.complete_address?.city, r.input_id, locations), location: mapsQueryLocation(r.input_id, locations) }]; } catch { return []; } });
  } catch {}
  rows = rows.slice(0, 500);
  resultJob.total = rows.length;
  if (resultJob.status === 'completed' && !rows.length) resultJob.error = 'No businesses found. Try different keywords or a nearby city.';
  if (importing) {
    if (['starting', 'running'].includes(resultJob.status)) return reply({ error: 'Wait for the search to finish or stop it before importing.' }, 409);
    rows = selectMapsRows(rows, indices);
    if (!rows?.length) return reply({ error: 'No results to import.' }, 400);
    if (rows.length > 500) return reply({ error: 'Import up to 500 prospects at a time.' }, 400);
    const fields = ['center_name', 'city', 'address', 'category', 'phone', 'website_url', 'rating', 'review_count', 'listing_url', 'source_name', 'source_url'];
    // This internal CSV is parsed as data, never opened in a spreadsheet.
    const cell = value => '"' + String(value ?? '').replaceAll('"', '""') + '"';
    const csv = [fields, ...rows.map(row => [row.title, row.city, row.address, row.category, row.phone, row.website, row.rating, row.reviews, row.listing, 'Google Maps', row.listing || 'https://www.google.com/maps'])].map(row => row.map(cell).join(',')).join('\r\n');
    if (csv.length > 180000) return reply({ error: 'Choose a non-empty CSV under 180 KB.' }, 400);
    if (!importProspects) return reply({ error: 'Import is temporarily unavailable.' }, 503);
    return importProspects(csv);
  }
  if (action === 'maps-export') {
    const fields = ['title', 'category', 'rating', 'reviews', 'phone', 'website', 'address', 'city'];
    const cell = value => { const text = String(value ?? ''); return '"' + (/^(?:\s*[=+@-]|[\t\r\n])/.test(text) ? "'" : '') + text.replaceAll('"', '""') + '"'; };
    return new Response('\uFEFF' + [fields, ...rows.map(row => fields.map(key => row[key]))].map(row => row.map(cell).join(',')).join('\r\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="google-maps-results.csv"', 'Cache-Control': 'no-store' } });
  }
  const matches = rows.length ? await matchProspects?.(rows).catch(() => null) : [];
  return reply({ job: { ...publicJob(resultJob), locations }, rows: rows.map((row,index) => ({ ...row, directoryMatch: matches?.[index] ?? null })), total: rows.length });
}
