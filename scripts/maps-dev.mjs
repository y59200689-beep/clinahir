import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
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
export async function mapsDevRequest(request, { importProspects } = {}) {
  job = shared.job; starting = shared.starting;
  if (!job) {
    try { job = JSON.parse(await readFile(join(root, 'current.json'), 'utf8')); shared.job = job; } catch {}
  }
  const action = new URL(request.url).searchParams.get('action');
  const reply = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
  if (action === 'maps-stop') {
    if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
    if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Request not allowed' }, 403);
    if (!job || job.status !== 'running') return reply({ error: 'No running search to stop.' }, 409);
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
    if (!clean(body.keywords) || !clean(body.city) || !['none', 'configured'].includes(body.proxy)) return reply({ error: 'Enter keywords, a city and a proxy choice.' }, 400);
    starting = true; shared.starting = true;
    try {
      await run('docker', ['info', '--format', '{{.ServerVersion}}']);
      // Never replace another active crawl, including one started outside the dashboard.
      const existing = await run('docker', ['ps', '--filter', 'name=^/gmaps-scraper-agent$', '--format', '{{.Names}}']);
      if (existing.stdout.trim()) return reply({ error: 'A search is already running.' }, 409);
      await mkdir(root, { recursive: true, mode: 0o700 });
      const directory = join(root, randomUUID());
      await mkdir(directory, { mode: 0o700 });
      const query = `${body.keywords.trim()} in ${body.city.trim()}`;
      const input = join(directory, 'queries.txt');
      await writeFile(input, query + '\n', { mode: 0o600 });
      const args = [join(skill, 'scripts/run-local.sh'), '--queries', input, '--output-dir', directory, '--format', 'json', '--depth', '1'];
      if (body.proxy === 'configured') {
        if (!process.env.CLINAHIR_MAPS_PROXY_FILE) return reply({ error: 'The local proxy file is not configured.' }, 400);
        args.push('--proxy-file', process.env.CLINAHIR_MAPS_PROXY_FILE);
      }
      job = { id: directory.split('/').pop(), directory, query, city: body.city.trim().split(',')[0].trim(), status: 'starting', startedAt: new Date().toISOString() };
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
  if (importing) {
    if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
    if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Request not allowed' }, 403);
    let body;
    try { body = await request.json(); } catch { return reply({ error: 'Invalid request' }, 400); }
    if (!job || body?.jobId !== job.id) return reply({ error: 'Search results changed. Refresh and try again.' }, 409);
    if (body.sourceUseConfirmed !== true) return reply({ error: 'Confirm the data source and choose a valid CSV under 180 KB.' }, 400);
    if (['starting', 'running'].includes(job.status)) return reply({ error: 'Wait for the search to finish or stop it before importing.' }, 409);
  } else if (request.method !== 'GET') return reply({ error: 'Method not allowed' }, 405);
  if (!job) return reply({ job: null, rows: [], total: 0 });
  if (job.status === 'starting') {
    try { const saved = JSON.parse(await readFile(join(root, 'current.json'), 'utf8')); if (saved.id === job.id) Object.assign(job, saved); } catch {}
  }
  if (job.status === 'running') {
    try {
      const { stdout } = await run('docker', ['inspect', '--format', '{{json .State}}', 'gmaps-scraper-agent']);
      const state = JSON.parse(stdout);
      if (state.Status === 'exited') job.status = state.ExitCode === 0 ? 'completed' : 'failed';
    } catch { job.status = 'failed'; }
  }
  const resultJob = job;
  let rows = [];
  try {
    const source = await readFile(join(resultJob.directory, 'results.json'), 'utf8');
    rows = source.split(/\r?\n/).filter(Boolean).flatMap(line => { try { const r = JSON.parse(line); return [{ title: String(r.title ?? ''), category: String(r.category ?? ''), rating: String(r.review_rating ?? ''), reviews: String(r.review_count ?? ''), phone: String(r.phone ?? ''), website: String(r.web_site ?? r.website ?? ''), address: String(r.address ?? ''), listing: String(r.link ?? ''), city: String(r.complete_address?.city || resultJob.city || resultJob.query.split(' in ').at(-1)?.split(',')[0]?.trim() || '') }]; } catch { return []; } });
  } catch {}
  if (job.status === 'completed' && !rows.length) job.error = 'No businesses found. Try different keywords or a nearby city.';
  if (importing) {
    if (!rows.length) return reply({ error: 'No results to import.' }, 400);
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
    const fields = ['title', 'category', 'rating', 'reviews', 'phone', 'website', 'address'];
    const cell = value => { const text = String(value ?? ''); return '"' + (/^(?:\s*[=+@-]|[\t\r\n])/.test(text) ? "'" : '') + text.replaceAll('"', '""') + '"'; };
    return new Response('\uFEFF' + [fields, ...rows.map(row => fields.map(key => row[key]))].map(row => row.map(cell).join(',')).join('\r\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="google-maps-results.csv"', 'Cache-Control': 'no-store' } });
  }
  return reply({ job: { ...job, directory: undefined }, rows: rows.slice(0, 20), total: rows.length });
}
