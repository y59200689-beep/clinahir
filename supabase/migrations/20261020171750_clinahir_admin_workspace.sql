-- Private owner workspace; apply after the WhatsApp migration.
alter table public.clinahir_leads add column admin_stage text not null default 'new' check(admin_stage in ('new','contacted','qualified','won','lost'));
alter table public.clinahir_leads add column admin_notes text not null default '';
create index clinahir_leads_submitted_idx on public.clinahir_leads(submitted_at desc);
create table public.clinahir_site_content (
 id boolean primary key default true check(id), draft jsonb, published jsonb,
 version integer not null default 0, updated_at timestamptz not null default now(), published_at timestamptz
);
insert into public.clinahir_site_content(id) values(true);
create table public.clinahir_admin_audit (
 id bigint generated always as identity primary key, actor uuid not null,
 action text not null, target text not null, created_at timestamptz not null default now()
);
alter table public.clinahir_site_content enable row level security;
alter table public.clinahir_admin_audit enable row level security;
revoke all on public.clinahir_site_content,public.clinahir_admin_audit from public,anon,authenticated;
grant select,insert,update on public.clinahir_site_content to service_role;
grant select,insert on public.clinahir_admin_audit to service_role;
grant usage,select on sequence public.clinahir_admin_audit_id_seq to service_role;
create function public.clinahir_admin_snapshot(p_search text default '',p_stage text default '',p_page integer default 0)
returns jsonb language sql security invoker set search_path='' as $$
 select jsonb_build_object(
 'leads',coalesce((select jsonb_agg(to_jsonb(t)) from (select external_id,company_name,contact_name,email,phone,city,message,role,priority,form_type,landing_page,utm_source,utm_medium,utm_campaign,submitted_at,daily_command_status,daily_command_attempts,daily_command_last_error,admin_stage,admin_notes from public.clinahir_leads
 where (p_stage='' or admin_stage=p_stage) and (p_search='' or company_name ilike '%'||left(p_search,120)||'%' or contact_name ilike '%'||left(p_search,120)||'%' or phone ilike '%'||left(p_search,120)||'%' or email ilike '%'||left(p_search,120)||'%')
 order by submitted_at desc limit 25 offset greatest(0,least(p_page,10000))*25)t),'[]'::jsonb),
 'total',(select count(*) from public.clinahir_leads where (p_stage='' or admin_stage=p_stage) and (p_search='' or company_name ilike '%'||left(p_search,120)||'%' or contact_name ilike '%'||left(p_search,120)||'%' or phone ilike '%'||left(p_search,120)||'%' or email ilike '%'||left(p_search,120)||'%')),
 'summary',(select jsonb_build_object('total',count(*),'new',count(*) filter(where admin_stage='new'),'qualified',count(*) filter(where admin_stage='qualified'),'won',count(*) filter(where admin_stage='won'),'attention',count(*) filter(where daily_command_status in ('blocked','exhausted'))) from public.clinahir_leads),
 'analytics',coalesce((select jsonb_agg(to_jsonb(t)) from (select * from public.clinahir_conversion_daily where day>=current_date-29 order by day)t),'[]'::jsonb),
 'sources',coalesce((select jsonb_agg(to_jsonb(t)) from (select coalesce(utm_source,'Direct / unknown') source,count(*) count from public.clinahir_leads group by 1 order by 2 desc limit 8)t),'[]'::jsonb),
 'health',coalesce((select jsonb_agg(to_jsonb(t)) from public.clinahir_delivery_health t),'[]'::jsonb),
 'heartbeat',(select completed_at from public.clinahir_cron_runs where id=true),
 'whatsapp',coalesce((select jsonb_agg(to_jsonb(t)) from (select external_id,status,attempts,last_error,provider_message_id,updated_at from public.clinahir_whatsapp_jobs order by updated_at desc limit 25)t),'[]'::jsonb),
 'audit',coalesce((select jsonb_agg(to_jsonb(t)) from (select id,action,target,created_at from public.clinahir_admin_audit order by id desc limit 50)t),'[]'::jsonb)
 );
$$;
create function public.clinahir_admin_edit_lead(p_actor uuid,p_id text,p_stage text,p_notes text)
returns jsonb language plpgsql security invoker set search_path='' as $$
begin
 if length(p_notes)>5000 or p_stage not in ('new','contacted','qualified','won','lost') then raise exception 'invalid lead update';end if;
 update public.clinahir_leads set admin_stage=p_stage,admin_notes=p_notes where external_id=p_id;
 if not found then raise exception 'lead not found';end if;
 insert into public.clinahir_admin_audit(actor,action,target) values(p_actor,'lead.updated',p_id);
 return jsonb_build_object('ok',true);
end $$;
create function public.clinahir_admin_content(p_actor uuid,p_content jsonb,p_version integer,p_publish boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare result public.clinahir_site_content;
begin
 update public.clinahir_site_content set draft=p_content,published=case when p_publish then p_content else published end,
 version=version+1,updated_at=now(),published_at=case when p_publish then now() else published_at end where id=true and version=p_version returning * into result;
 if not found then return jsonb_build_object('conflict',true);end if;
 insert into public.clinahir_admin_audit(actor,action,target) values(p_actor,case when p_publish then 'website.published' else 'website.draft_saved' end,'website');
 return to_jsonb(result);
end $$;
create function public.clinahir_admin_replay(p_actor uuid,p_id text,p_channel text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare changed boolean;
begin
 if p_channel='daily_command' then
  select public.clinahir_replay_lead(p_id,now()) into changed;
 elsif p_channel='whatsapp' then
  update public.clinahir_whatsapp_jobs set status='pending',attempts=0,next_attempt_at=now(),lock_token=null,locked_until=null,last_error=null,updated_at=now()
  where external_id=p_id and status in ('blocked','exhausted') and lock_token is null;
  changed=found;
 else raise exception 'invalid channel';end if;
 if not changed then return jsonb_build_object('conflict',true);end if;
 insert into public.clinahir_admin_audit(actor,action,target) values(p_actor,p_channel||'.requeued',p_id);
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.clinahir_admin_snapshot(text,text,integer),public.clinahir_admin_edit_lead(uuid,text,text,text),public.clinahir_admin_content(uuid,jsonb,integer,boolean),public.clinahir_admin_replay(uuid,text,text) from public,anon,authenticated;
grant execute on function public.clinahir_admin_snapshot(text,text,integer),public.clinahir_admin_edit_lead(uuid,text,text,text),public.clinahir_admin_content(uuid,jsonb,integer,boolean),public.clinahir_admin_replay(uuid,text,text) to service_role;
