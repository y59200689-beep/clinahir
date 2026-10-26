-- Preserve the location and business category from the Google Maps prospect sheet.
alter table public.clinahir_prospects
  add column if not exists address text check (address is null or length(address) <= 500),
  add column if not exists category text check (category is null or length(category) <= 120);

-- Replace the old RPC signature so city and website filters are applied before pagination.
drop function if exists public.clinahir_admin_prospects(text, text, integer);
create function public.clinahir_admin_prospects(
  p_search text default '', p_stage text default '', p_page integer default 0,
  p_city text default '', p_website text default ''
) returns jsonb language sql security invoker set search_path = '' as $$
  select jsonb_build_object(
    'prospects', coalesce((select jsonb_agg(to_jsonb(t)) from (
      select id, center_name, city, address, category, phone, email, listing_url, website_url, rating, review_count,
        instagram_url, facebook_url, tiktok_url, online_booking_available, main_gap, gap_evidence,
        source_name, source_url, qualification_stage, whatsapp_opt_in_at, whatsapp_opt_in_evidence,
        notes, created_at, updated_at
      from public.clinahir_prospects
      where (p_stage = '' or qualification_stage = p_stage)
        and (p_city = '' or normalized_city = lower(trim(left(p_city,120))))
        and (p_website = '' or (p_website = 'with' and website_url is not null) or (p_website = 'without' and website_url is null))
        and (p_search = '' or center_name ilike '%' || left(p_search,120) || '%'
          or city ilike '%' || left(p_search,120) || '%'
          or address ilike '%' || left(p_search,120) || '%'
          or category ilike '%' || left(p_search,120) || '%'
          or phone ilike '%' || left(p_search,120) || '%'
          or email ilike '%' || left(p_search,120) || '%')
      order by created_at desc limit 25 offset greatest(0, least(p_page,10000))*25
    ) t), '[]'::jsonb),
    'total', (select count(*) from public.clinahir_prospects
      where (p_stage = '' or qualification_stage = p_stage)
        and (p_city = '' or normalized_city = lower(trim(left(p_city,120))))
        and (p_website = '' or (p_website = 'with' and website_url is not null) or (p_website = 'without' and website_url is null))
        and (p_search = '' or center_name ilike '%' || left(p_search,120) || '%'
          or city ilike '%' || left(p_search,120) || '%'
          or address ilike '%' || left(p_search,120) || '%'
          or category ilike '%' || left(p_search,120) || '%'
          or phone ilike '%' || left(p_search,120) || '%'
          or email ilike '%' || left(p_search,120) || '%')),
    'cities', coalesce((select jsonb_agg(city order by city) from (select distinct city from public.clinahir_prospects) c), '[]'::jsonb),
    'counts', (select jsonb_build_object(
      'total', count(*), 'review', count(*) filter (where qualification_stage='review'),
      'qualified', count(*) filter (where qualification_stage='qualified'),
      'opted_in', count(*) filter (where whatsapp_opt_in_at is not null),
      'no_website', count(*) filter (where website_url is null)
    ) from public.clinahir_prospects)
  );
$$;

create or replace function public.clinahir_admin_import_prospects(p_actor uuid, p_rows jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare item jsonb; inserted integer := 0; duplicates integer := 0; batch_id uuid := gen_random_uuid();
begin
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) < 1 or jsonb_array_length(p_rows) > 500 then
    raise exception 'invalid import size';
  end if;
  for item in select value from jsonb_array_elements(p_rows) loop
    insert into public.clinahir_prospects (
      center_name, city, address, category, phone, email, listing_url, website_url, rating, review_count,
      instagram_url, facebook_url, tiktok_url, online_booking_available, main_gap, gap_evidence,
      source_name, source_url, source_use_confirmed, notes
    ) values (
      item->>'center_name', item->>'city', nullif(item->>'address',''), nullif(item->>'category',''),
      nullif(item->>'phone',''), nullif(lower(trim(item->>'email')),''), nullif(item->>'listing_url',''),
      nullif(item->>'website_url',''), nullif(item->>'rating','')::numeric,
      nullif(item->>'review_count','')::integer, nullif(item->>'instagram_url',''), nullif(item->>'facebook_url',''),
      nullif(item->>'tiktok_url',''), nullif(item->>'online_booking_available','')::boolean,
      nullif(item->>'main_gap',''), nullif(item->>'gap_evidence',''), item->>'source_name', item->>'source_url',
      coalesce((item->>'source_use_confirmed')::boolean,false), coalesce(item->>'notes','')
    ) on conflict (normalized_name, normalized_city) do nothing;
    if found then inserted := inserted + 1; else duplicates := duplicates + 1; end if;
  end loop;
  insert into public.clinahir_admin_audit(actor,action,target)
    values(p_actor,'prospects.imported',batch_id::text || ':' || inserted::text || ':' || duplicates::text);
  return jsonb_build_object('inserted',inserted,'duplicates',duplicates);
end $$;

revoke all on function public.clinahir_admin_prospects(text,text,integer,text,text),
  public.clinahir_admin_import_prospects(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.clinahir_admin_prospects(text,text,integer,text,text),
  public.clinahir_admin_import_prospects(uuid,jsonb) to service_role;
