import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

const scripts = ['typecheck', 'lint', 'test:leads', 'test:demo', 'test:phase2', 'build', 'test:sites', 'report:bundles', 'test:smoke', 'test:phase2:browser'];
const phase3 = process.argv.includes('--phase3');
if (phase3) scripts.push('test:phase3', 'report:release');
const results = [];
for (const script of scripts) {
  const started = Date.now();
  let output = '';
  const child = spawn('npm', ['run', script], { stdio: ['ignore', 'pipe', 'pipe'] });
  for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { output += chunk; process.stdout.write(chunk); });
  const exitCode = await new Promise((resolve, reject) => { child.on('error', reject); child.on('close', resolve); });
  results.push({ command: `npm run ${script}`, exitCode, durationMs: Date.now() - started,
    ...(output.match(/ℹ pass (\d+)/) ? { passedTests: Number(output.match(/ℹ pass (\d+)/)[1]), failedTests: Number(output.match(/ℹ fail (\d+)/)?.[1] ?? 0) } : {}) });
  await writeFile(phase3 ? 'docs/clinahir-upgrade/phase3/check-results.json' : 'docs/clinahir-upgrade/phase2-check-results.json', JSON.stringify({ executedAt: new Date().toISOString(), results }, null, 2) + '\n');
  if (exitCode !== 0) { process.exitCode = 1; break; }
}
