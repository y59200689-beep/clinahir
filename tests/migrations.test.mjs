import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../supabase/migrations/', import.meta.url);
const files = readdirSync(dir).filter(name => name.endsWith('.sql')).sort();

test('Clinahir migrations bootstrap a fresh database before feature migrations', () => {
  assert.equal(files[0], '20260930000000_clinahir_base.sql');
  const base = readFileSync(new URL(files[0], dir), 'utf8');
  for (const column of [
    'external_id', 'company_name', 'contact_name', 'email', 'phone', 'city', 'message',
    'role', 'priority', 'form_type', 'landing_page', 'utm_source', 'utm_medium',
    'utm_campaign', 'submitted_at', 'submission_fingerprint', 'daily_command_status',
    'daily_command_attempts', 'daily_command_next_attempt_at', 'daily_command_lock_token',
    'daily_command_lock_expires_at'
  ]) assert.match(base, new RegExp(`\\b${column}\\b`));
  assert.match(base, /enable row level security/i);
  assert.match(base, /revoke all on public\.clinahir_leads from public, anon, authenticated/i);
  assert.match(base, /grant select, insert, update, delete on public\.clinahir_leads to service_role/i);
});

test('analytics migration handles a missing optional RLS helper on a new project', () => {
  const sql = readFileSync(join(new URL('../supabase/migrations/', import.meta.url).pathname, '20261004180738_clinahir_conversion_analytics.sql'), 'utf8');
  assert.match(sql, /if pg_catalog\.to_regprocedure\('public\.rls_auto_enable\(\)'\) is not null/i);
  assert.match(sql, /create view public\.clinahir_conversion_daily/i);
});
