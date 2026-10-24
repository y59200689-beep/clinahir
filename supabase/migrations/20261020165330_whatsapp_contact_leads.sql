-- Preserve legacy emailed leads; new WhatsApp leads omit email.
alter table public.clinahir_leads alter column email drop not null;
create table public.clinahir_whatsapp_jobs (
 external_id text primary key references public.clinahir_leads(external_id),
 phone text not null, contact_name text not null,
 status text not null default 'pending' check(status in ('pending','accepted','blocked','review','exhausted')),
 attempts integer not null default 0, next_attempt_at timestamptz default now(),
 lock_token uuid, locked_until timestamptz, last_error text, provider_message_id text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.clinahir_whatsapp_jobs enable row level security;
revoke all on public.clinahir_whatsapp_jobs from public,anon,authenticated;
grant select,insert,update on public.clinahir_whatsapp_jobs to service_role;
create index clinahir_whatsapp_due on public.clinahir_whatsapp_jobs(next_attempt_at) where status='pending';
create or replace function public.clinahir_capture_lead(p_record jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare r public.clinahir_leads; inserted integer;
begin
 insert into public.clinahir_leads (external_id,company_name,contact_name,email,phone,city,message,role,priority,form_type,landing_page,utm_source,utm_medium,utm_campaign,submitted_at,submission_fingerprint)
 values (p_record->>'external_id',p_record->>'company_name',p_record->>'contact_name',p_record->>'email',p_record->>'phone',p_record->>'city',p_record->>'message',p_record->>'role',p_record->>'priority',p_record->>'form_type',p_record->>'landing_page',p_record->>'utm_source',p_record->>'utm_medium',p_record->>'utm_campaign',(p_record->>'submitted_at')::timestamptz,p_record->>'submission_fingerprint')
 on conflict (external_id) do nothing;
 get diagnostics inserted = row_count;
 select * into strict r from public.clinahir_leads where external_id=p_record->>'external_id';
 if inserted=1 and r.form_type='demo' and r.email is null and r.contact_name is not null and r.phone like '+%' then
  insert into public.clinahir_whatsapp_jobs(external_id,phone,contact_name)
  values(r.external_id,r.phone,coalesce(r.contact_name,'')) on conflict(external_id) do nothing;
 end if;
 return to_jsonb(r);
end $$;


create function public.clinahir_claim_whatsapp(p_id text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.clinahir_whatsapp_jobs;
begin
 select * into r from public.clinahir_whatsapp_jobs where external_id=p_id for update;
 if not found or r.status<>'pending' or r.next_attempt_at>now() then return null;end if;
 -- A crashed send could have reached Meta. Never automatically resend an ambiguous attempt.
 if r.lock_token is not null then
  if r.locked_until<=now() then update public.clinahir_whatsapp_jobs set status='review',last_error='interrupted_send_review_required',updated_at=now() where external_id=p_id;end if;
  return null;
 end if;
 if r.attempts>=5 then update public.clinahir_whatsapp_jobs set status='exhausted',updated_at=now() where external_id=p_id;return null;end if;
 update public.clinahir_whatsapp_jobs set attempts=attempts+1,lock_token=gen_random_uuid(),locked_until=now()+interval '60 seconds',updated_at=now() where external_id=p_id returning * into r;
 return to_jsonb(r)||jsonb_build_object('token',r.lock_token);
end $$;
create function public.clinahir_finish_whatsapp(p_id text,p_token uuid,p_status text,p_error text,p_message_id text,p_next timestamptz) returns jsonb language plpgsql security invoker set search_path='' as $$
begin
 update public.clinahir_whatsapp_jobs set status=p_status,last_error=p_error,provider_message_id=p_message_id,next_attempt_at=p_next,lock_token=null,locked_until=null,updated_at=now() where external_id=p_id and lock_token=p_token;
 return '{}'::jsonb;
end $$;
revoke all on function public.clinahir_claim_whatsapp(text),public.clinahir_finish_whatsapp(text,uuid,text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.clinahir_claim_whatsapp(text),public.clinahir_finish_whatsapp(text,uuid,text,text,text,timestamptz) to service_role;
create view public.clinahir_delivery_health with(security_invoker=true) as
 select 'daily_command'::text channel,daily_command_status status,count(*) count,min(submitted_at) oldest_at from public.clinahir_leads group by daily_command_status
 union all select 'whatsapp',status,count(*),min(created_at) from public.clinahir_whatsapp_jobs group by status;
revoke all on public.clinahir_delivery_health from public,anon,authenticated;
grant select on public.clinahir_delivery_health to service_role;

-- Private heartbeat, updated only after the authenticated cron finishes processing.
create table public.clinahir_cron_runs (id boolean primary key default true check(id), completed_at timestamptz not null, whatsapp_error boolean not null);
alter table public.clinahir_cron_runs enable row level security;
revoke all on public.clinahir_cron_runs from public,anon,authenticated;
grant select,insert,update on public.clinahir_cron_runs to service_role;
create function public.clinahir_record_cron(p_error boolean) returns jsonb language sql security invoker set search_path='' as $$
 insert into public.clinahir_cron_runs(id,completed_at,whatsapp_error) values(true,now(),p_error)
 on conflict(id) do update set completed_at=excluded.completed_at,whatsapp_error=excluded.whatsapp_error returning jsonb_build_object('ok',true);
$$;
revoke all on function public.clinahir_record_cron(boolean) from public,anon,authenticated;
grant execute on function public.clinahir_record_cron(boolean) to service_role;
