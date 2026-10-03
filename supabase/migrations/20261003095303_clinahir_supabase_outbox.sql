-- Extends the existing Clinahir table. No lead data is removed.
create table public.clinahir_lead_limits (
 identifier text primary key check (identifier ~ '^[0-9a-f]{64}$'),
 window_started_at timestamptz not null,
 requests integer not null check (requests > 0)
);
alter table public.clinahir_lead_limits enable row level security;
revoke all on public.clinahir_lead_limits from public, anon, authenticated;
grant select, insert, update, delete on public.clinahir_lead_limits to service_role;

create function public.clinahir_capture_lead(p_record jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare r public.clinahir_leads;
begin
 insert into public.clinahir_leads (external_id,company_name,contact_name,email,phone,city,message,role,priority,form_type,landing_page,utm_source,utm_medium,utm_campaign,submitted_at,submission_fingerprint)
 values (p_record->>'external_id',p_record->>'company_name',p_record->>'contact_name',p_record->>'email',p_record->>'phone',p_record->>'city',p_record->>'message',p_record->>'role',p_record->>'priority',p_record->>'form_type',p_record->>'landing_page',p_record->>'utm_source',p_record->>'utm_medium',p_record->>'utm_campaign',(p_record->>'submitted_at')::timestamptz,p_record->>'submission_fingerprint')
 on conflict (external_id) do nothing;
 select * into strict r from public.clinahir_leads where external_id=p_record->>'external_id';
 return to_jsonb(r);
end $$;

create function public.clinahir_claim_lead(p_id text,p_token uuid,p_now timestamptz)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare r public.clinahir_leads;
begin
 select * into r from public.clinahir_leads where external_id=p_id for update;
 if not found or r.daily_command_status <> 'pending'
 or r.daily_command_next_attempt_at is null or r.daily_command_next_attempt_at > p_now
 or r.daily_command_lock_expires_at > p_now then return null; end if;
 if r.daily_command_attempts >= 8 then
  update public.clinahir_leads set daily_command_status='exhausted', daily_command_last_error='attempt_limit_reached',daily_command_next_attempt_at=null,daily_command_lock_token=null,daily_command_lock_expires_at=null where external_id=p_id;
  return null;
 end if;
 update public.clinahir_leads set daily_command_attempts=daily_command_attempts+1,
 daily_command_lock_token=p_token,daily_command_lock_expires_at=p_now+interval '60 seconds',daily_command_next_attempt_at=p_now+interval '60 seconds'
 where external_id=p_id returning * into r;
 return to_jsonb(r);
end $$;

create function public.clinahir_finish_lead(p_id text,p_token uuid,p_status text,p_error text,p_synced_at timestamptz,p_next timestamptz)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
 update public.clinahir_leads set daily_command_status=p_status,daily_command_last_error=p_error,
 daily_command_synced_at=p_synced_at,daily_command_next_attempt_at=p_next,
 daily_command_lock_token=null,daily_command_lock_expires_at=null
 where external_id=p_id and daily_command_lock_token=p_token;
 return found;
end $$;

create function public.clinahir_replay_lead(p_id text,p_now timestamptz)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
 update public.clinahir_leads set daily_command_status='pending',daily_command_attempts=0,
 daily_command_last_error=null,daily_command_next_attempt_at=p_now,daily_command_lock_token=null,daily_command_lock_expires_at=null
 where external_id=p_id and daily_command_status in ('blocked','exhausted')
 and (daily_command_lock_expires_at is null or daily_command_lock_expires_at<=p_now);
 return found;
end $$;

create function public.clinahir_allow_lead(p_identifier text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare n integer; t timestamptz := clock_timestamp();
begin
 -- Only hashed email identifiers, with bounded ten-minute retention.
 delete from public.clinahir_lead_limits where window_started_at < t-interval '10 minutes';
 insert into public.clinahir_lead_limits as l values(p_identifier,t,1)
 on conflict(identifier) do update set
 requests=case when l.window_started_at<=t-interval '10 minutes' then 1 else l.requests+1 end,
 window_started_at=case when l.window_started_at<=t-interval '10 minutes' then t else l.window_started_at end
 returning requests into n;
 return n<=10;
end $$;
create index clinahir_lead_limits_expiry_idx on public.clinahir_lead_limits(window_started_at);

revoke all on function public.clinahir_capture_lead(jsonb),public.clinahir_claim_lead(text,uuid,timestamptz),public.clinahir_finish_lead(text,uuid,text,text,timestamptz,timestamptz),public.clinahir_replay_lead(text,timestamptz),public.clinahir_allow_lead(text) from public,anon,authenticated;
grant execute on function public.clinahir_capture_lead(jsonb),public.clinahir_claim_lead(text,uuid,timestamptz),public.clinahir_finish_lead(text,uuid,text,text,timestamptz,timestamptz),public.clinahir_replay_lead(text,timestamptz),public.clinahir_allow_lead(text) to service_role;
