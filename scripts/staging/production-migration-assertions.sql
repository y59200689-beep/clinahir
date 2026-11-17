-- Fictional local-only acceptance. Every probe is rolled back.
begin;
set local role service_role;
do $acceptance$
declare
 legacy_id text := 'cli_11111111-1111-4111-8111-111111111111';
 phone_id text := 'cli_22222222-2222-4222-8222-222222222222';
 test_actor uuid := '33333333-3333-4333-8333-333333333333';
 token uuid := '44444444-4444-4444-8444-444444444444';
 prospect uuid; payload jsonb; result jsonb; before_total bigint;
begin
 select count(*) into before_total from public.clinahir_leads;
 payload := jsonb_build_object('external_id',legacy_id,'company_name','Synthetic legacy acceptance','contact_name','Synthetic contact',
   'email','backup-rehearsal@example.invalid','phone','+12025550123','city','Synthetic city','message','Fictional local-only rehearsal',
   'role','Owner / director','priority','More appointment requests','form_type','demo','landing_page','/',
   'submitted_at',now(),'submission_fingerprint',repeat('a',64));
 perform public.clinahir_capture_lead(payload);
 perform public.clinahir_capture_lead(payload);
 if (select count(*) from public.clinahir_leads)<>before_total+1 then raise exception 'legacy_duplicate_capture';end if;
 if exists(select 1 from public.clinahir_whatsapp_jobs where external_id=legacy_id) then raise exception 'legacy_email_job_created';end if;
 payload := payload || jsonb_build_object('external_id',phone_id,'email',null,'company_name','Synthetic phone acceptance');
 perform public.clinahir_capture_lead(payload);
 perform public.clinahir_capture_lead(payload);
 if (select count(*) from public.clinahir_leads)<>before_total+2 or (select count(*) from public.clinahir_whatsapp_jobs where external_id=phone_id)<>1 then raise exception 'phone_duplicate_capture';end if;
 result := public.clinahir_claim_lead(phone_id,token,now()+interval '1 second');
 if result is null or (result->>'daily_command_attempts')::int<>1 then raise exception 'claim_failed';end if;
 if public.clinahir_claim_lead(phone_id,gen_random_uuid(),now()+interval '1 second') is not null then raise exception 'double_claim';end if;
 if public.clinahir_finish_lead(phone_id,gen_random_uuid(),'synced',null,now(),null) then raise exception 'wrong_token_finish';end if;
 if not public.clinahir_finish_lead(phone_id,token,'pending','synthetic_http_503',null,now()+interval '1 minute') then raise exception 'retry_finish';end if;
 if not exists(select 1 from public.clinahir_leads where external_id=phone_id and daily_command_status='pending' and daily_command_attempts=1 and daily_command_last_error='synthetic_http_503' and daily_command_lock_token is null) then raise exception 'retry_state';end if;
 perform public.clinahir_admin_edit_lead(test_actor,phone_id,'qualified','Synthetic note');
 if not exists(select 1 from public.clinahir_admin_audit where actor=test_actor and action='lead.updated' and target=phone_id) then raise exception 'lead_audit';end if;
 result := public.clinahir_admin_content(test_actor,'{"synthetic":"draft"}'::jsonb,0,false);
 if (result->>'version')::int<>1 or result->'published'<>'null'::jsonb then raise exception 'draft_visibility';end if;
 result := public.clinahir_admin_content(test_actor,'{"synthetic":"stale"}'::jsonb,0,true);
 if result->>'conflict'<>'true' then raise exception 'cms_version_conflict';end if;
 result := public.clinahir_admin_content(test_actor,'{"synthetic":"published"}'::jsonb,1,true);
 if (result->>'version')::int<>2 or result->'published'->>'synthetic'<>'published' then raise exception 'cms_publish';end if;
 payload := '[{"center_name":"Synthetic rehearsal center","city":"Rabat","address":"Fictional address","category":"Synthetic category","website_url":"https://example.invalid","source_name":"Local fictional fixture","source_url":"https://example.invalid/source","source_use_confirmed":true}]'::jsonb;
 result := public.clinahir_admin_import_prospects(test_actor,payload);
 if (result->>'inserted')::int<>1 then raise exception 'prospect_import';end if;
 result := public.clinahir_admin_import_prospects(test_actor,payload);
 if (result->>'duplicates')::int<>1 then raise exception 'prospect_deduplication';end if;
 result := public.clinahir_admin_prospects('Synthetic category','',0,'Rabat','with');
 if (result->>'total')::int<>1 then raise exception 'prospect_filters';end if;
 result := public.clinahir_admin_prospects('','',0,'Rabat','without');
 if (result->>'total')::int<>0 then raise exception 'prospect_website_filter';end if;
 select id into prospect from public.clinahir_prospects where center_name='Synthetic rehearsal center';
 perform public.clinahir_admin_update_prospect(test_actor,prospect,'qualified','Synthetic notes',true,'Fictional local consent fixture');
 perform public.clinahir_admin_update_prospect(test_actor,prospect,'do_not_contact','Synthetic opt out',false,null);
 if not exists(select 1 from public.clinahir_prospects where id=prospect and whatsapp_opt_in_at is null and whatsapp_opt_in_evidence is null and qualification_stage='do_not_contact') then raise exception 'prospect_opt_out';end if;
 result := public.clinahir_admin_snapshot('Synthetic phone acceptance','qualified',0);
 if (result->>'total')::int<>1 then raise exception 'admin_snapshot';end if;
 -- Validate ambiguity handling without contacting any provider.
 update public.clinahir_whatsapp_jobs set lock_token=token,locked_until=now()-interval '1 minute' where external_id=phone_id;
 if public.clinahir_claim_whatsapp(phone_id) is not null then raise exception 'ambiguous_send_reclaimed';end if;
 if not exists(select 1 from public.clinahir_whatsapp_jobs where external_id=phone_id and status='review') then raise exception 'ambiguous_send_not_review';end if;
 perform public.clinahir_record_cron(false);
 if not exists(select 1 from public.clinahir_cron_runs where id and not whatsapp_error) then raise exception 'heartbeat';end if;
end $acceptance$;
rollback;
