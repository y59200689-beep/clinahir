-- Read-only catalog review for owner-confirmed Clinahir project jsagrvxgydvhdoxibzny.
-- No business/patient rows, Auth users, secret settings, writes or schema changes.
begin transaction read only;
select version() as server_version;
select n.nspname as schema_name,c.relname as entity,c.relkind as entity_kind,c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and left(c.relname,9)='clinahir_' and c.relkind in ('r','p','v','m','S')
order by c.relname;
select table_name,column_name,data_type,is_nullable
from information_schema.columns where table_schema='public' and left(table_name,9)='clinahir_'
order by table_name,ordinal_position;
select n.nspname as schema_name,c.relname as entity,k.conname,pg_get_constraintdef(k.oid) as definition
from pg_constraint k join pg_class c on c.oid=k.conrelid join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and left(c.relname,9)='clinahir_' order by c.relname,k.conname;
select tablename,policyname,roles,cmd,qual,with_check
from pg_policies where schemaname='public' and left(tablename,9)='clinahir_' order by tablename,policyname;
select tablename,
 has_table_privilege('anon',format('%I.%I',schemaname,tablename),'SELECT') as anon_select,
 has_table_privilege('anon',format('%I.%I',schemaname,tablename),'INSERT') as anon_insert,
 has_table_privilege('authenticated',format('%I.%I',schemaname,tablename),'SELECT') as authenticated_select,
 has_table_privilege('authenticated',format('%I.%I',schemaname,tablename),'INSERT') as authenticated_insert,
 has_table_privilege('service_role',format('%I.%I',schemaname,tablename),'SELECT') as service_select
from pg_tables where schemaname='public' and left(tablename,9)='clinahir_' order by tablename;
select p.oid::regprocedure as signature,p.prosecdef as security_definer,
 has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
 has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute,
 has_function_privilege('service_role',p.oid,'EXECUTE') as service_execute,
 md5(pg_get_functiondef(p.oid)) as definition_digest
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and left(p.proname,9)='clinahir_' and p.prokind='f' order by 1;
rollback;
