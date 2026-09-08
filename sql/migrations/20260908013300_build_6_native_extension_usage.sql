-- BUILD 6 construction correction — minimum dependency privilege.
--
-- The private SECURITY DEFINER functions are owned by ecb_governance_native and call the already-
-- accepted predecessor's pgcrypto functions through the `extensions` schema. Runtime callers must
-- not receive direct extension-schema access merely because those functions need it.

grant usage on schema extensions to ecb_governance_native;

do $check$
begin
  if not pg_catalog.has_schema_privilege(
      'ecb_governance_native', 'extensions', 'USAGE') then
    raise exception 'BUILD 6 native owner lacks required extensions schema usage';
  end if;
  if pg_catalog.has_schema_privilege(
      'ecb_governance_verifier', 'extensions', 'USAGE')
     or pg_catalog.has_schema_privilege(
      'ecb_governance_executor', 'extensions', 'USAGE') then
    raise exception 'BUILD 6 leaked direct extensions schema usage to runtime roles';
  end if;
end;
$check$;
