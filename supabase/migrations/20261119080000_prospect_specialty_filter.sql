-- Keep the five-argument RPC for existing deployments and callers.
begin;

create function public.clinahir_admin_prospects(
  p_search text, p_stage text, p_page integer, p_city text, p_website text, p_specialty text
) returns jsonb language sql security invoker set search_path = '' as $$
  with matching as (
    select id, center_name, city, address, category, phone, email, listing_url, website_url, rating, review_count,
      instagram_url, facebook_url, tiktok_url, online_booking_available, main_gap, gap_evidence,
      source_name, source_url, qualification_stage, whatsapp_opt_in_at, whatsapp_opt_in_evidence,
      notes, created_at, updated_at
    from public.clinahir_prospects
    where (p_stage = '' or qualification_stage = p_stage)
      and (p_city = '' or normalized_city = lower(trim(left(p_city,120))))
      and (p_website = '' or (p_website = 'with' and website_url is not null) or (p_website = 'without' and website_url is null))
      and (p_specialty = '' or lower(trim(category)) = lower(trim(p_specialty)))
      and (p_search = '' or center_name ilike '%' || left(p_search,120) || '%'
        or city ilike '%' || left(p_search,120) || '%'
        or address ilike '%' || left(p_search,120) || '%'
        or category ilike '%' || left(p_search,120) || '%'
        or phone ilike '%' || left(p_search,120) || '%'
        or email ilike '%' || left(p_search,120) || '%')
  ), page as (
    select * from matching order by created_at desc, id desc
    limit 25 offset greatest(0, least(p_page,10000))*25
  )
  select jsonb_build_object(
    'prospects', coalesce((select jsonb_agg(to_jsonb(page) order by created_at desc, id desc) from page), '[]'::jsonb),
    'total', (select count(*) from matching),
    'specialties', coalesce((select jsonb_agg(label order by label) from (
      select min(trim(category)) as label from public.clinahir_prospects
      where trim(category) <> '' group by lower(trim(category))
    ) categories), '[]'::jsonb),
    'cities', coalesce((select jsonb_agg(city order by city) from (select distinct city from public.clinahir_prospects) cities), '[]'::jsonb),
    'counts', (select jsonb_build_object(
      'total', count(*), 'review', count(*) filter (where qualification_stage = 'review'),
      'qualified', count(*) filter (where qualification_stage = 'qualified'),
      'opted_in', count(*) filter (where whatsapp_opt_in_at is not null),
      'no_website', count(*) filter (where website_url is null)
    ) from public.clinahir_prospects)
  );
$$;

revoke all on function public.clinahir_admin_prospects(text,text,integer,text,text,text) from public, anon, authenticated;
grant execute on function public.clinahir_admin_prospects(text,text,integer,text,text,text) to service_role;

commit;
