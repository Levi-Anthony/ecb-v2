-- Deterministic tests on the designated BRAIN, in one ROLLBACK transaction.
-- No user/token/credential/grant fixture persists or represents real login.
begin;
insert into auth.users(id,email,email_confirmed_at,role,aud) values
 ('00000000-0000-4000-8000-000000000101','eco218-fixture@example.invalid',now(),'authenticated','authenticated');
insert into auth.oauth_clients(id,registration_type,redirect_uris,grant_types,client_name,client_type,token_endpoint_auth_method) values
 ('00000000-0000-4000-8000-000000000102','dynamic','https://claude.ai/api/mcp/auth_callback','authorization_code,refresh_token','ECO-218 fixture','public','none');
insert into auth.oauth_authorizations(id,authorization_id,client_id,user_id,redirect_uri,scope,resource,code_challenge,code_challenge_method,status,expires_at) values
 ('00000000-0000-4000-8000-000000000105','eco218-fixture','00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000101',
 'https://claude.ai/api/mcp/auth_callback','email','https://ecb-v2-eight.vercel.app/api/mcp',repeat('a',43),'s256','pending',now()+interval '10 minutes');
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000101","role":"authenticated"}',true);
do $$ begin
  if (public.ecb218_oauth_context()->>'enrolled')::boolean then raise exception 'unapproved_user_enrolled'; end if;
  begin
    perform public.ecb218_oauth_approve('eco218-fixture',array['recover']);
    raise exception 'unapproved_user_granted';
  exception when insufficient_privilege then null; end;
end $$;
insert into ecb_oauth.principals(subject,enrollment_basis) values('00000000-0000-4000-8000-000000000101','transactional qualification fixture only');
do $$ declare grant_id uuid; begin
  begin
    perform public.ecb218_oauth_approve('eco218-fixture',array['admin']);
    raise exception 'admin_capability_granted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.ecb218_oauth_approve('eco218-fixture',array['recover','recover']);
    raise exception 'duplicate_capability_granted';
  exception when invalid_parameter_value then null; end;
  grant_id := public.ecb218_oauth_approve('eco218-fixture',array['recover']);
  if grant_id is null then raise exception 'valid_capability_denied'; end if;
  update auth.oauth_authorizations set resource='https://other.example/mcp' where authorization_id='eco218-fixture';
  begin
    perform public.ecb218_oauth_approve('eco218-fixture',array['preserve']);
    raise exception 'wrong_resource_granted';
  exception when insufficient_privilege then null; end;
  update auth.oauth_authorizations set resource='https://ecb-v2-eight.vercel.app/api/mcp',status='approved' where authorization_id='eco218-fixture';
  if not public.ecb218_oauth_authorization_valid('eco218-fixture') then raise exception 'approved_request_denied'; end if;
end $$;
-- Second real consumer policy and a deliberately invented third-consumer
-- fixture verify configuration extension without another auth implementation.
insert into auth.oauth_clients(id,registration_type,redirect_uris,grant_types,client_name,client_type,token_endpoint_auth_method) values
 ('00000000-0000-4000-8000-000000000202','dynamic','https://chatgpt.com/connector/oauth/qualification-client','authorization_code,refresh_token','ChatGPT fixture','public','none'),
 ('00000000-0000-4000-8000-000000000302','dynamic','https://additional-consumer.example/callback','authorization_code,refresh_token','Invented consumer fixture','public','none');
insert into auth.oauth_authorizations(id,authorization_id,client_id,user_id,redirect_uri,scope,resource,code_challenge,code_challenge_method,status,expires_at) values
 ('00000000-0000-4000-8000-000000000205','eco218-chatgpt-fixture','00000000-0000-4000-8000-000000000202','00000000-0000-4000-8000-000000000101','https://chatgpt.com/connector/oauth/qualification-client','email','https://ecb-v2-eight.vercel.app/api/mcp',repeat('a',43),'s256','pending',now()+interval '10 minutes'),
 ('00000000-0000-4000-8000-000000000305','eco218-additional-fixture','00000000-0000-4000-8000-000000000302','00000000-0000-4000-8000-000000000101','https://additional-consumer.example/callback','email','https://ecb-v2-eight.vercel.app/api/mcp',repeat('a',43),'s256','pending',now()+interval '10 minutes');
do $$ begin
  perform public.ecb218_oauth_approve('eco218-chatgpt-fixture',array['recover']);
  begin
    perform public.ecb218_oauth_approve('eco218-additional-fixture',array['recover']);
    raise exception 'unknown_consumer_allowed';
  exception when insufficient_privilege then null; end;
end $$;
insert into ecb_oauth.consumer_policies(consumer,redirect_uri_pattern,capability_ceiling,source) values
 ('Invented qualification consumer','^https://additional-consumer\.example/callback$',array['recover'],'transactional qualification fixture only');
do $$ begin
  perform public.ecb218_oauth_approve('eco218-additional-fixture',array['recover']);
  begin
    perform public.ecb218_oauth_approve('eco218-additional-fixture',array['preserve']);
    raise exception 'consumer_capability_ceiling_ignored';
  exception when insufficient_privilege then null; end;
  perform public.ecb218_oauth_revoke('00000000-0000-4000-8000-000000000202');
  if not exists(select 1 from ecb_oauth.grants where client_id='00000000-0000-4000-8000-000000000102' and revoked_at is null)
    or not exists(select 1 from ecb_oauth.grants where client_id='00000000-0000-4000-8000-000000000302' and revoked_at is null) then
    raise exception 'consumer_revocation_coupled';
  end if;
end $$;
insert into auth.oauth_consents(id,user_id,client_id,scopes) values
 ('00000000-0000-4000-8000-000000000106','00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000102','email');
insert into auth.sessions(id,user_id,oauth_client_id,aal,created_at,updated_at) values
 ('00000000-0000-4000-8000-000000000103','00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000102','aal1',now(),now());

-- The connected database role cannot SET ROLE supabase_auth_admin. Verify its
-- required privileges here; actual provider invocation remains real-flow evidence.
do $$ begin
  if not has_schema_privilege('supabase_auth_admin','ecb_oauth','usage')
    or not has_function_privilege('supabase_auth_admin','ecb_oauth.access_token_hook(jsonb)','execute')
    or not has_table_privilege('supabase_auth_admin','ecb_oauth.principals','select')
    or not has_table_privilege('supabase_auth_admin','ecb_oauth.consumer_policies','select')
    or not has_table_privilege('supabase_auth_admin','ecb_oauth.grants','select')
    or not has_table_privilege('supabase_auth_admin','auth.oauth_consents','select')
    or not has_table_privilege('supabase_auth_admin','auth.oauth_clients','select')
    or not has_table_privilege('supabase_auth_admin','auth.users','select') then raise exception 'provider_hook_privileges_missing'; end if;
end $$;

-- The synthetic runtime verifier exists only inside this rollback transaction.
-- Other sessions keep seeing the unchanged committed verifier through MVCC.
update ecb11.runtime_capability set key_digest=extensions.digest(convert_to('eco218-fixture-runtime','UTF8'),'sha256');
select set_config('request.headers','{"x-ecb-runtime-key":"eco218-fixture-runtime"}',true);
do $$ declare grant_id uuid; output jsonb; regular jsonb := '{"claims":{"sub":"00000000-0000-4000-8000-000000000101","aud":"authenticated","user_metadata":{"ecb_capabilities":["admin"]}}}'; begin
  select id into grant_id from ecb_oauth.grants where subject='00000000-0000-4000-8000-000000000101' and client_id='00000000-0000-4000-8000-000000000102' and revoked_at is null;
  if public.ecb218_oauth_check('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000103',grant_id,'https://ecb-v2-eight.vercel.app/api/mcp') is distinct from array['recover'] then raise exception 'valid_session_denied'; end if;
  if public.ecb218_oauth_check('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000103',grant_id,'https://other.example/mcp') is not null then raise exception 'wrong_resource_allowed'; end if;
  output := ecb_oauth.access_token_hook('{"authentication_method":"token_refresh","claims":{"sub":"00000000-0000-4000-8000-000000000101","client_id":"00000000-0000-4000-8000-000000000102","aud":"authenticated"}}');
  if output->'claims'->>'aud' <> 'https://ecb-v2-eight.vercel.app/api/mcp' or output->'claims'->'ecb_capabilities' <> '["recover"]'::jsonb then raise exception 'hook_binding_failed'; end if;
  if ecb_oauth.access_token_hook(regular) is distinct from regular then raise exception 'ordinary_login_changed'; end if;
  update auth.users set banned_until=now()+interval '1 hour' where id='00000000-0000-4000-8000-000000000101';
  if public.ecb218_oauth_check('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000103',grant_id,'https://ecb-v2-eight.vercel.app/api/mcp') is not null then raise exception 'banned_user_allowed'; end if;
  begin
    perform public.ecb218_oauth_context();
    raise exception 'banned_user_consent_allowed';
  exception when invalid_authorization_specification then null; end;
  update auth.users set banned_until=null where id='00000000-0000-4000-8000-000000000101';
  update ecb_oauth.principals set enabled=false where subject='00000000-0000-4000-8000-000000000101';
  if public.ecb218_oauth_check('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000103',grant_id,'https://ecb-v2-eight.vercel.app/api/mcp') is not null then raise exception 'disabled_principal_allowed'; end if;
  update ecb_oauth.principals set enabled=true where subject='00000000-0000-4000-8000-000000000101';
  update auth.oauth_consents set revoked_at=now() where client_id='00000000-0000-4000-8000-000000000102';
  if public.ecb218_oauth_check('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000103',grant_id,'https://ecb-v2-eight.vercel.app/api/mcp') is not null then raise exception 'native_revocation_ignored'; end if;
  update auth.oauth_consents set revoked_at=null where client_id='00000000-0000-4000-8000-000000000102';
  update auth.sessions set not_after=now()-interval '1 second' where id='00000000-0000-4000-8000-000000000103';
  if public.ecb218_oauth_check('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000103',grant_id,'https://ecb-v2-eight.vercel.app/api/mcp') is not null then raise exception 'expired_session_allowed'; end if;
  update auth.sessions set not_after=null where id='00000000-0000-4000-8000-000000000103';
  perform public.ecb218_oauth_revoke('00000000-0000-4000-8000-000000000102');
  if public.ecb218_oauth_check('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000103',grant_id,'https://ecb-v2-eight.vercel.app/api/mcp') is not null then raise exception 'application_revocation_ignored'; end if;
  if not exists(select 1 from jsonb_array_elements(public.ecb218_oauth_context()->'grants') connection
    where connection->>'client_id'='00000000-0000-4000-8000-000000000102' and (connection->>'disconnect_pending')::boolean) then raise exception 'disconnect_retry_lost'; end if;
  update auth.oauth_consents set revoked_at=now() where client_id='00000000-0000-4000-8000-000000000102';
  if exists(select 1 from jsonb_array_elements(public.ecb218_oauth_context()->'grants') connection
    where connection->>'client_id'='00000000-0000-4000-8000-000000000102') then raise exception 'finished_disconnect_still_listed'; end if;
  perform set_config('request.headers','{}',true);
  begin
    perform public.ecb218_oauth_check('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000103',grant_id,'https://ecb-v2-eight.vercel.app/api/mcp');
    raise exception 'missing_runtime_key_allowed';
  exception when invalid_authorization_specification then null; end;
  if has_function_privilege('anon','public.ecb218_oauth_approve(text,text[])','execute') or has_function_privilege('authenticated','ecb_oauth.access_token_hook(jsonb)','execute')
    or has_table_privilege('authenticated','ecb_oauth.principals','insert') then raise exception 'unauthorized_surface_exposed'; end if;
end $$;
rollback;
