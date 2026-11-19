begin;

alter table public.clinahir_whatsapp_jobs
  drop constraint clinahir_whatsapp_jobs_external_id_fkey,
  add constraint clinahir_whatsapp_jobs_external_id_fkey
    foreign key (external_id) references public.clinahir_leads(external_id) on delete cascade;

create function public.clinahir_admin_delete_record(p_actor uuid, p_kind text, p_id text)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  if p_kind = 'lead' then
    delete from public.clinahir_leads where external_id = p_id;
  elsif p_kind = 'prospect' then
    delete from public.clinahir_prospects where id = p_id::uuid;
  else
    raise exception 'invalid record type';
  end if;

  if not found then return false; end if;
  insert into public.clinahir_admin_audit(actor, action, target)
    values (p_actor, p_kind || '.deleted', p_id);
  return true;
end;
$$;

revoke all on function public.clinahir_admin_delete_record(uuid,text,text) from public, anon, authenticated;
grant execute on function public.clinahir_admin_delete_record(uuid,text,text) to service_role;

create function public.clinahir_admin_delete_records(p_actor uuid, p_kind text, p_ids text[])
returns integer language plpgsql security invoker set search_path = '' as $$
declare
  record_id text;
  deleted_count integer := 0;
begin
  if p_ids is null or cardinality(p_ids) not between 1 and 100 then
    raise exception 'invalid deletion batch size';
  end if;
  for record_id in select distinct id from unnest(p_ids) as records(id) order by id loop
    if public.clinahir_admin_delete_record(p_actor, p_kind, record_id) then
      deleted_count := deleted_count + 1;
    end if;
  end loop;
  return deleted_count;
end;
$$;

revoke all on function public.clinahir_admin_delete_records(uuid,text,text[]) from public, anon, authenticated;
grant execute on function public.clinahir_admin_delete_records(uuid,text,text[]) to service_role;

create function public.clinahir_maps_matched_prospects(p_rows jsonb)
returns jsonb language sql security invoker set search_path='' as $$
 select coalesce(jsonb_agg(prospect_id order by ordinal), '[]'::jsonb)
 from (
  select ordinal, (
   select id from public.clinahir_prospects
   where normalized_name=lower(regexp_replace(trim(item->>'title'), '\s+', ' ', 'g'))
     and normalized_city=lower(regexp_replace(trim(item->>'city'), '\s+', ' ', 'g'))
  ) as prospect_id
  from jsonb_array_elements(p_rows) with ordinality as rows(item, ordinal)
  where ordinal <= 500
 ) matches;
$$;
revoke all on function public.clinahir_maps_matched_prospects(jsonb) from public, anon, authenticated;
grant execute on function public.clinahir_maps_matched_prospects(jsonb) to service_role;

commit;
