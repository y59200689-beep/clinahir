begin;

alter table public.clinahir_leads
  add column admin_next_action text,
  add column admin_due_date date,
  add constraint clinahir_leads_follow_up_pair check (
    (admin_next_action is null and admin_due_date is null)
    or (admin_next_action is not null and length(btrim(admin_next_action)) between 1 and 240 and admin_due_date is not null)
  );

create index clinahir_leads_follow_up_due_idx
  on public.clinahir_leads (admin_due_date, external_id)
  where admin_due_date is not null and admin_stage in ('new','contacted','qualified');

create or replace function public.clinahir_admin_snapshot(p_search text default '',p_stage text default '',p_page integer default 0)
returns jsonb language sql security invoker set search_path='' as $$
 select jsonb_build_object(
 'leads',coalesce((select jsonb_agg(to_jsonb(t)) from (select external_id,company_name,contact_name,email,phone,city,message,role,priority,form_type,landing_page,utm_source,utm_medium,utm_campaign,submitted_at,daily_command_status,daily_command_attempts,daily_command_last_error,admin_stage,admin_notes,admin_next_action,admin_due_date from public.clinahir_leads
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

create function public.clinahir_admin_edit_lead_follow_up(p_actor uuid,p_id text,p_stage text,p_notes text,p_next_action text,p_due_date date)
returns jsonb language plpgsql security invoker set search_path='' as $$
begin
 if length(p_notes)>5000 or p_stage not in ('new','contacted','qualified','won','lost') then raise exception 'invalid lead update';end if;
 update public.clinahir_leads set admin_stage=p_stage,admin_notes=p_notes,admin_next_action=nullif(btrim(p_next_action),''),admin_due_date=p_due_date where external_id=p_id;
 if not found then raise exception 'lead not found';end if;
 insert into public.clinahir_admin_audit(actor,action,target) values(p_actor,'lead.updated',p_id);
 return jsonb_build_object('ok',true);
end $$;

create function public.clinahir_admin_follow_ups(p_bucket text,p_page integer)
returns jsonb language sql stable security invoker set search_path='' as $$
  with clock as (
    select (now() at time zone 'Africa/Casablanca')::date as today
  ), counts as (
    select count(*) filter (where admin_due_date < today) as overdue,
           count(*) filter (where admin_due_date = today) as today,
           count(*) filter (where admin_due_date > today) as upcoming
    from public.clinahir_leads cross join clock
    where admin_due_date is not null and admin_stage in ('new','contacted','qualified')
  ), selected as (
    select external_id,company_name,contact_name,email,phone,city,message,role,priority,form_type,landing_page,utm_source,utm_medium,utm_campaign,submitted_at,daily_command_status,daily_command_attempts,daily_command_last_error,admin_stage,admin_notes,admin_next_action,admin_due_date
    from public.clinahir_leads cross join clock
    where admin_due_date is not null and admin_stage in ('new','contacted','qualified')
      and case p_bucket
        when 'overdue' then admin_due_date < today
        when 'today' then admin_due_date = today
        when 'upcoming' then admin_due_date > today
        else admin_due_date <= today
      end
    order by admin_due_date,external_id
    limit 10 offset greatest(0,least(p_page,10000))*10
  )
  select jsonb_build_object(
    'counts',(select to_jsonb(counts) from counts),
    'leads',coalesce((select jsonb_agg(to_jsonb(selected) order by admin_due_date, external_id) from selected),'[]'::jsonb),
    'today',(select today from clock)
  );
$$;

revoke all on function public.clinahir_admin_edit_lead_follow_up(uuid,text,text,text,text,date),
  public.clinahir_admin_follow_ups(text,integer) from public,anon,authenticated;
grant execute on function public.clinahir_admin_edit_lead_follow_up(uuid,text,text,text,text,date),
  public.clinahir_admin_follow_ups(text,integer) to service_role;

notify pgrst, 'reload schema';
commit;
