-- Isolated synthetic acceptance fixture. Not a production application migration.
create schema if not exists clinahir_staging_fixture;
revoke all on schema clinahir_staging_fixture from public,anon,authenticated;
grant usage on schema clinahir_staging_fixture to service_role;
create table if not exists clinahir_staging_fixture.control(id boolean primary key default true check(id),mode text not null check(mode in ('healthy','outage','timeout','accepted-but-unacknowledged')));
create table if not exists clinahir_staging_fixture.receipts(external_id text primary key,fingerprint text not null,attempts integer not null default 1);
alter table clinahir_staging_fixture.control enable row level security;
alter table clinahir_staging_fixture.receipts enable row level security;
grant all on all tables in schema clinahir_staging_fixture to service_role;
insert into clinahir_staging_fixture.control values(true,'healthy') on conflict do nothing;
create or replace function public.clinahir_staging_receiver(p_action text,p_external_id text default null,p_fingerprint text default null,p_mode text default null) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare current_mode text;existing text;
begin
 if p_action='mode' then
  update clinahir_staging_fixture.control set mode=p_mode where id=true;
  return jsonb_build_object('ok',true);
 end if;
 if p_external_id !~ '^cli_[0-9a-f-]{36}$' then raise exception 'invalid_synthetic_id';end if;
 if p_action='receipt' then return jsonb_build_object('externalId',p_external_id,'receiptCount',(select count(*) from clinahir_staging_fixture.receipts where external_id=p_external_id));end if;
 if p_action<>'record' or p_fingerprint !~ '^[0-9a-f]{64}$' then raise exception 'invalid_action';end if;
 select mode into current_mode from clinahir_staging_fixture.control where id=true;
 if current_mode in ('outage','timeout') then return jsonb_build_object('mode',current_mode);end if;
 insert into clinahir_staging_fixture.receipts values(p_external_id,p_fingerprint,1) on conflict(external_id) do update set attempts=clinahir_staging_fixture.receipts.attempts+1;
 select fingerprint into existing from clinahir_staging_fixture.receipts where external_id=p_external_id;
 return jsonb_build_object('mode',current_mode,'conflict',existing<>p_fingerprint);
end$$;
revoke all on function public.clinahir_staging_receiver(text,text,text,text) from public,anon,authenticated;
grant execute on function public.clinahir_staging_receiver(text,text,text,text) to service_role;
