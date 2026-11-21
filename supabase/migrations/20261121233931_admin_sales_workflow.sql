begin;

alter table public.clinahir_leads
  add column admin_demo_status text not null default 'unscheduled',
  add column admin_demo_date date,
  add column admin_loss_reason text,
  add column admin_ever_qualified boolean not null default false,
  add constraint clinahir_lead_demo_valid check (
    (admin_demo_status = 'unscheduled' and admin_demo_date is null) or
    (admin_demo_status in ('scheduled','held','missed') and admin_demo_date is not null)
  ),
  add constraint clinahir_lead_loss_reason_length check (length(admin_loss_reason) <= 500);

update public.clinahir_leads set admin_ever_qualified = true
where admin_stage in ('qualified','won');

create function public.clinahir_record_qualification()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.admin_stage in ('qualified','won') then
    new.admin_ever_qualified := true;
  end if;
  return new;
end;
$$;

create trigger clinahir_record_qualification before update of admin_stage on public.clinahir_leads
for each row execute function public.clinahir_record_qualification();

create function public.clinahir_admin_lead_sales(p_id text)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object('status', admin_demo_status, 'date', admin_demo_date, 'lossReason', admin_loss_reason)
  from public.clinahir_leads where external_id = p_id;
$$;

create function public.clinahir_admin_edit_lead_sales(p_actor uuid,p_id text,p_status text,p_date date,p_loss_reason text)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  update public.clinahir_leads
  set admin_demo_status = p_status, admin_demo_date = p_date, admin_loss_reason = nullif(btrim(p_loss_reason),'')
  where external_id = p_id;
  if not found then raise exception 'lead not found'; end if;
  insert into public.clinahir_admin_audit(actor,action,target) values(p_actor,'lead.updated',p_id);
  return true;
end;
$$;

create function public.clinahir_admin_contact_follow_up(
  p_id uuid,p_lead_id text,p_actor uuid,p_channel text,p_outcome text,p_note text,p_next_action text,p_due_date date
)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from public.clinahir_leads where external_id = p_lead_id for no key update;
  if not found then raise exception 'lead not found'; end if;
  insert into public.clinahir_lead_contacts(id,lead_id,actor,channel,outcome,note)
  values (p_id,p_lead_id,p_actor,p_channel,p_outcome,p_note)
  on conflict (id) do nothing;
  if found then
    update public.clinahir_leads set admin_next_action = p_next_action, admin_due_date = p_due_date
    where external_id = p_lead_id;
    insert into public.clinahir_admin_audit(actor,action,target) values(p_actor,'lead.updated',p_lead_id);
  end if;
  return true;
end;
$$;

create function public.clinahir_admin_today_queue(p_bucket text,p_page integer)
returns jsonb language sql stable security invoker set search_path = '' as $$
  with base as (
    select public.clinahir_admin_follow_ups(p_bucket,p_page) as data
  ), unanswered as (
    select l.* from public.clinahir_leads l
    where l.admin_stage = 'new' and not exists (
      select 1 from public.clinahir_lead_contacts c where c.lead_id = l.external_id
    )
  ), items as (
    select external_id,company_name,contact_name,email,phone,city,message,role,priority,form_type,landing_page,
           utm_source,utm_medium,utm_campaign,submitted_at,daily_command_status,daily_command_attempts,
           daily_command_last_error,admin_stage,admin_notes,admin_next_action,admin_due_date
    from unanswered where p_bucket = 'unanswered'
    order by submitted_at,external_id limit 10 offset greatest(0,least(p_page,10000))*10
  )
  select base.data || jsonb_build_object(
    'counts', (base.data->'counts') || jsonb_build_object('unanswered',(select count(*) from unanswered)),
    'leads', case when p_bucket = 'unanswered' then
      coalesce((select jsonb_agg(to_jsonb(items) order by submitted_at,external_id) from items),'[]'::jsonb)
      else base.data->'leads' end
  ) from base;
$$;

create function public.clinahir_admin_match_phone(p_phone text)
returns text language sql immutable set search_path = '' as $$
  with normalized as (select regexp_replace(coalesce(p_phone,''),'[[:space:]().-]','','g') as phone)
  select case
    when phone ~ '^0[5-7][0-9]{8}$' then '212' || substring(phone from 2)
    when phone ~ '^(\+|00)?212[5-7][0-9]{8}$' then right(phone,12)
    when phone ~ '^(\+|00)[1-9][0-9]{7,14}$' then regexp_replace(phone,'^(\+|00)','')
  end from normalized;
$$;

create function public.clinahir_admin_prospect_matches(p_id uuid)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(to_jsonb(matches) order by submitted_at desc,external_id),'[]'::jsonb)
  from (
    select l.external_id,l.company_name,l.contact_name,l.email,l.phone,l.city,l.message,l.role,l.priority,
           l.form_type,l.landing_page,l.utm_source,l.utm_medium,l.utm_campaign,l.submitted_at,
           l.daily_command_status,l.daily_command_attempts,l.daily_command_last_error,
           l.admin_stage,l.admin_notes,l.admin_next_action,l.admin_due_date
    from public.clinahir_prospects p join public.clinahir_leads l on
      (nullif(lower(btrim(p.email)),'') = lower(btrim(l.email))
      or public.clinahir_admin_match_phone(p.phone) = public.clinahir_admin_match_phone(l.phone))
    where p.id = p_id
    order by l.submitted_at desc,l.external_id limit 10
  ) matches;
$$;

create function public.clinahir_admin_sales_report()
returns jsonb language sql stable security invoker set search_path = '' as $$
  with sources as (
    select coalesce(nullif(lower(btrim(l.utm_source)),''), 'Direct / unknown') as source,
           count(*) as inquiries,
           count(*) filter (where l.admin_ever_qualified) as qualified,
           count(*) filter (where l.admin_demo_status = 'held') as held,
           count(*) filter (where l.admin_stage = 'won') as won,
           count(*) filter (where l.admin_stage in ('new','contacted','qualified')
             and coalesce(l.admin_due_date, '0001-01-01'::date) <= (now() at time zone 'Africa/Casablanca')::date
             and greatest(l.submitted_at,last_contact.created_at) < now() - interval '7 days') as stalled
    from public.clinahir_leads l
    left join lateral (select c.created_at from public.clinahir_lead_contacts c where c.lead_id = l.external_id
      order by c.created_at desc limit 1) last_contact on true
    group by 1
  )
  select coalesce(jsonb_agg(to_jsonb(sources) order by inquiries desc,source),'[]'::jsonb) from sources;
$$;

revoke all on function public.clinahir_record_qualification(), public.clinahir_admin_lead_sales(text),
  public.clinahir_admin_edit_lead_sales(uuid,text,text,date,text),
  public.clinahir_admin_contact_follow_up(uuid,text,uuid,text,text,text,text,date),
  public.clinahir_admin_today_queue(text,integer), public.clinahir_admin_match_phone(text),
  public.clinahir_admin_prospect_matches(uuid), public.clinahir_admin_sales_report()
  from public,anon,authenticated;
grant execute on function public.clinahir_record_qualification(), public.clinahir_admin_lead_sales(text),
  public.clinahir_admin_edit_lead_sales(uuid,text,text,date,text),
  public.clinahir_admin_contact_follow_up(uuid,text,uuid,text,text,text,text,date),
  public.clinahir_admin_today_queue(text,integer), public.clinahir_admin_match_phone(text),
  public.clinahir_admin_prospect_matches(uuid), public.clinahir_admin_sales_report() to service_role;

notify pgrst, 'reload schema';
commit;
