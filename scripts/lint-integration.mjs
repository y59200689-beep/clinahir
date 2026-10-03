import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
function files(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(`${dir}/${e.name}`) : [`${dir}/${e.name}`]); }
for (const file of [...files('src'), ...files('components')]) {
 const source = readFileSync(file, 'utf8');
 assert(!/CLINAHIR_INTEGRATION_SECRET|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_URL|DAILY_COMMAND_URL/.test(source), `Server credential referenced in ${file}`);
 assert(!/from ['"].*server\//.test(source), `Server import in ${file}`);
}
assert(!/VITE_\w+=|NEXT_PUBLIC_\w+=/.test(readFileSync('.env.example','utf8')), 'Public integration environment variable');
console.log('Integration boundary lint passed (no existing ESLint configuration).');
