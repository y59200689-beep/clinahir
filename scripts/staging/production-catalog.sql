-- Deterministic application metadata only. Excludes provider objects and data.
select jsonb_build_object(
 'columns',(select jsonb_agg(to_jsonb(x) order by table_name,ordinal_position) from (
   select table_name,column_name,ordinal_position,data_type,is_nullable,column_default,is_identity,is_generated,generation_expression
   from information_schema.columns where table_schema='public' and left(table_name,9)='clinahir_') x),
 'relations',(select jsonb_agg(to_jsonb(x) order by relname) from (
   select c.relname,c.relkind,c.relrowsecurity,c.relforcerowsecurity,c.reloptions,
   case when c.relkind='v' then pg_get_viewdef(c.oid,true) end as view_definition
   from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and left(c.relname,9)='clinahir_' and c.relkind in ('r','p','v','m','S')) x),
 'constraints',(select jsonb_agg(to_jsonb(x) order by entity,conname) from (
   select c.relname as entity,k.conname,pg_get_constraintdef(k.oid) as definition
   from pg_constraint k join pg_class c on c.oid=k.conrelid join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and left(c.relname,9)='clinahir_') x),
 'indexes',(select jsonb_agg(to_jsonb(x) order by indexname) from (
   select tablename,indexname,indexdef from pg_indexes where schemaname='public' and left(tablename,9)='clinahir_') x),
 'routines',(select jsonb_agg(to_jsonb(x) order by signature) from (
   select p.oid::regprocedure::text as signature,pg_get_functiondef(p.oid) as definition,p.prosecdef,
   has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
   has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute,
   has_function_privilege('service_role',p.oid,'EXECUTE') as service_execute
   from pg_proc p join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and left(p.proname,9)='clinahir_' and p.prokind='f') x),
 'triggers',(select jsonb_agg(to_jsonb(x) order by entity,tgname) from (
   select c.relname as entity,t.tgname,pg_get_triggerdef(t.oid) as definition
   from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and left(c.relname,9)='clinahir_' and not t.tgisinternal) x),
 'policies',(select jsonb_agg(to_jsonb(x) order by tablename,policyname) from (
   select tablename,policyname,roles,cmd,qual,with_check from pg_policies where schemaname='public' and left(tablename,9)='clinahir_') x),
 'grants',(select jsonb_agg(to_jsonb(x) order by table_name,grantee,privilege_type) from (
   select table_name,grantee,privilege_type,is_grantable from information_schema.table_privileges
   where table_schema='public' and left(table_name,9)='clinahir_' and grantee in ('PUBLIC','anon','authenticated','service_role')) x)
) as catalog;
