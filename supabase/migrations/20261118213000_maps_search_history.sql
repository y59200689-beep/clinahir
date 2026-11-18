begin;
alter table public.clinahir_maps_jobs add column milestones jsonb
 check (jsonb_typeof(milestones) = 'array' and jsonb_array_length(milestones) <= 5);

create or replace function public.clinahir_maps_job(p_actor uuid,p_op text,p_data jsonb default '{}')
returns jsonb language plpgsql security invoker set search_path='' as $$
declare j public.clinahir_maps_jobs; n integer;
begin
 if p_op in ('start','claim') then
  perform pg_advisory_xact_lock(hashtext('clinahir-maps-'||p_actor::text));
  update public.clinahir_maps_jobs set status='failed',error='The search worker timed out. Captured results are still available.',lease_token=null,updated_at=now()
   where actor=p_actor and status='running' and lease_until<now();
 end if;
 if p_op='start' then
  if exists(select 1 from public.clinahir_maps_jobs where actor=p_actor and status in ('queued','running')) then return jsonb_build_object('conflict',true);end if;
  select count(*) into n from public.clinahir_maps_jobs where actor=p_actor and created_at>now()-interval '1 day';
  if n>=30 then return jsonb_build_object('limited',true);end if;
  insert into public.clinahir_maps_jobs(actor,keywords,city) values(p_actor,p_data->>'keywords',p_data->>'city') returning * into j;
 elsif p_op='latest' then
  select * into j from public.clinahir_maps_jobs where actor=p_actor order by created_at desc limit 1;
 elsif p_op='get' then
  select * into j from public.clinahir_maps_jobs where actor=p_actor and id=(p_data->>'id')::uuid;
 elsif p_op='claim' then
  select * into j from public.clinahir_maps_jobs where actor=p_actor and status='running' and lease_token=(p_data->>'claimToken')::uuid;
  if j.id is not null then return to_jsonb(j);end if;
  select * into j from public.clinahir_maps_jobs where actor=p_actor and status='queued' order by created_at for update skip locked limit 1;
  if j.id is not null then update public.clinahir_maps_jobs set status='running',lease_token=(p_data->>'claimToken')::uuid,lease_until=now()+interval '5 minutes',updated_at=now() where id=j.id returning * into j;end if;
 elsif p_op='stop' then
  update public.clinahir_maps_jobs set status='stopped',lease_token=null,lease_until=null,updated_at=now() where actor=p_actor and id=(p_data->>'id')::uuid and status in ('queued','running') returning * into j;
 elsif p_op in ('progress','finish') then
  update public.clinahir_maps_jobs set
   results=coalesce(p_data->'results',results),
   milestones=coalesce(p_data->'milestones',milestones),
   status=case when p_op='finish' then case when p_data->>'success'='true' then 'completed' when p_data->>'partial'='true' then 'partial' else 'failed' end else status end,
   error=case when p_op='finish' then nullif(p_data->>'error','') else error end,
   lease_until=now()+interval '5 minutes', updated_at=now()
   where actor=p_actor and id=(p_data->>'id')::uuid and lease_token=(p_data->>'token')::uuid and status='running' returning * into j;
 else raise exception 'unsupported maps operation';end if;
 if j.id is null then return null;end if;
 return to_jsonb(j);
end $$;
revoke all on function public.clinahir_maps_job(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.clinahir_maps_job(uuid,text,jsonb) to service_role;

create function public.clinahir_maps_history(p_actor uuid)
returns jsonb language sql security invoker set search_path='' as $$
 select coalesce(jsonb_agg(to_jsonb(j) order by j.created_at desc, j.id desc), '[]'::jsonb)
 from (
  select id, keywords, city, status, created_at, jsonb_array_length(results) as total
  from public.clinahir_maps_jobs where actor=p_actor
  order by created_at desc, id desc limit 12
 ) j;
$$;

create function public.clinahir_maps_matches(p_rows jsonb)
returns jsonb language sql security invoker set search_path='' as $$
 select coalesce(jsonb_agg(matched order by ordinal), '[]'::jsonb)
 from (
  select ordinal, exists (
   select 1 from public.clinahir_prospects
   where normalized_name=lower(regexp_replace(trim(item->>'title'), '\s+', ' ', 'g'))
     and normalized_city=lower(regexp_replace(trim(item->>'city'), '\s+', ' ', 'g'))
  ) as matched
  from jsonb_array_elements(p_rows) with ordinality as rows(item, ordinal)
  where ordinal <= 500
 ) matches;
$$;
revoke all on function public.clinahir_maps_history(uuid), public.clinahir_maps_matches(jsonb) from public, anon, authenticated;
grant execute on function public.clinahir_maps_history(uuid), public.clinahir_maps_matches(jsonb) to service_role;
commit;
