revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
create table public.clinahir_analytics_events (
 id uuid primary key,
 event_type text not null check(event_type in ('page_view','demo_cta_click')),
 placement text not null check(placement in ('page','hero','solutions','how-it-works','process','about','book-demo','footer','other')),
 language text not null check(language in ('en','fr')),
 created_at timestamptz not null default now()
);
alter table public.clinahir_analytics_events enable row level security;
revoke all on public.clinahir_analytics_events from public,anon,authenticated;
grant select,insert on public.clinahir_analytics_events to service_role;
create index clinahir_analytics_created_idx on public.clinahir_analytics_events(created_at);
create view public.clinahir_conversion_daily with (security_invoker=true) as
with events as (
 select (created_at at time zone 'Africa/Casablanca')::date as day,
 count(*) filter(where event_type='page_view') as page_views,
 count(*) filter(where event_type='demo_cta_click') as demo_cta_clicks
 from public.clinahir_analytics_events group by 1
), leads as (
 select (submitted_at at time zone 'Africa/Casablanca')::date as day,count(*) as demo_submissions
 from public.clinahir_leads where form_type='demo' group by 1
)
select coalesce(e.day,l.day) as day,coalesce(e.page_views,0) as page_views,
coalesce(e.demo_cta_clicks,0) as demo_cta_clicks,coalesce(l.demo_submissions,0) as demo_submissions
from events e full join leads l on e.day=l.day;
revoke all on public.clinahir_conversion_daily from public,anon,authenticated;
grant select on public.clinahir_conversion_daily to service_role;
create function public.clinahir_record_analytics(p_event jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
begin
 insert into public.clinahir_analytics_events(id,event_type,placement,language)
 values((p_event->>'id')::uuid,p_event->>'event_type',p_event->>'placement',p_event->>'language') on conflict(id) do nothing;
 return '{}'::jsonb;
end $$;
revoke all on function public.clinahir_record_analytics(jsonb) from public,anon,authenticated;
grant execute on function public.clinahir_record_analytics(jsonb) to service_role;
