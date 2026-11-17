-- REVIEW CANDIDATE ONLY. No hosted execution approved.
-- Source: jsagrvxgydvhdoxibzny; backup 2026-11-16T23-30-09-724Z.
-- Keep outside supabase/migrations: historical local files target a different baseline.
-- One explicit transaction; guard aborts on drift or reapplication.
begin;
set local lock_timeout='5s';
set local statement_timeout='120s';
do $guard$
declare actual jsonb;
begin
 select catalog into actual from (select jsonb_build_object(
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
) as catalog) baseline;
 if actual is distinct from $baseline${"grants":[{"grantee":"service_role","table_name":"clinahir_analytics_events","is_grantable":"NO","privilege_type":"DELETE"},{"grantee":"service_role","table_name":"clinahir_analytics_events","is_grantable":"NO","privilege_type":"INSERT"},{"grantee":"service_role","table_name":"clinahir_analytics_events","is_grantable":"NO","privilege_type":"REFERENCES"},{"grantee":"service_role","table_name":"clinahir_analytics_events","is_grantable":"NO","privilege_type":"SELECT"},{"grantee":"service_role","table_name":"clinahir_analytics_events","is_grantable":"NO","privilege_type":"TRIGGER"},{"grantee":"service_role","table_name":"clinahir_analytics_events","is_grantable":"NO","privilege_type":"TRUNCATE"},{"grantee":"service_role","table_name":"clinahir_analytics_events","is_grantable":"NO","privilege_type":"UPDATE"},{"grantee":"service_role","table_name":"clinahir_conversion_daily","is_grantable":"NO","privilege_type":"DELETE"},{"grantee":"service_role","table_name":"clinahir_conversion_daily","is_grantable":"NO","privilege_type":"INSERT"},{"grantee":"service_role","table_name":"clinahir_conversion_daily","is_grantable":"NO","privilege_type":"REFERENCES"},{"grantee":"service_role","table_name":"clinahir_conversion_daily","is_grantable":"NO","privilege_type":"SELECT"},{"grantee":"service_role","table_name":"clinahir_conversion_daily","is_grantable":"NO","privilege_type":"TRIGGER"},{"grantee":"service_role","table_name":"clinahir_conversion_daily","is_grantable":"NO","privilege_type":"TRUNCATE"},{"grantee":"service_role","table_name":"clinahir_conversion_daily","is_grantable":"NO","privilege_type":"UPDATE"},{"grantee":"service_role","table_name":"clinahir_lead_limits","is_grantable":"NO","privilege_type":"DELETE"},{"grantee":"service_role","table_name":"clinahir_lead_limits","is_grantable":"NO","privilege_type":"INSERT"},{"grantee":"service_role","table_name":"clinahir_lead_limits","is_grantable":"NO","privilege_type":"REFERENCES"},{"grantee":"service_role","table_name":"clinahir_lead_limits","is_grantable":"NO","privilege_type":"SELECT"},{"grantee":"service_role","table_name":"clinahir_lead_limits","is_grantable":"NO","privilege_type":"TRIGGER"},{"grantee":"service_role","table_name":"clinahir_lead_limits","is_grantable":"NO","privilege_type":"TRUNCATE"},{"grantee":"service_role","table_name":"clinahir_lead_limits","is_grantable":"NO","privilege_type":"UPDATE"},{"grantee":"service_role","table_name":"clinahir_leads","is_grantable":"NO","privilege_type":"DELETE"},{"grantee":"service_role","table_name":"clinahir_leads","is_grantable":"NO","privilege_type":"INSERT"},{"grantee":"service_role","table_name":"clinahir_leads","is_grantable":"NO","privilege_type":"REFERENCES"},{"grantee":"service_role","table_name":"clinahir_leads","is_grantable":"NO","privilege_type":"SELECT"},{"grantee":"service_role","table_name":"clinahir_leads","is_grantable":"NO","privilege_type":"TRIGGER"},{"grantee":"service_role","table_name":"clinahir_leads","is_grantable":"NO","privilege_type":"TRUNCATE"},{"grantee":"service_role","table_name":"clinahir_leads","is_grantable":"NO","privilege_type":"UPDATE"}],"columns":[{"data_type":"uuid","table_name":"clinahir_analytics_events","column_name":"id","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":null,"ordinal_position":1,"generation_expression":null},{"data_type":"text","table_name":"clinahir_analytics_events","column_name":"event_type","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":null,"ordinal_position":2,"generation_expression":null},{"data_type":"text","table_name":"clinahir_analytics_events","column_name":"placement","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":null,"ordinal_position":3,"generation_expression":null},{"data_type":"text","table_name":"clinahir_analytics_events","column_name":"language","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":null,"ordinal_position":4,"generation_expression":null},{"data_type":"timestamp with time zone","table_name":"clinahir_analytics_events","column_name":"created_at","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":"now()","ordinal_position":5,"generation_expression":null},{"data_type":"date","table_name":"clinahir_conversion_daily","column_name":"day","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":1,"generation_expression":null},{"data_type":"bigint","table_name":"clinahir_conversion_daily","column_name":"page_views","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":2,"generation_expression":null},{"data_type":"bigint","table_name":"clinahir_conversion_daily","column_name":"demo_cta_clicks","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":3,"generation_expression":null},{"data_type":"bigint","table_name":"clinahir_conversion_daily","column_name":"demo_submissions","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":4,"generation_expression":null},{"data_type":"text","table_name":"clinahir_lead_limits","column_name":"identifier","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":null,"ordinal_position":1,"generation_expression":null},{"data_type":"timestamp with time zone","table_name":"clinahir_lead_limits","column_name":"window_started_at","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":null,"ordinal_position":2,"generation_expression":null},{"data_type":"integer","table_name":"clinahir_lead_limits","column_name":"requests","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":null,"ordinal_position":3,"generation_expression":null},{"data_type":"uuid","table_name":"clinahir_leads","column_name":"id","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":"gen_random_uuid()","ordinal_position":1,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"external_id","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":"('cli_'::text || (gen_random_uuid())::text)","ordinal_position":2,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"company_name","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":null,"ordinal_position":3,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"contact_name","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":4,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"email","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":null,"ordinal_position":5,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"phone","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":6,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"city","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":7,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"message","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":8,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"role","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":9,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"priority","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":10,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"form_type","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":"'demo'::text","ordinal_position":11,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"landing_page","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":12,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"utm_source","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":13,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"utm_medium","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":14,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"utm_campaign","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":15,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"submission_fingerprint","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":16,"generation_expression":null},{"data_type":"timestamp with time zone","table_name":"clinahir_leads","column_name":"submitted_at","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":"now()","ordinal_position":17,"generation_expression":null},{"data_type":"timestamp with time zone","table_name":"clinahir_leads","column_name":"created_at","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":"now()","ordinal_position":18,"generation_expression":null},{"data_type":"timestamp with time zone","table_name":"clinahir_leads","column_name":"updated_at","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":"now()","ordinal_position":19,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"daily_command_status","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":"'pending'::text","ordinal_position":20,"generation_expression":null},{"data_type":"integer","table_name":"clinahir_leads","column_name":"daily_command_attempts","is_identity":"NO","is_nullable":"NO","is_generated":"NEVER","column_default":"0","ordinal_position":21,"generation_expression":null},{"data_type":"timestamp with time zone","table_name":"clinahir_leads","column_name":"daily_command_synced_at","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":22,"generation_expression":null},{"data_type":"text","table_name":"clinahir_leads","column_name":"daily_command_last_error","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":23,"generation_expression":null},{"data_type":"timestamp with time zone","table_name":"clinahir_leads","column_name":"daily_command_next_attempt_at","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":"now()","ordinal_position":24,"generation_expression":null},{"data_type":"uuid","table_name":"clinahir_leads","column_name":"daily_command_lock_token","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":25,"generation_expression":null},{"data_type":"timestamp with time zone","table_name":"clinahir_leads","column_name":"daily_command_lock_expires_at","is_identity":"NO","is_nullable":"YES","is_generated":"NEVER","column_default":null,"ordinal_position":26,"generation_expression":null}],"indexes":[{"indexdef":"CREATE INDEX clinahir_analytics_created_idx ON public.clinahir_analytics_events USING btree (created_at)","indexname":"clinahir_analytics_created_idx","tablename":"clinahir_analytics_events"},{"indexdef":"CREATE UNIQUE INDEX clinahir_analytics_events_pkey ON public.clinahir_analytics_events USING btree (id)","indexname":"clinahir_analytics_events_pkey","tablename":"clinahir_analytics_events"},{"indexdef":"CREATE INDEX clinahir_lead_limits_expiry_idx ON public.clinahir_lead_limits USING btree (window_started_at)","indexname":"clinahir_lead_limits_expiry_idx","tablename":"clinahir_lead_limits"},{"indexdef":"CREATE UNIQUE INDEX clinahir_lead_limits_pkey ON public.clinahir_lead_limits USING btree (identifier)","indexname":"clinahir_lead_limits_pkey","tablename":"clinahir_lead_limits"},{"indexdef":"CREATE INDEX clinahir_leads_email_idx ON public.clinahir_leads USING btree (email)","indexname":"clinahir_leads_email_idx","tablename":"clinahir_leads"},{"indexdef":"CREATE UNIQUE INDEX clinahir_leads_external_id_key ON public.clinahir_leads USING btree (external_id)","indexname":"clinahir_leads_external_id_key","tablename":"clinahir_leads"},{"indexdef":"CREATE UNIQUE INDEX clinahir_leads_pkey ON public.clinahir_leads USING btree (id)","indexname":"clinahir_leads_pkey","tablename":"clinahir_leads"},{"indexdef":"CREATE INDEX clinahir_leads_retry_idx ON public.clinahir_leads USING btree (daily_command_next_attempt_at) WHERE (daily_command_status = 'pending'::text)","indexname":"clinahir_leads_retry_idx","tablename":"clinahir_leads"},{"indexdef":"CREATE INDEX clinahir_leads_submitted_idx ON public.clinahir_leads USING btree (submitted_at DESC)","indexname":"clinahir_leads_submitted_idx","tablename":"clinahir_leads"}],"policies":null,"routines":[{"prosecdef":false,"signature":"clinahir_allow_lead(text)","definition":"CREATE OR REPLACE FUNCTION public.clinahir_allow_lead(p_identifier text)\n RETURNS boolean\n LANGUAGE plpgsql\n SET search_path TO ''\nAS $function$\ndeclare n integer; t timestamptz := clock_timestamp();\nbegin\n -- Only hashed email identifiers, with bounded ten-minute retention.\n delete from public.clinahir_lead_limits where window_started_at < t-interval '10 minutes';\n insert into public.clinahir_lead_limits as l values(p_identifier,t,1)\n on conflict(identifier) do update set\n requests=case when l.window_started_at<=t-interval '10 minutes' then 1 else l.requests+1 end,\n window_started_at=case when l.window_started_at<=t-interval '10 minutes' then t else l.window_started_at end\n returning requests into n;\n return n<=10;\nend $function$\n","anon_execute":false,"service_execute":true,"authenticated_execute":false},{"prosecdef":false,"signature":"clinahir_capture_lead(jsonb)","definition":"CREATE OR REPLACE FUNCTION public.clinahir_capture_lead(p_record jsonb)\n RETURNS jsonb\n LANGUAGE plpgsql\n SET search_path TO ''\nAS $function$\ndeclare r public.clinahir_leads;\nbegin\n insert into public.clinahir_leads (external_id,company_name,contact_name,email,phone,city,message,role,priority,form_type,landing_page,utm_source,utm_medium,utm_campaign,submitted_at,submission_fingerprint)\n values (p_record->>'external_id',p_record->>'company_name',p_record->>'contact_name',p_record->>'email',p_record->>'phone',p_record->>'city',p_record->>'message',p_record->>'role',p_record->>'priority',p_record->>'form_type',p_record->>'landing_page',p_record->>'utm_source',p_record->>'utm_medium',p_record->>'utm_campaign',(p_record->>'submitted_at')::timestamptz,p_record->>'submission_fingerprint')\n on conflict (external_id) do nothing;\n select * into strict r from public.clinahir_leads where external_id=p_record->>'external_id';\n return to_jsonb(r);\nend $function$\n","anon_execute":false,"service_execute":true,"authenticated_execute":false},{"prosecdef":false,"signature":"clinahir_claim_lead(text,uuid,timestamp with time zone)","definition":"CREATE OR REPLACE FUNCTION public.clinahir_claim_lead(p_id text, p_token uuid, p_now timestamp with time zone)\n RETURNS jsonb\n LANGUAGE plpgsql\n SET search_path TO ''\nAS $function$\ndeclare r public.clinahir_leads;\nbegin\n select * into r from public.clinahir_leads where external_id=p_id for update;\n if not found or r.daily_command_status <> 'pending'\n or r.daily_command_next_attempt_at is null or r.daily_command_next_attempt_at > p_now\n or r.daily_command_lock_expires_at > p_now then return null; end if;\n if r.daily_command_attempts >= 8 then\n  update public.clinahir_leads set daily_command_status='exhausted', daily_command_last_error='attempt_limit_reached',daily_command_next_attempt_at=null,daily_command_lock_token=null,daily_command_lock_expires_at=null where external_id=p_id;\n  return null;\n end if;\n update public.clinahir_leads set daily_command_attempts=daily_command_attempts+1,\n daily_command_lock_token=p_token,daily_command_lock_expires_at=p_now+interval '60 seconds',daily_command_next_attempt_at=p_now+interval '60 seconds'\n where external_id=p_id returning * into r;\n return to_jsonb(r);\nend $function$\n","anon_execute":false,"service_execute":true,"authenticated_execute":false},{"prosecdef":false,"signature":"clinahir_finish_lead(text,uuid,text,text,timestamp with time zone,timestamp with time zone)","definition":"CREATE OR REPLACE FUNCTION public.clinahir_finish_lead(p_id text, p_token uuid, p_status text, p_error text, p_synced_at timestamp with time zone, p_next timestamp with time zone)\n RETURNS boolean\n LANGUAGE plpgsql\n SET search_path TO ''\nAS $function$\nbegin\n update public.clinahir_leads set daily_command_status=p_status,daily_command_last_error=p_error,\n daily_command_synced_at=p_synced_at,daily_command_next_attempt_at=p_next,\n daily_command_lock_token=null,daily_command_lock_expires_at=null\n where external_id=p_id and daily_command_lock_token=p_token;\n return found;\nend $function$\n","anon_execute":false,"service_execute":true,"authenticated_execute":false},{"prosecdef":false,"signature":"clinahir_record_analytics(jsonb)","definition":"CREATE OR REPLACE FUNCTION public.clinahir_record_analytics(p_event jsonb)\n RETURNS jsonb\n LANGUAGE plpgsql\n SET search_path TO ''\nAS $function$\nbegin\n insert into public.clinahir_analytics_events(id,event_type,placement,language)\n values((p_event->>'id')::uuid,p_event->>'event_type',p_event->>'placement',p_event->>'language') on conflict(id) do nothing;\n return '{}'::jsonb;\nend $function$\n","anon_execute":false,"service_execute":true,"authenticated_execute":false},{"prosecdef":false,"signature":"clinahir_replay_lead(text,timestamp with time zone)","definition":"CREATE OR REPLACE FUNCTION public.clinahir_replay_lead(p_id text, p_now timestamp with time zone)\n RETURNS boolean\n LANGUAGE plpgsql\n SET search_path TO ''\nAS $function$\nbegin\n update public.clinahir_leads set daily_command_status='pending',daily_command_attempts=0,\n daily_command_last_error=null,daily_command_next_attempt_at=p_now,daily_command_lock_token=null,daily_command_lock_expires_at=null\n where external_id=p_id and daily_command_status in ('blocked','exhausted')\n and (daily_command_lock_expires_at is null or daily_command_lock_expires_at<=p_now);\n return found;\nend $function$\n","anon_execute":false,"service_execute":true,"authenticated_execute":false},{"prosecdef":false,"signature":"clinahir_update_timestamp()","definition":"CREATE OR REPLACE FUNCTION public.clinahir_update_timestamp()\n RETURNS trigger\n LANGUAGE plpgsql\n SET search_path TO ''\nAS $function$\nbegin\n  new.updated_at = now();\n  return new;\nend;\n$function$\n","anon_execute":true,"service_execute":true,"authenticated_execute":true}],"triggers":[{"entity":"clinahir_leads","tgname":"clinahir_leads_update_timestamp","definition":"CREATE TRIGGER clinahir_leads_update_timestamp BEFORE UPDATE ON public.clinahir_leads FOR EACH ROW EXECUTE FUNCTION clinahir_update_timestamp()"}],"relations":[{"relkind":"r","relname":"clinahir_analytics_events","reloptions":null,"relrowsecurity":true,"view_definition":null,"relforcerowsecurity":false},{"relkind":"v","relname":"clinahir_conversion_daily","reloptions":["security_invoker=true"],"relrowsecurity":false,"view_definition":" WITH events AS (\n         SELECT (clinahir_analytics_events.created_at AT TIME ZONE 'Africa/Casablanca'::text)::date AS day,\n            count(*) FILTER (WHERE clinahir_analytics_events.event_type = 'page_view'::text) AS page_views,\n            count(*) FILTER (WHERE clinahir_analytics_events.event_type = 'demo_cta_click'::text) AS demo_cta_clicks\n           FROM clinahir_analytics_events\n          GROUP BY ((clinahir_analytics_events.created_at AT TIME ZONE 'Africa/Casablanca'::text)::date)\n        ), leads AS (\n         SELECT (clinahir_leads.submitted_at AT TIME ZONE 'Africa/Casablanca'::text)::date AS day,\n            count(*) AS demo_submissions\n           FROM clinahir_leads\n          WHERE clinahir_leads.form_type = 'demo'::text\n          GROUP BY ((clinahir_leads.submitted_at AT TIME ZONE 'Africa/Casablanca'::text)::date)\n        )\n SELECT COALESCE(e.day, l.day) AS day,\n    COALESCE(e.page_views, 0::bigint) AS page_views,\n    COALESCE(e.demo_cta_clicks, 0::bigint) AS demo_cta_clicks,\n    COALESCE(l.demo_submissions, 0::bigint) AS demo_submissions\n   FROM events e\n     FULL JOIN leads l ON e.day = l.day;","relforcerowsecurity":false},{"relkind":"r","relname":"clinahir_lead_limits","reloptions":null,"relrowsecurity":true,"view_definition":null,"relforcerowsecurity":false},{"relkind":"r","relname":"clinahir_leads","reloptions":null,"relrowsecurity":true,"view_definition":null,"relforcerowsecurity":false}],"constraints":[{"entity":"clinahir_analytics_events","conname":"clinahir_analytics_events_event_type_check","definition":"CHECK ((event_type = ANY (ARRAY['page_view'::text, 'demo_cta_click'::text])))"},{"entity":"clinahir_analytics_events","conname":"clinahir_analytics_events_language_check","definition":"CHECK ((language = ANY (ARRAY['en'::text, 'fr'::text])))"},{"entity":"clinahir_analytics_events","conname":"clinahir_analytics_events_pkey","definition":"PRIMARY KEY (id)"},{"entity":"clinahir_analytics_events","conname":"clinahir_analytics_events_placement_check","definition":"CHECK ((placement = ANY (ARRAY['page'::text, 'hero'::text, 'solutions'::text, 'how-it-works'::text, 'process'::text, 'about'::text, 'book-demo'::text, 'footer'::text, 'other'::text])))"},{"entity":"clinahir_lead_limits","conname":"clinahir_lead_limits_identifier_check","definition":"CHECK ((identifier ~ '^[0-9a-f]{64}$'::text))"},{"entity":"clinahir_lead_limits","conname":"clinahir_lead_limits_pkey","definition":"PRIMARY KEY (identifier)"},{"entity":"clinahir_lead_limits","conname":"clinahir_lead_limits_requests_check","definition":"CHECK ((requests > 0))"},{"entity":"clinahir_leads","conname":"clinahir_company_name_not_blank","definition":"CHECK (((length(TRIM(BOTH FROM company_name)) >= 1) AND (length(TRIM(BOTH FROM company_name)) <= 200)))"},{"entity":"clinahir_leads","conname":"clinahir_email_not_blank","definition":"CHECK (((length(TRIM(BOTH FROM email)) >= 3) AND (length(TRIM(BOTH FROM email)) <= 254)))"},{"entity":"clinahir_leads","conname":"clinahir_external_id_format","definition":"CHECK ((external_id ~~ 'cli_%'::text))"},{"entity":"clinahir_leads","conname":"clinahir_fingerprint_format","definition":"CHECK (((submission_fingerprint IS NULL) OR (submission_fingerprint ~ '^[0-9a-f]{64}$'::text)))"},{"entity":"clinahir_leads","conname":"clinahir_leads_daily_command_attempts_check","definition":"CHECK ((daily_command_attempts >= 0))"},{"entity":"clinahir_leads","conname":"clinahir_leads_daily_command_status_check","definition":"CHECK ((daily_command_status = ANY (ARRAY['pending'::text, 'synced'::text, 'blocked'::text, 'exhausted'::text])))"},{"entity":"clinahir_leads","conname":"clinahir_leads_external_id_key","definition":"UNIQUE (external_id)"},{"entity":"clinahir_leads","conname":"clinahir_leads_form_type_check","definition":"CHECK ((form_type = ANY (ARRAY['demo'::text, 'contact'::text, 'consultation'::text, 'booking'::text])))"},{"entity":"clinahir_leads","conname":"clinahir_leads_pkey","definition":"PRIMARY KEY (id)"}]}$baseline$::jsonb then
  raise exception 'production_baseline_mismatch: refresh catalog and rehearse again';
 end if;
end $guard$;

-- Adapted source: 20261020165330_whatsapp_contact_leads.sql
-- Preserve legacy emailed leads; new WhatsApp leads omit email.
alter table public.clinahir_leads alter column email drop not null;
create table public.clinahir_whatsapp_jobs (
 external_id text primary key references public.clinahir_leads(external_id),
 phone text not null, contact_name text not null,
 status text not null default 'pending' check(status in ('pending','accepted','blocked','review','exhausted')),
 attempts integer not null default 0, next_attempt_at timestamptz default now(),
 lock_token uuid, locked_until timestamptz, last_error text, provider_message_id text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.clinahir_whatsapp_jobs enable row level security;
revoke all on public.clinahir_whatsapp_jobs from public,anon,authenticated;
grant select,insert,update on public.clinahir_whatsapp_jobs to service_role;
create index clinahir_whatsapp_due on public.clinahir_whatsapp_jobs(next_attempt_at) where status='pending';
create or replace function public.clinahir_capture_lead(p_record jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare r public.clinahir_leads; inserted integer;
begin
 insert into public.clinahir_leads (external_id,company_name,contact_name,email,phone,city,message,role,priority,form_type,landing_page,utm_source,utm_medium,utm_campaign,submitted_at,submission_fingerprint)
 values (p_record->>'external_id',p_record->>'company_name',p_record->>'contact_name',p_record->>'email',p_record->>'phone',p_record->>'city',p_record->>'message',p_record->>'role',p_record->>'priority',p_record->>'form_type',p_record->>'landing_page',p_record->>'utm_source',p_record->>'utm_medium',p_record->>'utm_campaign',(p_record->>'submitted_at')::timestamptz,p_record->>'submission_fingerprint')
 on conflict (external_id) do nothing;
 get diagnostics inserted = row_count;
 select * into strict r from public.clinahir_leads where external_id=p_record->>'external_id';
 if inserted=1 and r.form_type='demo' and r.email is null and r.contact_name is not null and r.phone like '+%' then
  insert into public.clinahir_whatsapp_jobs(external_id,phone,contact_name)
  values(r.external_id,r.phone,coalesce(r.contact_name,'')) on conflict(external_id) do nothing;
 end if;
 return to_jsonb(r);
end $$;


create function public.clinahir_claim_whatsapp(p_id text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.clinahir_whatsapp_jobs;
begin
 select * into r from public.clinahir_whatsapp_jobs where external_id=p_id for update;
 if not found or r.status<>'pending' or r.next_attempt_at>now() then return null;end if;
 -- A crashed send could have reached Meta. Never automatically resend an ambiguous attempt.
 if r.lock_token is not null then
  if r.locked_until<=now() then update public.clinahir_whatsapp_jobs set status='review',last_error='interrupted_send_review_required',updated_at=now() where external_id=p_id;end if;
  return null;
 end if;
 if r.attempts>=5 then update public.clinahir_whatsapp_jobs set status='exhausted',updated_at=now() where external_id=p_id;return null;end if;
 update public.clinahir_whatsapp_jobs set attempts=attempts+1,lock_token=gen_random_uuid(),locked_until=now()+interval '60 seconds',updated_at=now() where external_id=p_id returning * into r;
 return to_jsonb(r)||jsonb_build_object('token',r.lock_token);
end $$;
create function public.clinahir_finish_whatsapp(p_id text,p_token uuid,p_status text,p_error text,p_message_id text,p_next timestamptz) returns jsonb language plpgsql security invoker set search_path='' as $$
begin
 update public.clinahir_whatsapp_jobs set status=p_status,last_error=p_error,provider_message_id=p_message_id,next_attempt_at=p_next,lock_token=null,locked_until=null,updated_at=now() where external_id=p_id and lock_token=p_token;
 return '{}'::jsonb;
end $$;
revoke all on function public.clinahir_claim_whatsapp(text),public.clinahir_finish_whatsapp(text,uuid,text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.clinahir_claim_whatsapp(text),public.clinahir_finish_whatsapp(text,uuid,text,text,text,timestamptz) to service_role;
create view public.clinahir_delivery_health with(security_invoker=true) as
 select 'daily_command'::text channel,daily_command_status status,count(*) count,min(submitted_at) oldest_at from public.clinahir_leads group by daily_command_status
 union all select 'whatsapp',status,count(*),min(created_at) from public.clinahir_whatsapp_jobs group by status;
revoke all on public.clinahir_delivery_health from public,anon,authenticated;
grant select on public.clinahir_delivery_health to service_role;

-- Private heartbeat, updated only after the authenticated cron finishes processing.
create table public.clinahir_cron_runs (id boolean primary key default true check(id), completed_at timestamptz not null, whatsapp_error boolean not null);
alter table public.clinahir_cron_runs enable row level security;
revoke all on public.clinahir_cron_runs from public,anon,authenticated;
grant select,insert,update on public.clinahir_cron_runs to service_role;
create function public.clinahir_record_cron(p_error boolean) returns jsonb language sql security invoker set search_path='' as $$
 insert into public.clinahir_cron_runs(id,completed_at,whatsapp_error) values(true,now(),p_error)
 on conflict(id) do update set completed_at=excluded.completed_at,whatsapp_error=excluded.whatsapp_error returning jsonb_build_object('ok',true);
$$;
revoke all on function public.clinahir_record_cron(boolean) from public,anon,authenticated;
grant execute on function public.clinahir_record_cron(boolean) to service_role;

-- Adapted source: 20261020171750_clinahir_admin_workspace.sql
-- Private owner workspace; apply after the WhatsApp migration.
alter table public.clinahir_leads add column admin_stage text not null default 'new' check(admin_stage in ('new','contacted','qualified','won','lost'));
alter table public.clinahir_leads add column admin_notes text not null default '';
-- Existing equivalent production submitted_at index is retained.
create table public.clinahir_site_content (
 id boolean primary key default true check(id), draft jsonb, published jsonb,
 version integer not null default 0, updated_at timestamptz not null default now(), published_at timestamptz
);
insert into public.clinahir_site_content(id) values(true);
create table public.clinahir_admin_audit (
 id bigint generated always as identity primary key, actor uuid not null,
 action text not null, target text not null, created_at timestamptz not null default now()
);
alter table public.clinahir_site_content enable row level security;
alter table public.clinahir_admin_audit enable row level security;
revoke all on public.clinahir_site_content,public.clinahir_admin_audit from public,anon,authenticated;
grant select,insert,update on public.clinahir_site_content to service_role;
grant select,insert on public.clinahir_admin_audit to service_role;
grant usage,select on sequence public.clinahir_admin_audit_id_seq to service_role;
create function public.clinahir_admin_snapshot(p_search text default '',p_stage text default '',p_page integer default 0)
returns jsonb language sql security invoker set search_path='' as $$
 select jsonb_build_object(
 'leads',coalesce((select jsonb_agg(to_jsonb(t)) from (select external_id,company_name,contact_name,email,phone,city,message,role,priority,form_type,landing_page,utm_source,utm_medium,utm_campaign,submitted_at,daily_command_status,daily_command_attempts,daily_command_last_error,admin_stage,admin_notes from public.clinahir_leads
 where (p_stage='' or admin_stage=p_stage) and (p_search='' or company_name ilike '%'||left(p_search,120)||'%' or contact_name ilike '%'||left(p_search,120)||'%' or phone ilike '%'||left(p_search,120)||'%' or email ilike '%'||left(p_search,120)||'%')
 order by submitted_at desc limit 25 offset greatest(0,least(p_page,10000))*25)t),'[]'::jsonb),
 'total',(select count(*) from public.clinahir_leads where (p_stage='' or admin_stage=p_stage) and (p_search='' or company_name ilike '%'||left(p_search,120)||'%' or contact_name ilike '%'||left(p_search,120)||'%' or phone ilike '%'||left(p_search,120)||'%' or email ilike '%'||left(p_search,120)||'%')),
 'summary',(select jsonb_build_object('total',count(*),'new',count(*) filter(where admin_stage='new'),'qualified',count(*) filter(where admin_stage='qualified'),'won',count(*) filter(where admin_stage='won'),'attention',count(*) filter(where daily_command_status in ('blocked','exhausted'))) from public.clinahir_leads),
 'analytics',coalesce((select jsonb_agg(to_jsonb(t)) from (select * from public.clinahir_conversion_daily where day>=current_date-29 order by day)t),'[]'::jsonb),
 'sources',coalesce((select jsonb_agg(to_jsonb(t)) from (select coalesce(utm_source,'Direct / unknown') source,count(*) count from public.clinahir_leads group by 1 order by 2 desc limit 8)t),'[]'::jsonb),
 'health',coalesce((select jsonb_agg(to_jsonb(t)) from public.clinahir_delivery_health t),'[]'::jsonb),
 'heartbeat',(select completed_at from public.clinahir_cron_runs where id=true),
 'whatsapp',coalesce((select jsonb_agg(to_jsonb(t)) from (select external_id,status,attempts,last_error,provider_message_id,updated_at from public.clinahir_whatsapp_jobs order by updated_at desc limit 25)t),'[]'::jsonb),
 'audit',coalesce((select jsonb_agg(to_jsonb(t)) from (select id,action,target,created_at from public.clinahir_admin_audit order by id desc limit 50)t),'[]'::jsonb)
 );
$$;
create function public.clinahir_admin_edit_lead(p_actor uuid,p_id text,p_stage text,p_notes text)
returns jsonb language plpgsql security invoker set search_path='' as $$
begin
 if length(p_notes)>5000 or p_stage not in ('new','contacted','qualified','won','lost') then raise exception 'invalid lead update';end if;
 update public.clinahir_leads set admin_stage=p_stage,admin_notes=p_notes where external_id=p_id;
 if not found then raise exception 'lead not found';end if;
 insert into public.clinahir_admin_audit(actor,action,target) values(p_actor,'lead.updated',p_id);
 return jsonb_build_object('ok',true);
end $$;
create function public.clinahir_admin_content(p_actor uuid,p_content jsonb,p_version integer,p_publish boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare result public.clinahir_site_content;
begin
 update public.clinahir_site_content set draft=p_content,published=case when p_publish then p_content else published end,
 version=version+1,updated_at=now(),published_at=case when p_publish then now() else published_at end where id=true and version=p_version returning * into result;
 if not found then return jsonb_build_object('conflict',true);end if;
 insert into public.clinahir_admin_audit(actor,action,target) values(p_actor,case when p_publish then 'website.published' else 'website.draft_saved' end,'website');
 return to_jsonb(result);
end $$;
create function public.clinahir_admin_replay(p_actor uuid,p_id text,p_channel text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare changed boolean;
begin
 if p_channel='daily_command' then
  select public.clinahir_replay_lead(p_id,now()) into changed;
 elsif p_channel='whatsapp' then
  update public.clinahir_whatsapp_jobs set status='pending',attempts=0,next_attempt_at=now(),lock_token=null,locked_until=null,last_error=null,updated_at=now()
  where external_id=p_id and status in ('blocked','exhausted') and lock_token is null;
  changed=found;
 else raise exception 'invalid channel';end if;
 if not changed then return jsonb_build_object('conflict',true);end if;
 insert into public.clinahir_admin_audit(actor,action,target) values(p_actor,p_channel||'.requeued',p_id);
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.clinahir_admin_snapshot(text,text,integer),public.clinahir_admin_edit_lead(uuid,text,text,text),public.clinahir_admin_content(uuid,jsonb,integer,boolean),public.clinahir_admin_replay(uuid,text,text) from public,anon,authenticated;
grant execute on function public.clinahir_admin_snapshot(text,text,integer),public.clinahir_admin_edit_lead(uuid,text,text,text),public.clinahir_admin_content(uuid,jsonb,integer,boolean),public.clinahir_admin_replay(uuid,text,text) to service_role;

-- Adapted source: 20261024110233_preselection_prospects.sql
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

-- Install only the final five-argument prospects listing RPC below.

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

revoke all on function public.clinahir_admin_import_prospects(uuid,jsonb),
  public.clinahir_admin_update_prospect(uuid,uuid,text,text,boolean,text)
  from public, anon, authenticated;
grant execute on function public.clinahir_admin_import_prospects(uuid,jsonb),
  public.clinahir_admin_update_prospect(uuid,uuid,text,text,boolean,text)
  to service_role;

-- Adapted source: 20261026090000_prospect_address_category_and_filters.sql
-- Preserve the location and business category from the Google Maps prospect sheet.
alter table public.clinahir_prospects
  add column if not exists address text check (address is null or length(address) <= 500),
  add column if not exists category text check (category is null or length(category) <= 120);

-- Replace the old RPC signature so city and website filters are applied before pagination.
-- No old signature exists on this production baseline; no function is dropped.
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

-- Preserve original tables, IDs, constraints, indexes, triggers and outbox state.
-- Explicitly close all Clinahir browser-role grants; service_role remains server-only.
do $private$
declare routine record;
begin
 for routine in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and left(p.proname,9)='clinahir_' and p.prokind='f' loop
  execute format('revoke all on function %s from public,anon,authenticated',routine.signature);
  execute format('grant execute on function %s to service_role',routine.signature);
 end loop;
end $private$;
commit;
