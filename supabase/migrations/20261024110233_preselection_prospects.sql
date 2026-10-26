-- A private, review-first queue for business prospects imported from an approved source.
-- Prospects are deliberately separate from inbound Clinahir form submissions.
create table public.clinahir_prospects (
  id uuid primary key default gen_random_uuid(),
  center_name text not null check (length(trim(center_name)) between 1 and 200),
  city text not null check (length(trim(city)) between 1 and 120),
  phone text check (phone is null or length(phone) <= 40),
  email text check (email is null or (length(email) <= 254 and position('@' in email) > 1)),
  listing_url text check (listing_url is null or listing_url ~ '^https?://'),
  website_url text check (website_url is null or website_url ~ '^https?://'),
  rating numeric(3,2) check (rating is null or rating between 0 and 5),
  review_count integer check (review_count is null or review_count >= 0),
  instagram_url text check (instagram_url is null or instagram_url ~ '^https?://'),
  facebook_url text check (facebook_url is null or facebook_url ~ '^https?://'),
  tiktok_url text check (tiktok_url is null or tiktok_url ~ '^https?://'),
  online_booking_available boolean,
  main_gap text check (main_gap is null or length(main_gap) <= 500),
  gap_evidence text check (gap_evidence is null or length(gap_evidence) <= 1000),
  source_name text not null check (length(trim(source_name)) between 1 and 120),
  source_url text not null check (source_url ~ '^https?://'),
  source_use_confirmed boolean not null default false check (source_use_confirmed),
  qualification_stage text not null default 'review' check (qualification_stage in ('review','qualified','not_a_fit','do_not_contact')),
  whatsapp_opt_in_at timestamptz,
  whatsapp_opt_in_evidence text check (whatsapp_opt_in_evidence is null or length(whatsapp_opt_in_evidence) <= 500),
  notes text not null default '' check (length(notes) <= 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  normalized_name text generated always as (lower(regexp_replace(trim(center_name), '\s+', ' ', 'g'))) stored,
  normalized_city text generated always as (lower(regexp_replace(trim(city), '\s+', ' ', 'g'))) stored,
  unique (normalized_name, normalized_city),
  check ((whatsapp_opt_in_at is null) = (whatsapp_opt_in_evidence is null)),
  check (qualification_stage <> 'do_not_contact' or whatsapp_opt_in_at is null)
);

create index clinahir_prospects_stage_created_idx on public.clinahir_prospects (qualification_stage, created_at desc);
create index clinahir_prospects_city_idx on public.clinahir_prospects (normalized_city);
alter table public.clinahir_prospects enable row level security;
revoke all on public.clinahir_prospects from public, anon, authenticated;
grant select, insert, update, delete on public.clinahir_prospects to service_role;

create function public.clinahir_admin_prospects(p_search text default '', p_stage text default '', p_page integer default 0)
returns jsonb language sql security invoker set search_path = '' as $$
  select jsonb_build_object(
    'prospects', coalesce((select jsonb_agg(to_jsonb(t)) from (
      select id, center_name, city, phone, email, listing_url, website_url, rating, review_count,
        instagram_url, facebook_url, tiktok_url, online_booking_available, main_gap, gap_evidence,
        source_name, source_url, qualification_stage, whatsapp_opt_in_at, whatsapp_opt_in_evidence,
        notes, created_at, updated_at
      from public.clinahir_prospects
      where (p_stage = '' or qualification_stage = p_stage)
        and (p_search = '' or center_name ilike '%' || left(p_search,120) || '%'
          or city ilike '%' || left(p_search,120) || '%'
          or phone ilike '%' || left(p_search,120) || '%')
      order by created_at desc limit 25 offset greatest(0, least(p_page,10000))*25
    ) t), '[]'::jsonb),
    'total', (select count(*) from public.clinahir_prospects
      where (p_stage = '' or qualification_stage = p_stage)
        and (p_search = '' or center_name ilike '%' || left(p_search,120) || '%'
          or city ilike '%' || left(p_search,120) || '%'
          or phone ilike '%' || left(p_search,120) || '%')),
    'counts', (select jsonb_build_object(
      'total', count(*), 'review', count(*) filter (where qualification_stage='review'),
      'qualified', count(*) filter (where qualification_stage='qualified'),
      'opted_in', count(*) filter (where whatsapp_opt_in_at is not null)
    ) from public.clinahir_prospects)
  );
$$;

create function public.clinahir_admin_import_prospects(p_actor uuid, p_rows jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare item jsonb; inserted integer := 0; duplicates integer := 0; batch_id uuid := gen_random_uuid();
begin
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) < 1 or jsonb_array_length(p_rows) > 200 then
    raise exception 'invalid import size';
  end if;
  for item in select value from jsonb_array_elements(p_rows) loop
    insert into public.clinahir_prospects (
      center_name, city, phone, email, listing_url, website_url, rating, review_count,
      instagram_url, facebook_url, tiktok_url, online_booking_available, main_gap, gap_evidence,
      source_name, source_url, source_use_confirmed, notes
    ) values (
      item->>'center_name', item->>'city', nullif(item->>'phone',''), nullif(lower(trim(item->>'email')),''),
      nullif(item->>'listing_url',''), nullif(item->>'website_url',''), nullif(item->>'rating','')::numeric,
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

create function public.clinahir_admin_update_prospect(
  p_actor uuid, p_id uuid, p_stage text, p_notes text,
  p_whatsapp_opt_in boolean, p_opt_in_evidence text
) returns jsonb language plpgsql security invoker set search_path = '' as $$
begin
  if p_stage not in ('review','qualified','not_a_fit','do_not_contact')
    or length(p_notes) > 3000 or (p_whatsapp_opt_in and length(trim(coalesce(p_opt_in_evidence,''))) < 5) then
    raise exception 'invalid prospect update';
  end if;
  update public.clinahir_prospects set
    qualification_stage=p_stage, notes=p_notes, updated_at=now(),
    whatsapp_opt_in_at=case when p_whatsapp_opt_in and p_stage <> 'do_not_contact' then coalesce(whatsapp_opt_in_at,now()) else null end,
    whatsapp_opt_in_evidence=case when p_whatsapp_opt_in and p_stage <> 'do_not_contact' then trim(p_opt_in_evidence) else null end
  where id=p_id;
  if not found then raise exception 'prospect not found'; end if;
  insert into public.clinahir_admin_audit(actor,action,target) values(p_actor,'prospect.updated',p_id::text);
  return jsonb_build_object('ok',true);
end $$;

revoke all on function public.clinahir_admin_prospects(text,text,integer),
  public.clinahir_admin_import_prospects(uuid,jsonb),
  public.clinahir_admin_update_prospect(uuid,uuid,text,text,boolean,text)
  from public, anon, authenticated;
grant execute on function public.clinahir_admin_prospects(text,text,integer),
  public.clinahir_admin_import_prospects(uuid,jsonb),
  public.clinahir_admin_update_prospect(uuid,uuid,text,text,boolean,text)
  to service_role;
