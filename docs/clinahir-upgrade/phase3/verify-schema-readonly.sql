-- READ ONLY. Review the target project identity before running. This is not a migration.
-- Run through an authorized database administration session on a dedicated staging project.
begin transaction read only;
select version, name from supabase_migrations.schema_migrations order by version;
select schemaname, tablename, rowsecurity from pg_tables
 where schemaname='public' and tablename like 'clinahir\_%' escape '\' order by tablename;
select table_name, grantee, privilege_type from information_schema.role_table_grants
 where table_schema='public' and table_name like 'clinahir\_%' escape '\'
 and grantee in ('anon','authenticated','service_role','PUBLIC') order by table_name,grantee,privilege_type;
select n.nspname as schema_name,p.proname as function_name,p.prosecdef as security_definer,p.proconfig as function_settings,
 has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
 has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname like 'clinahir\_%' escape '\' order by p.proname;
select c.relname,c.reloptions from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname='public' and c.relkind='v' and c.relname like 'clinahir\_%' escape '\';
rollback;

-- Additional schema compatibility evidence; execute only on the identified staging project.
begin transaction read only;
select schemaname, tablename, indexname, indexdef from pg_catalog.pg_indexes
 where schemaname='public' and tablename like 'clinahir_%' order by tablename,indexname;
select n.nspname,c.relname,con.conname,pg_catalog.pg_get_constraintdef(con.oid) as definition
 from pg_catalog.pg_constraint con join pg_catalog.pg_class c on c.oid=con.conrelid
 join pg_catalog.pg_namespace n on n.oid=c.relnamespace
 where n.nspname='public' and c.relname like 'clinahir_%' order by c.relname,con.conname;
select role_name,c.relname,privilege,
 pg_catalog.has_table_privilege(role_name,c.oid,privilege) as granted
 from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
 cross join (values('anon'),('authenticated')) r(role_name)
 cross join (values('SELECT'),('INSERT'),('UPDATE'),('DELETE')) p(privilege)
 where n.nspname='public' and c.relname like 'clinahir_%' and c.relkind in ('r','v')
 order by role_name,c.relname,privilege;
rollback;
