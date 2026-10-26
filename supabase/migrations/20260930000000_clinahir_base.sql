-- Core Clinahir lead table for a fresh Supabase project.
-- The existing feature migrations extend this table with WhatsApp, analytics,
-- and owner-workspace functionality.
create table public.clinahir_leads (
  external_id text primary key check (external_id ~ '^cli_[0-9a-f-]{36}$'),
  company_name text not null check (length(trim(company_name)) between 1 and 200),
  contact_name text check (contact_name is null or length(contact_name) <= 200),
  email text check (email is null or (length(email) <= 254 and position('@' in email) > 1)),
  phone text check (phone is null or length(phone) <= 40),
  city text not null check (length(trim(city)) between 1 and 120),
  message text check (message is null or length(message) <= 3000),
  role text not null check (length(role) between 1 and 100),
  priority text not null check (length(priority) between 1 and 200),
  form_type text not null check (form_type = 'demo'),
  landing_page text not null check (landing_page like '/%' and landing_page not like '//%'),
  utm_source text check (utm_source is null or length(utm_source) <= 200),
  utm_medium text check (utm_medium is null or length(utm_medium) <= 200),
  utm_campaign text check (utm_campaign is null or length(utm_campaign) <= 200),
  submitted_at timestamptz not null,
  submission_fingerprint text not null check (submission_fingerprint ~ '^[0-9a-f]{64}$'),
  daily_command_status text not null default 'pending' check (daily_command_status in ('pending','synced','blocked','exhausted')),
  daily_command_attempts integer not null default 0 check (daily_command_attempts >= 0),
  daily_command_last_error text,
  daily_command_synced_at timestamptz,
  daily_command_next_attempt_at timestamptz default now(),
  daily_command_lock_token uuid,
  daily_command_lock_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index clinahir_leads_sync_due_idx
  on public.clinahir_leads (daily_command_next_attempt_at)
  where daily_command_status = 'pending';

alter table public.clinahir_leads enable row level security;
revoke all on public.clinahir_leads from public, anon, authenticated;
grant select, insert, update, delete on public.clinahir_leads to service_role;
