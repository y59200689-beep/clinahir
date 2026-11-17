-- Execute INSIDE the application's restore transaction, before commit.
-- Preserve Supabase provider objects and unrelated schemas/tables.
do $$
declare object record;
begin
 for object in select n.nspname,c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where (n.nspname='public' and left(c.relname,9)='clinahir_') or n.nspname='clinahir_staging_fixture'
 loop
  if exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname=object.nspname and c.relname=object.relname and c.relkind='S') then
   execute format('revoke all on sequence %I.%I from public,anon,authenticated',object.nspname,object.relname);
  elsif exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname=object.nspname and c.relname=object.relname and c.relkind in ('r','p','v','m','f')) then
   execute format('revoke all on table %I.%I from public,anon,authenticated',object.nspname,object.relname);
  end if;
 end loop;
 for object in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and left(p.proname,9)='clinahir_' and p.prokind='f'
 loop
  execute format('revoke all on function %s from public,anon,authenticated',object.signature);
 end loop;
end $$;
